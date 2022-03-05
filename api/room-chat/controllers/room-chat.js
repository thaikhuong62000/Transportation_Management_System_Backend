"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

function getReceiver(room, userId) {
  return String(room.user1._id) === userId ? room.user2 : room.user1;
}

module.exports = {
  async getRooms(ctx) {
    const rooms = await strapi.services["room-chat"].findRoomsByUser(
      ctx.state.user.id
    );
    return rooms.map((room) => {
      const {
        id,
        name,
        phone,
        avatar: { url: avatar },
      } = getReceiver(room, ctx.state.user.id);
      return { id, name, phone, avatar, room: room.id };
    });
  },
};
