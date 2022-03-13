"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async getOrderTemplatesByUser(id, skip, limit) {
    let entities = await strapi
      .query("order-template")
      .model.find({
        user: id,
      })
      .skip(skip)
      .limit(limit);

    return entities;
  },
};
