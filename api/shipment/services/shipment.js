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
  async getFinishedShipmentByDriver(driverId, skip, limit) {
    let entities = strapi
      .query("shipment")
      .model.find()
      .where("driver")
      .eq(driverId)
      .where("arrived_time")
      .ne(null)
      .sort("-arrived_time")
      .skip(skip)
      .limit(limit);
    return entities;
  },
  async getTotalPackageNeedImport(storageName) {
    let packageIdList = await strapi.query("shipment").model.aggregate([
      {
        $match: {
          to_storage: storageName,
          from_storage: {
            $ne: "",
          },
        },
      },
      {
        $unwind: "$packages",
      },
      {
        $group: {
          _id: "$packages",
        },
      },
    ]);

    let totalPackage = await strapi.query("package").model.aggregate([
      {
        $match: {
          _id: {
            $in: packageIdList.map((item) => mongoose.Types.ObjectId(item._id)),
          },
        },
      },
      {
        $group: {
          _id: null,
          total_packages: {
            $sum: "$quantity",
          },
        },
      },
      {
        $project: {
          _id: 0,
          total_packages: 1,
        },
      },
    ]);

    return totalPackage[0];
  },
};
