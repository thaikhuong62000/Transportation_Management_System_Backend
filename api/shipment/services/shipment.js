"use strict";
var mongoose = require("mongoose");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async getUnfinishedShipmentByDriver(lat, lng, driverId) {
    const shipments = await strapi
      .query("shipment")
      .model.find()
      .where("driver")
      .eq(driverId)
      .where("arrived_time")
      .eq(null)
      .populate("from_storage")
      .populate("to_storage");
    return shipments.sort((a, b) => sortShipmentByDistance(lat, lng, a, b));
  },
  async getNearbyShipment(lat, lng) {
    let shipments;
    let k = 0;
    do {
      k++;
      shipments = await strapi.query("shipment").model.aggregate([
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
          $lookup: {
            from: "components_address_addresses",
            localField: "to_address.ref",
            foreignField: "_id",
            as: "to_address",
          },
        },
        {
          $unwind: {
            path: "$to_address",
          },
        },
        {
          $match: {
            "from_address.latitude": {
              $gte: lat - 0.05 * k,
              $lte: lat + 0.05 * k,
            },
            "from_address.longitude": {
              $gte: lng - 0.05 * k,
              $lte: lng + 0.05 * k,
            },
          },
        },
      ]);
    } while (shipments.length === 0 && k <= 5);
    return shipments.sort((a, b) =>
      sortShipmentByDistance(lat, lng, a, b, true)
    );
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

  async updateOrderState(shipment) {
    if (shipment.packages && shipment.packages.length > 0) {
      const orders = shipment.packages.map((item) => item.order);
      const packages = shipment.packages.map((item) => item._id);
      await strapi.services.order.update(
        {
          _id: orders[0],
          state: 0,
        },
        { state: 1 },
        { multi: true }
      );
      await strapi.services.package.update(
        {
          _id: { $in: packages },
          state: 0,
        },
        { state: 1 },
        { multi: true }
      );
    }
  },

  async getShipmentByMonth(month) {
    let shipments = await strapi.query("shipment").model.aggregate([
      {
        $addFields: {
          month: {
            $month: "$createdAt",
          },
          day: {
            $dayOfMonth: "$createdAt",
          },
        },
      },
      {
        $match: {
          month: {
            $eq: month,
          },
        },
      },
      {
        $group: {
          _id: "$day",
          quantity: {
            $sum: 1,
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    return shipments;
  },
};

function sortShipmentByDistance(lat, lng, item1, item2, sort_fa = false) {
  const { latitude: lat1, longitude: lng1 } = sortField(item1, sort_fa);
  const { latitude: lat2, longitude: lng2 } = sortField(item2, sort_fa);
  return (
    strapi.services.distance.coordToDistance(lat, lng, lat1, lng1) -
    strapi.services.distance.coordToDistance(lat, lng, lat2, lng2)
  );
}

function sortField(item, sort_fa) {
  if (sort_fa) return item.from_address;
  if (item.from_storage && item.to_storage) {
    return item.to_storage.address[0].ref;
  } else if (item.to_storage) {
    return item.from_address[0].ref;
  } else if (item.from_storage) {
    return item.to_address[0].ref;
  }
}
