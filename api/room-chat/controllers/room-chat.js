"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async getRooms(ctx) {
    return await strapi.services["room-chat"].findRoomsByUser(
      ctx.state.user.id
    );
  },
};
