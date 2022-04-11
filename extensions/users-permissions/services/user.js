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

  async getIncome(startTime, endTime, year) {
    let income = await strapi.query("payment").model.aggregate([
      {
        $match: {},
      },
      {
        $addFields: {
          month: {
            $month: "$createdAt",
          },
          year: {
            $year: "$createdAt",
          },
        },
      },
      {
        $match: {
          month: {
            $gte: startTime,
          },
          month: {
            $lte: endTime,
          },
          year: {
            $eq: year,
          },
        },
      },
      {
        $group: {
          _id: "1",
          income: {
            $sum: "$paid",
          },
        },
      },
      {
        $project: {
          _id: 0,
          income: 1,
        },
      },
    ]);

    return income[0];
  },
};
