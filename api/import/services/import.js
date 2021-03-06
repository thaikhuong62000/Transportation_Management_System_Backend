"use strict";
var mongoose = require("mongoose");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async getImporstByPackages(packagesIdList, matchCond = {}) {
    let entites = await strapi.query("import").model.aggregate([
      {
        $match: {
          package: {
            $in: packagesIdList.map((item) => mongoose.Types.ObjectId(item)),
          },
          ...matchCond,
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
        $lookup: {
          from: "storages",
          localField: "storage",
          foreignField: "_id",
          as: "storage",
        },
      },
      {
        $unwind: "$package",
      },
      {
        $unwind: "$storage",
      },
      {
        $project: {
          quantity: 1,
          package: 1,
          storage: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
    ]);

    return entites;
  },

  async getCurrentImports(storage, queryOptions = {}, skip = 0, limit = 0) {
    let pipeLine = [
      {
        $match: {
          storage: mongoose.Types.ObjectId(storage),
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
          ...queryOptions,
        },
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
      {
        $lookup: {
          from: "components_package_sizes",
          localField: "package.size.ref",
          foreignField: "_id",
          as: "size",
        },
      },
      {
        $unwind: "$size",
      },
      {
        $lookup: {
          from: "orders",
          localField: "package.order",
          foreignField: "_id",
          as: "order",
        },
      },
      {
        $unwind: "$order",
      },
      {
        $lookup: {
          from: "components_address_addresses",
          localField: "order.to_address.ref",
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
        $skip: skip,
      },
    ];

    if (limit) {
      pipeLine.push({ $limit: limit });
    }

    let importes = await strapi.query("import").model.aggregate(pipeLine);

    return importes;
  },
};
