"use strict";
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async getPackagesInStorage(id, limit, skip) {
    let entities = await strapi
      .query("import")
      .model.find({ storage: id })
      .populate("package", [
        "size",
        "current_address",
        "position",
        "quantity",
        "package_type",
        "weight",
      ])
      .limit(limit)
      .skip(skip);

    return entities;
  },
};
