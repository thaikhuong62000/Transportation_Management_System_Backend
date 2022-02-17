"use strict";
var mongoose = require("mongoose");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async getCustomer(id) {
    let customer = strapi
      .query("user", "users-permissions")
      .model.find()
      .where("_id")
      .eq(id);
    return customer;
  },

  async updatePassword(id, password) {
    let user = strapi
      .query("user", "users-permissions")
      .model.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) },
        { password: password },
        { new: true }
      );
    return user;
  },
};
