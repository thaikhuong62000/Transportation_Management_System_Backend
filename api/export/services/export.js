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
};
