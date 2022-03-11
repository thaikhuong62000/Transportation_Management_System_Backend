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

    const { total_import, total_export, note = "" } = ctx.request.body;

    if (
      !total_import ||
      total_import < 0 ||
      !total_export ||
      total_export < 0
    ) {
      return ctx.badRequest("Invalid parameter!");
    }

    let report = await strapi.query("report").update(
      {
        id: id,
      },
      {
        total_export,
        total_import,
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

  async find(ctx) {
    const { page = 0 } = ctx.query;
    const { storage } = ctx.state.user;

    let reports = await strapi.services.report.getReportByStorage(
      storage,
      5,
      page * 5
    );

    return reports.map((report) =>
      sanitizeEntity(report, {
        model: strapi.query("report").model,
        includeFields: [
          "storage",
          "stocker",
          "total_import",
          "total_export",
          "note",
        ],
      })
    );
  },
};
