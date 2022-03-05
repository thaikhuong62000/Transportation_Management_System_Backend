"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async getMessageByRoom(ctx) {
    const { room } = ctx.params;
    const { page = 0, pageSize = 10 } = ctx.query;
    const messages = await strapi.services.message.findMessagesByRoom(
      room,
      page * pageSize,
      pageSize
    );
    return messages.map((message) => {
      const { text, createdAt, subID: _id, user } = message;
      return {
        text,
        createdAt,
        _id,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar?.url,
        },
      };
    });
  },
};
