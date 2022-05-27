"use strict";

module.exports = async (ctx, next) => {
  const { room } = ctx.params;
  const _room = await strapi.services["room-chat"].findOne({ _id: room }, []);
  const id = ctx.state.user._id.toString();
  if (_room?.user1.toString() === id || _room?.user2.toString() === id)
    await next();
  else {
    return ctx.badRequest("User dont have this room chat");
  }
};
