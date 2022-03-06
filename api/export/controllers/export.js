"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async getCurrentExport(ctx) {
    let shipments = await strapi.services.shipment.find(
      {
        _where: [
          { from_storage: ctx.state.user.storage },
          { to_storage_null: true },
          { arrived_time_null: true },
        ],
      },
      [{ path: "car" }]
    );

    return shipments.map((entity) => {
      const {
        from_address,
        id,
        car: { licence },
      } = entity;
      return { id, from_address, licence };
    });
  },

  async find(ctx) {
    const { page = 0 } = ctx.query;
    const { storage } = ctx.state.user;

    let exports = await strapi.services.export.getExportByStorage(
      storage,
      5,
      page * 5
    );

    return exports.map((item) =>
      sanitizeEntity(item, {
        model: strapi.query("export").model,
      })
    );
  },
};
