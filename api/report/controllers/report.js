"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async update(ctx) {
    const { id } = ctx.params;
    const stockerId = ctx.state.user.id;
    const storageId = ctx.state.user.storage;

    const { note = "", ...props } = ctx.request.body;

    let report = await strapi.query("report").update(
      {
        id: id,
      },
      {
        note,
        stocker: stockerId,
        storage: storageId,
      }
    );

    return sanitizeEntity(report, {
      model: strapi.models.report,
      includeFields: ["total_export", "total_import", "note"],
    });
  },
};
