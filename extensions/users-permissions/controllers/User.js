"use strict";
const { sanitizeEntity } = require("strapi-utils");
const validateUploadBody = require("strapi-plugin-upload/controllers/validation/upload");

module.exports = {
  async getCustomerInfo(ctx) {
    const { id } = ctx.params;
    const customer = await strapi.plugins[
      "users-permissions"
    ].services.user.getCustomer(id); // Get user info
    return sanitizeEntity(customer, {
      model: strapi.query("user", "users-permissions").model,
      includeFields: ["name", "phone"],
    });
  },

  async updatePassword(ctx) {
    const { id } = ctx.params;
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
    ].services.user.updatePassword(id, hashedPassword);

    return sanitizeEntity(updatedPassword, {
      model: strapi.query("user", "users-permissions").model,
    });
  },

  /**
   * Uploading new Image, remove old image
   * Set new Image to current user.
   *
   * @return {Object}
   */
  async updateAvatar(ctx) {
    // Validate
    const {
      request: {
        body = {},
        files: { avatar: _avatar },
      },
    } = ctx;

    console.log(_avatar);

    if (_avatar === undefined) {
      return ctx.badRequest(null, {
        errors: [
          {
            id: "User.updateAvatar",
            message: "Avatar is undefined",
          },
        ],
      });
    }
    if (Array.isArray(_avatar)) {
      return ctx.badRequest(null, {
        errors: [
          {
            id: "User.updateAvatar",
            message: "Cannot upload multiple avatar",
          },
        ],
      });
    }

    const mime = require("mime");
    const type = mime.getType(_avatar.name);
    if (type.split("/")[0] !== "image") {
      return ctx.badRequest(null, {
        errors: [
          {
            id: "User.updateAvatar",
            message: "Avatar must be image",
          },
        ],
      });
    }

    const avatar = { ..._avatar, type: type };
    const userId = ctx.state.user.id;
    const avatarExist = ctx.state.user.avatar && ctx.state.user.avatar.id;

    // Replace Or Upload image
    if (avatarExist) {
      ctx.query.id = ctx.state.user.avatar.id;
      const image = await strapi.plugins.upload.services.upload.replace(
        ctx.state.user.avatar.id,
        {
          data: await validateUploadBody(body),
          file: avatar,
        }
      );
      const sanitizedImage = sanitizeEntity(image, {
        model: strapi.getModel("file", "upload"),
        includeFields: ["name", "url", "formats"],
      });
      return { ...ctx.state.user, avatar: sanitizedImage };
    } else {
      const image = await strapi.plugins.upload.services.upload.upload({
        data: await validateUploadBody(body),
        files: avatar,
      });
      return await strapi.plugins["users-permissions"].services.user.edit(
        { id: userId },
        { avatar: image[0].id }
      );
    }
  },
};
