"use strict";

module.exports = async (ctx, next) => {
  const { room } = ctx.params;
  const rooms = await strapi.services["room-chat"].findRoomsByUser(
    ctx.state.user.id
  );
  for (const _room of rooms) {
    if (String(_room._id) === room) {
      return await next();
    }
  }
  return ctx.forbidden("User dont have this room chat");
};
