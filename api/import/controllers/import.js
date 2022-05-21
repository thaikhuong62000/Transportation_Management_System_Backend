"use strict";
const { sanitizeEntity } = require("strapi-utils");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
  async getCurrentImport(ctx) {
    let shipments;
    if (ctx.query._q) {
      shipments = await strapi.services.shipment.search(
        {
          _where: [
            {
              _or: [
                { id: ctx.query._q },
                { "car.licence_contains": ctx.query._q },
              ],
            },
            { to_storage: ctx.state.user.storage },
            { arrived_time_null: true },
          ],
        },
        ["car"]
      );
    } else {
      shipments = await strapi.services.shipment.find(
        {
          _where: [
            { to_storage: ctx.state.user.storage },
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

  async updateImportQuantityByPackage(ctx) {
    const { packageId, quantity, shipment } = ctx.request.body;
    const { storage, id } = ctx.state.user;

    const db = strapi.connections.default;
    let session;
    const { Package, Import, Order, ShipmentItem, ComponentAddressAddress } =
      db.models; // Models

    try {
      if (!quantity && quantity < 0) {
        throw "Invalid package quantity";
      }

      let pack = await strapi.services.package.findOne({ id: packageId });
      if (!pack) {
        throw "invalid QR code";
      }

      let shipment_item = await strapi.services["shipment-item"].findOne({
        assmin: false,
        package: packageId,
        shipment,
      });

      if (!shipment_item) {
        throw "Invalid shipment item";
      }

      const totalImportedPackage = (
        await strapi.services.import.getImporstByPackages([packageId], {
          storage: ObjectId(storage),
        })
      ).reduce((prev, curr) => prev + curr.quantity, 0);

      const order = await strapi.services.order.findOne({
        id: pack.order.id,
      });

      // Check if current storage is destination
      const nearestStorage = await strapi.services.storage.getNearestStorage(
        order.to_address
      );
      let store =
        storage === nearestStorage.id
          ? nearestStorage
          : await strapi.services.storage.findOne({ id: storage }, []);
      store.isDestination = storage === nearestStorage.id;

      session = await db.startSession();
      session.startTransaction();

      let importedPackage = await Import.create(
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

      if (!importedPackage) throw "Create import failed";

      shipment_item = await ShipmentItem.findOneAndUpdate(
        {
          _id: shipment_item.id,
        },
        {
          received:
            Number.parseInt(shipment_item.received) + Number.parseInt(quantity),
        }
      ).session(session);

      if (!shipment_item) {
        throw "Invalid shipment item";
      }

      // If all package imported
      if (totalImportedPackage + Number.parseInt(quantity) === pack.quantity) {
        const newPackageState = getPackageState(store);
        let { id: xid, _id: _xid, ...address } = store.address;

        // Update package address
        address = (
          await ComponentAddressAddress.create([address], {
            session: session,
          })
        )[0];
        const _package = await Package.findOneAndUpdate(
          { _id: packageId },
          {
            current_address: {
              kind: "ComponentAddressAddress",
              ref: address._id,
            },
            state: newPackageState,
          },
          {
            new: true,
          }
        ).session(session);

        if (!_package) throw "Update package failed";

        // If package state changed, update order state
        if (newPackageState !== pack.state) {
          order.packages.find((item) => item.id === packageId).state =
            newPackageState;

          const minPackState = Math.min(
            ...order.packages.map((item) => Number.parseInt(item.state))
          );

          if (minPackState === 3) ctx.createShipment = { order, store };

          if (minPackState > order.state) {
            let _order = await Order.findOneAndUpdate(
              { _id: order._id },
              { state: Number.parseInt(minPackState) }
            ).session(session);
            if (!_order) throw "Update order failed";
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

function getPackageState(store) {
  return store.isDestination ? 3 : 2;
}
