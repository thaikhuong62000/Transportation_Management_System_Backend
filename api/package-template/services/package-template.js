"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async getPackageTemplatesByUser(id, skip, limit) {
    let entities = await strapi
      .query("package-template")
      .model.find({
        user: id,
      })
      .skip(skip)
      .limit(limit);

    return entities;
  },
};
