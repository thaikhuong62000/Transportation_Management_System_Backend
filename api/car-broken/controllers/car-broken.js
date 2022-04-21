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
    const timestamp = Date.parse(data.time);
    if (isNaN(timestamp)) {
      // Wrong time format
      return ctx.badRequest("Wrong time format");
    }

    try {
      if (data.car === undefined) {
        throw "Car id undefined";
      }
      await strapi.services.car.findOne({ id: data.car });
    } catch (error) {
      // Car not found
      return ctx.badRequest("Car not found");
    }

    // Add Car_broken
    let car = await strapi.services["car-broken"].create(data);
    return car;
  },
};
