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
    const shipment = await strapi
      .query("shipment")
      .model.findOneAndUpdate({ _id, driver: null }, { driver }, { new: true })
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

  async create(ctx) {
    const { vehicleId, driver } = ctx.request.body;

    const shipment = await strapi.services.shipment.create(ctx.request.body);

    if (driver) {
      strapi.services.shipment.updateOrderState(shipment);
    }

    //  Update current shipments for car
    await strapi.services.car.findOneAndUpdate(
      { _id: vehicleId },
      {
        $push: {
          shipments: shipment._id,
        },
      }
    );

    return shipment;
  },
};
