"use strict";
var mongoose = require("mongoose");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async getDeliveredOrder(id, limit, skip) {
    let entities = await strapi
      .query("order")
      .model.find({
        customer: mongoose.Types.ObjectId(id),
        $or: [
          {
            $and: [{ state: 4 }, { remain_fee: 0 }],
          },
          {
            state: 5,
          },
        ],
      })
      .limit(limit)
      .skip(skip);

    return entities;
  },

  async getDeliveringOrder(id, limit, skip) {
    let entities = await strapi
      .query("order")
      .model.find({
        customer: mongoose.Types.ObjectId(id),
        state: {
          $in: Array.from({ length: 5 }, (_, index) => index),
        },
        remain_fee: {
          $gt: 0,
        },
      })
      .populate("packages", "current_address weight quantity name")
      .limit(limit)
      .skip(skip);

    return entities;
  },
};
