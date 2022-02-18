'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    
      /**
   *  Create a furlough
   */
  async furlough(ctx) {
    let { start_time, end_time, reason } = ctx.request.body;

    start_time = Date.parse(start_time);
    end_time = Date.parse(end_time);
    if (isNaN(start_time) || isNaN(end_time)) {
      // Wrong time format
      return ctx.badRequest("Wrong start time format");
    }

    const furlough = await strapi.services.furlough.create({
      // create a furlough
      state: "pending",
      reason: reason,
      start_time: start_time, //start_time,
      end_time: end_time, //end_time,
      driver: ctx.state.user.id,
    });

    return ctx.created();
  },
};
