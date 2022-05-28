"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

function getReceiver(room, userId) {
  return String(room.user1._id) === userId ? room.user2 : room.user1;
}

module.exports = {
  /**
   * Get rooms chat of a user (included user info)
   *
   * Precondition: Logined in
   * @returns
   */
  async getRooms(ctx) {
    const rooms = await strapi.services["room-chat"].findRoomsByUser(
      ctx.state.user.id
    );
    return rooms.map((room) => {
      const receiver = getReceiver(room, ctx.state.user.id);
      const { id, name, phone } = receiver;
      const avatar = receiver?.avatar?.url;
      return { id, name, phone, avatar, room: room.id };
    });
  },
};
