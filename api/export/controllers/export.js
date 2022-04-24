"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async getCurrentExport(ctx) {
    let shipments;
    if (ctx.query._q) {
      shipments = await strapi.services.shipment.search(
        {
          _where: [
            {
              _or: [
                { id: ctx.query._q },
                { "car.licence_contains": ctx.query._q },
              ]
            },
            { from_storage: ctx.state.user.storage },
            { arrived_time_null: true },
          ],
        },
        ["car"]
      );
    } else {
      shipments = await strapi.services.shipment.find(
        {
          _where: [
            { from_storage: ctx.state.user.storage },
            { arrived_time_null: true },
          ],
        },
        ["car"]
      );
    }

    return shipments.map((entity) => {
      const { from_address, id, car } = entity;
      return { id, from_address, licence: car?.licence };
    });
  },

  async updateExportQuantityByPackage(ctx) {
    const { packageId, quantity, shipmentItem } = ctx.request.body;
    const { id, storage } = ctx.state.user;

    const db = strapi.connections.default;
    let session;
    const { Export, ShipmentItem, Storage } = db.models;

    try {
      let pack = await strapi.services.package.findOne({ id: packageId });
      if (!pack) {
        throw "invalid QR code";
      }

      let shipment_item = await strapi.services["shipment-item"].findOne({
        id: shipmentItem,
      });

      if (!quantity && quantity < 0) {
        throw "Invalid package quantity";
      }

      session = await db.startSession();
      session.startTransaction();

      let exportedPackage = await Export.create(
        [
          {
            package: packageId,
            quantity: Number.parseInt(quantity),
            store_manager: id,
            storage: storage,
          },
        ],
        { session: session }
      );

      if (!exportedPackage) throw "Create export failed";

      shipment_item = await ShipmentItem.findOneAndUpdate(
        {
          _id: shipmentItem,
        },
        {
          export_received:
            Number.parseInt(shipment_item.export_received) +
            Number.parseInt(quantity),
        }
      ).session(session);

      if (!shipment_item) {
        throw "Invalid shipment item";
      }

      await session.commitTransaction();
      session.endSession();

      return sanitizeEntity(exportedPackage[0], {
        model: strapi.query("export").model,
        includeFields: ["quantity"],
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return ctx.badRequest([
        {
          id: "export.updatExportQuantityByPackage",
          message: JSON.stringify(error),
        },
      ]);
    }
  },
};
