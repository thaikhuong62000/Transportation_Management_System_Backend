"use strict";
var mongoose = require("mongoose");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async getReportByStorage(id, limit, skip) {
    let entities = await strapi
      .query("report")
      .model.find({
        storage: mongoose.Types.ObjectId(id),
      })
      .populate("storage")
      .populate("stocker")
      .limit(limit)
      .skip(skip);

    return entities;
  },
};
