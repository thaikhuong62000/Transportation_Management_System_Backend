"use strict";

module.exports = {
  /**
   *  Create a furlough
   */
  async create(ctx) {
    let { start_time, days, reason } = ctx.request.body;

    try {
      days = parseInt(days);
      start_time = Date.parse(start_time);
      if (isNaN(start_time)) {
        throw "Wrong start time format";
      }

      if (days < 1) {
        throw "Absence days must bigger than 0";
      }

      await strapi.services.furlough.create({
        state: "pending",
        reason: reason,
        start_time: start_time,
        end_time: new Date(start_time + days * 1000 * 3600 * 24),
        driver: ctx.state.user.id,
      });
      return ctx.created();
    } catch (error) {
      return ctx.badRequest(null, {
        errors: [
          {
            id: "Furlough.create",
            message: JSON.stringify(error),
          },
        ],
      });
    }
  },
};
