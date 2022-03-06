"use strict";
var mongoose = require("mongoose");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async getExportByStorage(id, limit, skip) {
    let entities = await strapi
      .query("export")
      .model.find({
        storage: mongoose.Types.ObjectId(id),
      })
      .populate("store_manager")
      .populate("package")
      .limit(limit)
      .skip(skip);

    return entities;
  },

  async getExportsByPackages(packagesIdList) {
    let entites = await strapi.query("export").model.aggregate([
      {
        $match: {
          package: {
            $in: packagesIdList.map((item) => mongoose.Types.ObjectId(item)),
          },
        },
      },
      {
        $sort: {
          createdAt: 1,
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
    ]);

    return entites;
  },
};
