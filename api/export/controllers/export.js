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

  async updateExportQuantityByPackage(ctx) {
    const { packageId, quantity } = ctx.request.body;
    const { id, storage } = ctx.state.user;

    if (!quantity && quantity < 0) {
      return ctx.badRequest([
        {
          id: "export.updateExportQuantityByPackage",
          message: "Invalid package quantity",
        },
      ]);
    }

    let exportedPackage = await strapi
      .query("export")
      .model.findOneAndUpdate(
        { package: packageId },
        { quantity: quantity },
        { new: true }
      );

    if (!exportedPackage) {
      let newExport = await strapi.query("export").create({
        package: packageId,
        quantity: quantity,
        store_manager: id,
        storage: storage,
      });

      return sanitizeEntity(newExport, {
        model: strapi.query("export").model,
        includeFields: ["quantity"],
      });
    }

    return sanitizeEntity(exportedPackage, {
      model: strapi.query("export").model,
      includeFields: ["quantity"],
    });
  },
};
