"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async findMessagesByRoom(room, skip, limit) {
    return strapi
      .query("message")
      .model.find()
      .where("room")
      .eq(room)
      .populate("user")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);
  },
};
