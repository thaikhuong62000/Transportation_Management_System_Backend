"use strict";
const { sanitizeEntity } = require("strapi-utils");
var moment = require("moment");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async findOne(ctx) {
    const { id } = ctx.params;

    let shipment = await strapi.services.shipment.findOne({ id }, [
      "packages",
      "from_storage",
      "to_storage",
    ]);
    shipment = sanitizeEntity(shipment, {
      model: strapi.models.shipment,
      includeFields: ["packages", "from_storage", "to_storage"],
    });

    if (
      shipment.packages.length > 0 &&
      !(shipment.from_storage && shipment.to_storage)
    ) {
      const order = await strapi.services.order.findOne(
        { id: shipment.packages[0].order },
        []
      );
      return { ...shipment, ...order, order_id: shipment.packages[0].order };
    } else return shipment;
  },

  async getCurrentShipment(ctx) {
    let shipments =
      await strapi.services.shipment.getUnfinishedShipmentByDriver(
        ctx.state.user.id
      );

    return shipments.map((entity) =>
      sanitizeEntity(entity, {
        model: strapi.models.shipment,
        includeFields: ["to_address", "arrived_time"],
      })
    );
  },

  async getFinishedShipment(ctx) {
    const { pageIndex = 0 } = ctx.query;
    let shipments = await strapi.services.shipment.getFinishedShipmentByDriver(
      ctx.state.user.id,
      pageIndex * 10,
      10
    );

    return shipments.map((entity) =>
      sanitizeEntity(entity, {
        model: strapi.models.shipment,
        includeFields: ["to_address", "arrived_time"],
      })
    );
  },

  async getVehicleDetailByShipment(ctx) {
    const { id } = ctx.params;

    let shipmentDetail = await strapi.query("shipment").findOne({ id: id });

    shipmentDetail = sanitizeEntity(shipmentDetail, {
      model: strapi.models.shipment,
      includeFields: ["packages", "to_address", "driver", "assistance"],
    });

    const totalWeight = shipmentDetail.packages.reduce((total, item) => {
      return total + item.weight * item.quantity;
    }, 0);

    return {
      total_weight: totalWeight,
      ...shipmentDetail,
    };
  },

  /**
   * Note for transaction:
   *    use _id instead of id
   *    in create method, pass { session: session } instead of chain .session(session)
   *    in create method, value must enclosed in [] or it will create duplicated entries
   *    if findOneAndUpdate result is use for next step, pass option { new: true }
   */
  async create(ctx) {
    let {
      orderId,
      vehicleId,
      shipmentInfo,
      newOrderInfo,
      updateQuantityList = [], // {id, quantity}
      updatePackageList = [], // {id},
      removePackageList = [], // {id}
      newPackageList = [],
      orderState = null, // number
    } = ctx.request.body;
    let shipment = "";

    const db = strapi.connections.default;
    const session = await db.startSession();
    session.startTransaction();
    const { Package, Order, Shipment, Car } = db.models; // Models

    try {
      if (newOrderInfo) {
        // Update quantity of package for old order
        if (updateQuantityList.length) {
          for (let item of updateQuantityList) {
            const _package = await Package.findOneAndUpdate(
              { _id: item.id },
              { quantity: item.quantity }
            ).session(session);
            if (!_package) throw "Update package failed";
          }
        }

        // Remove relation of package have full quantity for shipment
        if (updatePackageList.length) {
          const order = await Order.findOneAndUpdate(
            { _id: orderId },
            { packages: updatePackageList }
          ).session(session);
          if (!order) throw "Update order failed";
        }

        // Create package for order
        let newOrder = await Order.create([newOrderInfo], {
          session: session,
        });
        if (newPackageList) {
          for (let pack of newPackageList) {
            await Package.create(
              [
                {
                  ...pack,
                  state: 1,
                  order: newOrder._id,
                },
              ],
              { session: session }
            );
          }
        }

        // Add package relation
        let insertedOrder = await Order.findOne({
          _id: newOrder._id,
        }).session(session);
        if (!insertedOrder) throw "Not found order";
        if (removePackageList.length) {
          for (let item of removePackageList) {
            let pack = await Package.findOneAndUpdate(
              {
                _id: item,
              },
              {
                state: 1,
              }
            ).session(session);

            if (!pack) throw "Cannot update old order's package state"
          }

          insertedOrder = await Order.findOneAndUpdate(
            {
              _id: insertedOrder._id,
            },
            {
              packages: [
                ...insertedOrder.packages.map((item) => item._id),
                ...removePackageList,
              ],
            },
            { new: true }
          ).session(session);
        }

        // Create shipment
        shipment = await Shipment.create(
          [
            {
              ...shipmentInfo,
              packages: insertedOrder.packages.map((item) => item._id),
            },
          ],
          { session: session }
        );

        // Update car current shipments
        const car = await Car.findOneAndUpdate(
          {
            _id: vehicleId,
          },
          {
            $push: {
              shipments: shipment._id,
            },
          }
        ).session(session);
        if (!car) throw "Car not found";
      } else {
        shipment = await Shipment.create([shipmentInfo], { session: session });

        //  Update current shipments for car
        const car = await Car.findOneAndUpdate(
          { _id: vehicleId },
          {
            $push: {
              shipments: shipment._id,
            },
          }
        ).session(session);
        if (!car) throw "Update car failed";

        // Update order state and package state
        if (orderState && orderState !== null) {
          await Order.findOneAndUpdate(
            { _id: orderId },
            { state: orderState }
          ).session(session);
          await Package.updateMany(
            { order: orderId },
            { state: orderState }
          ).session(session);
        }
      }
      await session.commitTransaction();
      session.endSession();
      return shipment;
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      session.endSession();
      return ctx.badRequest(null, {
        errors: [
          {
            id: "Shipment.create",
            message: "Bad Request",
            error: error
          },
        ],
      });
    }
  },
};
