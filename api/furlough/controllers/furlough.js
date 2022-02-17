"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    const {
      id,
      start_time,
      end_time,
      reason = "",
      state = "pending",
    } = ctx.request.body;

    if (new Date(start_time) > new Date(end_time)) {
      return ctx.badRequest("Start time must not be larger than end time!");
    }

    if (new Date(start_time) < new Date()) {
      return ctx.badRequest("Invalid start time!");
    }

    const user = await strapi
      .query("user", "users-permissions")
      .findOne({ _id: id });

    if (!user) {
      return ctx.badRequest(null, "Driver not found");
    }

    const furlough = await strapi.query("furlough").create({
      state,
      start_time,
      end_time,
      reason,
      driver: user,
    });

    return furlough;
  },
};
