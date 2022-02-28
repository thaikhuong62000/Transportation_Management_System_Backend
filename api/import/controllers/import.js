"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    const { page = 0 } = ctx.query;
    const { storage } = ctx.state.user;

    let imports = await strapi.services.import.getImportByStorage(
      storage,
      5,
      page * 5
    );

    return imports.map((item) =>
      sanitizeEntity(item, {
        model: strapi.query("import").model,
      })
    );
  },
};
