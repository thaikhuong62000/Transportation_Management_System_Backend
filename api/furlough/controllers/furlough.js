"use strict";

const msToDay = 1000 * 3600 * 24;

module.exports = {
  /**
   *  Create a furlough
   */
  async create(ctx) {
    let { start_time, days, reason } = ctx.request.body;
    const { days_before, days_limit } = strapi.tms.config.furlough;

    try {
      days = parseInt(days);

      if (days < 1) {
        throw "Absence days must bigger than 0";
      }

      if (days > days_limit) {
        throw "Too many absence days";
      }

      start_time = Date.parse(start_time);
      if (isNaN(start_time)) {
        throw "Wrong start time format";
      }

      const toDay = Date.parse(new Date());
      if (start_time > toDay + days_before * msToDay) {
        throw "Too late";
      }

      let furlough = await strapi.services.furlough.create({
        state: "pending",
        reason: reason,
        start_time: start_time,
        end_time: new Date(start_time + days * msToDay),
        driver: ctx.state.user.id,
      });

      // Notify to admin web
      await strapi.plugins["users-permissions"].services.noti.handleNoti("furlough", furlough)
      
      return furlough;
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
