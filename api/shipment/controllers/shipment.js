"use strict";
const { sanitizeEntity } = require("strapi-utils");
var moment = require("moment");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async getCurrentShipment(ctx) {
    let shipments =
      await strapi.services.shipment.getUnfinishedShipmentByDriver(
        ctx.state.user.id
      );

    return shipments.map((entity) =>
      sanitizeEntity(entity, {
        model: strapi.models.shipment,
        includeFields: ["to_address"],
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
        includeFields: ["to_address"],
      })
    );
  },
};
