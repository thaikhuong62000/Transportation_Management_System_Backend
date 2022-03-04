"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */
var mongoose = require("mongoose");

module.exports = {
  async findRoomByUsers(user1, user2) {
    const room = strapi
      .query("room-chat")
      .model.findOne()
      .where("user1")
      .in([user1, user2])
      .where("user2")
      .in([user1, user2])
      .populate("user1")
      .populate("user2");
    return room;
  },
};