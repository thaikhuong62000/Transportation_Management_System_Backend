"use strict";
const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  async findOne(ctx) {
    const { id } = ctx.params;

    let shipment = await strapi.services.shipment.findOne({ id }, [
      "packages",
      "from_storage",
      "to_storage",
    ]);
    shipment = await sanitizeEntity(shipment, {
      model: strapi.models.shipment,
    });

    if (
      shipment.packages.length > 0 &&
      !(shipment.from_storage && shipment.to_storage)
    ) {
      const order = await strapi.services.order.findOne(
        { id: shipment.packages[0].order },
        []
      );
      return { ...order, order_id: shipment.packages[0].order, ...shipment };
    } else return shipment;
  },

  async getCurrentShipment(ctx) {
    const { latitude, longitude } = ctx.query;
    const _shipments =
      await strapi.services.shipment.getUnfinishedShipmentByDriver(
        parseFloat(latitude),
        parseFloat(longitude),
        ctx.state.user.id
      );
    const shipments = await strapi.services.shipment.getNearbyShipment(
      parseFloat(latitude),
      parseFloat(longitude)
    );

    return [..._shipments, ...shipments].map((entity) =>
      sanitizeEntity(entity, {
        model: strapi.models.shipment,
      })
    );
  },

  async acceptShipment(ctx) {
    const { shipment: _id } = ctx.params;
    const { id: driver } = ctx.state.user;
    return await strapi
      .query("shipment")
      .model.findOneAndUpdate({ _id, driver: null }, { driver }, { new: true });
  },

  async getFinishedShipment(ctx) {
    const { pageIndex = 0 } = ctx.query;
    const shipments =
      await strapi.services.shipment.getFinishedShipmentByDriver(
        ctx.state.user.id,
        pageIndex * 10,
        10
      );

    return shipments.map((entity) =>
      sanitizeEntity(entity, {
        model: strapi.models.shipment,
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
    const {
      Package,
      Order,
      Shipment,
      Car,
      ComponentAddressAddress,
      ComponentPackageSize,
    } = db.models; // Models

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
        let addresses = await ComponentAddressAddress.create(
          [newOrderInfo.from_address, newOrderInfo.to_address],
          { session: session }
        );

        let newOrder = await Order.create(
          [
            {
              ...newOrderInfo,
              from_address: addresses[0]._id,
              to_address: addresses[0]._id,
            },
          ],
          { session: session }
        );

        // console.log(newOrder)

        if (newPackageList) {
          for (let pack of newPackageList) {
            let size = await ComponentPackageSize.create([pack.size], {
              session: session,
            });
            // console.log(newOrder[0]._id)
            // console.log(size[0]._id);
            let insertedPack = await Package.create(
              [
                {
                  ...pack,
                  state: 1,
                },
              ],
              { session: session }
            );

            // console.log(insertedPack, size)

            insertedPack = await Package.findOneAndUpdate(
              {
                _id: insertedPack[0]._id,
              },
              {
                size: size[0],
                // order: newOrder[0].id,
              }
            ).session(session);

            console.log(insertedPack);

            if (!size || !insertedPack) {
              throw "Cannot create new package";
            }
          }
        }

        // Add package relation
        let insertedOrder = await Order.findOne({
          _id: newOrder[0].id,
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

            if (!pack) throw "Cannot update old order's package state";
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
        // console.log(insertedOrder)
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
              shipments: shipment[0]._id,
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
              shipments: shipment[0]._id,
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
            message: error,
          },
        ],
      });
    }
  },
};
