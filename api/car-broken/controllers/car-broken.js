"use strict";

module.exports = {
  /**
   * Create a record in table car_broken.
   *
   * @return {Object}
   */
  async create(ctx) {
    // Validation
    const data = ctx.request.body;
    if (new Date(data.time) === null) {
      // 400 Bad Request
      ctx.response.status = 400;
      // Wrong time format
      // ctx.response.message = "Wrong time format";
      return;
    }

    try {
      await strapi.services.car.findOne({ id: data.car });
    } catch (error) {
      // 400 Bad Request
      ctx.response.status = 400;
      // Car not found
      // ctx.response.message = "Car not found";
      return;
    }

    // Add Car_broken
    await strapi.services["car-broken"].create(data);
    ctx.response.status = 201;
    return;
  },
};
