"use strict";
const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  /**
   * Return info of a shipment for driver (included sender/receiver info, some of order info)
   *
   * Precondition: Logined in as Driver
   * @param {String: param} id of a shipment
   * @returns
   */
  async findOne(ctx) {
    const { id } = ctx.params;

    let shipment = await strapi.services.shipment.findOne({ id }, [
      "packages",
      "from_storage",
      "to_storage",
      "shipment_items",
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

  /**
   * Get current shipment of a driver and nearby shipment
   *
   * Precondition: Logined in as Driver
   * @returns
   */
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

  /**
   * Get finished shipment of a driver
   *
   * Precondition: Logined in as Driver
   * @returns
   */
  async acceptShipment(ctx) {
    const { shipment: _id } = ctx.params;
    const { id: driver, car } = ctx.state.user;
    const shipment = await strapi
      .query("shipment")
      .model.findOneAndUpdate(
        { _id, driver: null },
        { driver, car },
        { new: true }
      )
      .populate("packages");

    strapi.services.shipment.updateOrderState(shipment);

    return shipment;
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

  /**
   *
   * @param {String: param} id of a shipment
   * @returns
   */
  async getVehicleDetailByShipment(ctx) {
    const { id } = ctx.params;

    let shipmentDetail = await strapi.query("shipment").findOne({ id: id });

    shipmentDetail = sanitizeEntity(shipmentDetail, {
      model: strapi.models.shipment,
      includeFields: [
        "packages",
        "to_address",
        "driver",
        "assistance",
        "shipment_items",
      ],
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
   * Create shipment
   * Split Order
   * Update package, order state
   * Update vehicle's shipment
   *
   * @param {...} ...
   * @returns
   */
  async create(ctx) {
    const { shipmentData, shipmentItems } = ctx.request.body;
    let {
      from_address,
      to_address,
      from_storage = "",
      to_storage = "",
    } = shipmentData;

    const db = strapi.connections.default;
    let session;
    const { ComponentAddressAddress, Shipment, ShipmentItem } = db.models;

    try {
      const addresses = await ComponentAddressAddress.create(
        [from_address, to_address],
        { session: session }
      );

      session = await db.startSession();
      session.startTransaction();

      const shipment = await Shipment.create(
        [
          {
            ...shipmentData,
            from_address: {
              kind: "ComponentAddressAddress",
              ref: addresses[0]._id,
            },
            to_address: {
              kind: "ComponentAddressAddress",
              ref: addresses[1]._id,
            },
          },
        ],
        { session: session }
      );

      if (!shipment) throw "Create shipment fail";

      if (to_storage && !from_storage) {
        let ship = await Shipment.populate(shipment[0], { path: "packages" });
        await strapi.services.shipment.updateOrderState(ship);
      }

      if (shipmentItems && shipmentItems.length) {
        let _shipmentItems = shipmentItems.map((item) => ({
          ...item,
          shipment: shipment[0]._id,
        }));

        let items = await ShipmentItem.create([..._shipmentItems], {
          session: session,
        });

        if (!items) throw "Create shipment item failed";
      }

      await session.commitTransaction();
      session.endSession();

      return shipment;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return ctx.badRequest([
        {
          id: "shipment.create",
          message: JSON.stringify(error),
        },
      ]);
    }
  },

  async finishShipment(ctx) {
    const { _id } = ctx.params;
    let condition = { _id };
    const role = ctx.state.user?.role?.type;
    if (role === "driver") condition = { _id, driver: ctx.state.user?.id };
    const shipment = await strapi
      .query("shipment")
      .model.findOneAndUpdate(condition, { arrived_time: new Date() });
    if (!shipment)
      return ctx.badRequest([
        {
          id: "Shipment.finishShipment",
          message: "Update failed",
        },
      ]);
    else return true;
  },
};
