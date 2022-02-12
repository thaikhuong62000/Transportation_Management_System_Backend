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
};
