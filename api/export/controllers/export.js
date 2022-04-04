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
      [{ path: "driver", populate: "car" }]
    );

    return shipments.map((entity) => {
      const {
        from_address,
        id,
        driver: { car },
      } = entity;
      return { id, from_address, licence: car.licence };
    });
  },

  async updateExportQuantityByPackage(ctx) {
    const { packageId, quantity } = ctx.request.body;
    const { id, storage } = ctx.state.user;

    let pack = await strapi.services.package.findOne({ id: packageId });
    if (!pack) {
      return ctx.badRequest([
        {
          id: "import.updateẼportQuantityByPackage",
          message: "invalid QR code",
        },
      ]);
    }

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
        { package: packageId, storage: storage },
        { quantity: quantity },
        { new: true }
      );

    if (!exportedPackage) {
      exportedPackage = await strapi.query("export").create({
        package: packageId,
        quantity: quantity,
        store_manager: id,
        storage: storage,
      });
    }

    return sanitizeEntity(exportedPackage, {
      model: strapi.query("export").model,
      includeFields: ["quantity"],
    });
  },
};
