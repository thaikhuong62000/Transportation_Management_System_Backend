"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    const { page = 0, size = 5 } = ctx.query;
    const { storage } = ctx.state.user;

    let exports = await strapi.services.export.getExportByStorage(
      storage,
      size,
      page * size
    );

    return exports.map((item) =>
      sanitizeEntity(item, {
        model: strapi.query("export").model,
      })
    );
  },
};
