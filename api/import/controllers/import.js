"use strict";
const { sanitizeEntity } = require("strapi-utils");
var mongoose = require("mongoose");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async getCurrentImport(ctx) {
    let shipments = await strapi.services.shipment.find(
      {
        _where: [
          { to_storage: ctx.state.user.storage },
          { arrived_time_null: true },
        ],
      },
      ["car"]
    );

    return shipments.map((entity) => {
      const { from_address, id, car } = entity;
      return { id, from_address, licence: car?.licence };
    });
  },

  async updateImportQuantityByPackage(ctx) {
    const { packageId, quantity, shipmentItem } = ctx.request.body;
    const { storage, id } = ctx.state.user;

    const db = strapi.connections.default;
    let session;
    const { Package, Import, Order, ShipmentItem } = db.models; // Models

    try {
      let store = await strapi.services.storage.findOne({ id: storage });

      let pack = await strapi.services.package.findOne({ id: packageId });
      if (!pack) {
        throw "invalid QR code";
      }

      const totalImportedPackage = (
        await strapi.services.import.getImporstByPackages([packageId])
      ).reduce((pre, cur) => pre + cur.quantity, 0);

      const order = await strapi.services.order.findOne({
        id: pack.order.id,
      });

      if (!quantity && quantity < 0) {
        throw "Invalid package quantity";
      }

      session = await db.startSession();
      session.startTransaction();

      let importedPackage = await Import.create(
        [
          {
            package: packageId,
            quantity: quantity,
            store_manager: id,
            storage: storage,
          },
        ],
        { session: session }
      );

      let shipment_item = await ShipmentItem.findOneAndUpdate({
        _id: shipmentItem
      }, {
        received: quantity
      })

      if (!shipment_item) {
        throw "Invalid shipment item"
      }

      if (!importedPackage) throw "Create import failed";

      // If all package imported
      if (totalImportedPackage + quantity === pack.quantity) {
        const newPackageState = getPackageState(pack, storage);
        // Update package address
        const _package = await Package.findOneAndUpdate(
          { _id: packageId },
          {
            current_address: store.address,
            state: newPackageState,
          }
        ).session(session);
        if (!_package) throw "Update package failed";

        // If package state changed, update order state
        if (newPackageState !== pack.state) {
          order.packages.find((item) => item.id === packageId).state =
            newPackageState;

          const minPackState = Math.min(
            ...order.packages.map((item) => item.state)
          );

          if (minPackState > order.state) {
            order = await Order.findOneAndUpdate(
              { _id: order.id },
              { state: minPackState }
            ).session(session);
            if (!order) throw "Update order failed";
          }
        }
      }
      await session.commitTransaction();
      session.endSession();
      return sanitizeEntity(importedPackage[0], {
        model: strapi.query("import").model,
        includeFields: ["quantity"],
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return ctx.badRequest([
        {
          id: "import.updateImportQuantityByPackage",
          message: JSON.stringify(error),
        },
      ]);
    }
  },
};

function getPackageState(_package, store) {
  return _package.state < 2
    ? 2
    : _package.order.to_address.city === store.address.city
    ? 3
    : 2;
}
