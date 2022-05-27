"use strict";

module.exports = {
  /**
   * Create a record in table car_broken.
   *
   * @return {Object}
   */
  async create(ctx) {
    // Validation
    const { time, note, car } = ctx.request.body;
    const { id } = ctx.state.user;
    const timestamp = Date.parse(time);
    if (isNaN(timestamp)) {
      // Wrong time format
      return ctx.badRequest("Wrong time format");
    }

    try {
      if (car === undefined) {
        throw "Car id undefined";
      }

      let insertedCar = await strapi.services.car.findOne({
        id: car,
        manager: id,
      });

      if (!insertedCar) {
        throw "Invalid car's manager";
      }
    } catch (error) {
      // Car not found
      return ctx.badRequest("Car not found");
    }

    // Add Car_broken
    let broken = await strapi.services["car-broken"].create({
      time,
      note,
      car,
    });
    
    // Notify to admin web
    await strapi.plugins["users-permissions"].services.noti.handleNoti("broken", broken)
    return broken;
  },
};
