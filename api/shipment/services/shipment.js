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
  async getNearbyShipment(lat, lng) {
    const shipments = await strapi.query("shipment").model.aggregate([
      {
        $match: {
          driver: {
            $eq: null,
          },
          arrived_time: {
            $eq: null,
          },
        },
      },
      {
        $lookup: {
          from: "components_address_addresses",
          localField: "from_address.ref",
          foreignField: "_id",
          as: "from_address",
        },
      },
      {
        $unwind: {
          path: "$from_address",
        },
      },
      {
        $match: {
          "from_address.latitude": {
            $gte: lat - 0.1,
            $lte: lat + 0.1,
          },
          "from_address.longitude": {
            $gte: lng - 0.1,
            $lte: lng + 0.1,
          },
        },
      },
    ]);
    return shipments.sort((a, b) => sortShipmentByDistance(lat, lng, a, b));
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

  async getTotalPackageNeedImport(storage) {
    let packageIdList = await strapi.query("shipment").model.aggregate([
      {
        $match: {
          to_storage: mongoose.Types.ObjectId(storage),
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

function sortShipmentByDistance(lat, lng, item1, item2) {
  const { latitude: lat1, longitude: lng1 } = item1.from_address;
  const { latitude: lat2, longitude: lng2 } = item2.from_address;
  return (
    coordToDistance(lat, lng, lat1, lng1) -
    coordToDistance(lat, lng, lat2, lng2)
  );
}

function coordToDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
