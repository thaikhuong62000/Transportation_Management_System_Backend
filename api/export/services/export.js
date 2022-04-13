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
        $group: {
          _id:  {
            "storage": "$storage._id", 
            "package": "$package._id" 
          },
          quantity: {
            $sum: "$quantity"
          },
          storage: {
            $first: "$storage"
          },
          package: {
            $first: "$package"
          },
          createdAt: {
            $first: "$createdAt"
          },
          updatedAt: {
            $last: "$createdAt"
          }
        }
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
};
