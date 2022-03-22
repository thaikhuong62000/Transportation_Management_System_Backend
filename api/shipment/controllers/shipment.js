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
};
