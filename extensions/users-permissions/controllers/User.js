"use strict";
const { sanitizeEntity } = require("strapi-utils");

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
};
