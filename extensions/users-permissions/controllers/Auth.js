"use strict";
const { sanitizeEntity } = require("strapi-utils");

const sanitizeUser = (user) =>
  sanitizeEntity(user, {
    model: strapi.query("user", "users-permissions").model,
  });

const formatPhone = (phone) => {
  if (phone.slice(0, 3) === "+84") {
    return "0" + phone.slice(3);
  } else return phone;
};

module.exports = {
  async phoneAuth(ctx) {
    const { code } = ctx.query;
    try {
      const decodedToken = await strapi.firebase.verifyIdToken(code);
      if (decodedToken.phone_number) {
        let jwt;
        let user = await strapi.plugins[
          "users-permissions"
        ].services.user.fetch({
          phone: formatPhone(decodedToken.phone_number),
        });
        if (user) {
          user = sanitizeUser(user);

          jwt = strapi.plugins["users-permissions"].services.jwt.issue({
            id: user.id,
          });

          ctx.body = {
            user,
            jwt,
          };
        } else {
          const pluginStore = await strapi.store({
            environment: "",
            type: "plugin",
            name: "users-permissions",
          });

          const settings = await pluginStore.get({
            key: "advanced",
          });

          const role = await strapi
            .query("role", "users-permissions")
            .findOne({ type: settings.default_role }, []);

          const params = {};
          params.role = role.id;
          params.phone = formatPhone(decodedToken.phone_number);
          params.username = formatPhone(decodedToken.phone_number);
          params.confirmed = true;
          params.name = "";

          let user = await strapi
            .query("user", "users-permissions")
            .create(params);
          if (user) {
            user = sanitizeUser(user);
            jwt = strapi.plugins["users-permissions"].services.jwt.issue({
              id: user.id,
            });

            ctx.body = {
              user,
              jwt,
            };
          } else {
            throw "User empty";
          }
        }
      } else {
        throw "Phone missing";
      }
    } catch (error) {
      return ctx.badRequest(null, [{ messages: [{ id: "unauthorized" }] }]);
    }
  },

  async updatePassword(ctx) {
    const { password, newPassword } = ctx.request.body;

    const validPassword = await strapi.plugins[
      "users-permissions"
    ].services.user.validatePassword(password, ctx.state.user.password);

    if (!validPassword) {
      return ctx.badRequest("Current password invalid!");
    }

    const hashedPassword = await strapi.plugins[
      "users-permissions"
    ].services.user.hashPassword({
      password: newPassword,
    });

    const updatedPassword = await strapi.plugins[
      "users-permissions"
    ].services.user.updatePassword(ctx.state.user.id, hashedPassword);

    return sanitizeEntity(updatedPassword, {
      model: strapi.query("user", "users-permissions").model,
    });
  },

  async resetPasswordPhone(ctx) {
    const { token, newPassword } = ctx.request.body;
    try {
      const decodedToken = await strapi.firebase.verifyIdToken(token);
      if (decodedToken.phone_number) {
        let user = await strapi.plugins[
          "users-permissions"
        ].services.user.fetch({
          phone: formatPhone(decodedToken.phone_number),
        });
        if (user) {
          const hashedPassword = await strapi.plugins[
            "users-permissions"
          ].services.user.hashPassword({
            password: newPassword,
          });
          await strapi.plugins[
            "users-permissions"
          ].services.user.updatePassword(user.id, hashedPassword);
          return {
            statue: 205,
            message: "Password reset",
          };
        } else {
          throw "User empty";
        }
      } else {
        throw "Phone missing";
      }
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, [{ messages: [{ id: "unauthorized" }] }]);
    }
  },
};
