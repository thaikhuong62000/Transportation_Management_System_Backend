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
        { package: packageId },
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

    // Update package and storage state when export
    let store = await strapi.services.storage.findOne({ id: storage });
    let { city } = store.address;
    let order = await strapi.services.order.findOne({ id: pack.order.id });

    if (quantity === pack.quantity) {
      await strapi.services.package.update(
        { id: packageId },
        {
          state:
            pack.state === 1 ? 2 : order.to_address.city === city ? 3 : 2,
        }
      );

      let orderState = Math.min(...order.packages.map((item) => item.state));
      let endStorage = order.packages.every(
        (item) => item.current_address.city === order.to_address.city
      );

      if (orderState === order.state + 1) {
        await strapi.services.order.update(
          { id: order.id },
          { state: order.state === 1 ? 2 : endStorage ? 3 : 2 }
        );
      }
    }

    return sanitizeEntity(exportedPackage, {
      model: strapi.query("export").model,
      includeFields: ["quantity"],
    });
  },
};
