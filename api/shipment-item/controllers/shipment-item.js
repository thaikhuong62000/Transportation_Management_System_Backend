"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   * Create or update shipment item
   *
   * @return {Object}
   */
  async create(ctx) {
    const { shipment, assmin, package } = ctx.request.body;
    return await strapi
      .query("shipment-item")
      .model.findOneAndUpdate({ shipment, assmin, package }, ctx.request.body, {
        new: true,
        upsert: true,
      });
  },
};
