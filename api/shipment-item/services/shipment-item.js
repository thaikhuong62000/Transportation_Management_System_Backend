'use strict';
var mongoose = require("mongoose");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async getArrangedPackagesByStorage(storageQuery, queryOptions = {}) {
    let items = await strapi.query("shipment-item").model.aggregate([
      {
        $lookup: {
          from: "shipments",
          localField: "shipment",
          foreignField: "_id",
          as: "shipment",
        },
      },
      {
        $unwind: "$shipment"
      },
      {
        $match: {
          ...storageQuery,
        },
      },
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "package",
        },
      },
      {
        $unwind: "$package",
      },
      {
        $match: {
          ...queryOptions
        }
      },
      {
        $group: {
          _id: "$package._id",
          quantity: {
            $sum: "$quantity",
          },
          package: {
            $first: "$package",
          },
        },
      },
      {
        $unwind: "$package.size",
      },
    ]);

    return items
  }
};
