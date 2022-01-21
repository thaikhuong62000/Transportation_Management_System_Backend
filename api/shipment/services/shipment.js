"use strict";
var mongoose = require("mongoose");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async getUnfinishedShipmentByDriver(driverId) {
    let entities = strapi
      .query("shipment")
      .model.find()
      .where("driver")
      .eq(driverId)
      .where("arrived_time")
      .eq(null);
    return entities;
  },
  async getFinishedShipmentByDriverByMonth(driverId, month = 1) {
    let entities = strapi
      .query("shipment")
      .model.aggregate()
      .match({ driver: mongoose.Types.ObjectId(driverId) })
      .addFields({ month: { $month: "$arrived_time" } })
      .match({ month: month });
    return entities;
  },
};
