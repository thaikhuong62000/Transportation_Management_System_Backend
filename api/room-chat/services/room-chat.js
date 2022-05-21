"use strict";

module.exports = {
  async findRoomByUsers(user1, user2) {
    return strapi
      .query("room-chat")
      .model.findOne()
      .where("user1")
      .in([user1, user2])
      .where("user2")
      .in([user1, user2])
      .populate("user1")
      .populate("user2");
  },

  async findRoomsByUser(user, populate = true) {
    const rooms = strapi
      .query("room-chat")
      .model.find()
      .or([{ user1: user }, { user2: user }]);
    if (populate) return rooms.populate("user1").populate("user2");
    else return rooms;
  },
};
