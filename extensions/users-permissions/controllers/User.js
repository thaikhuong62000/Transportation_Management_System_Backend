"use strict";
const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  /**
   * Uploading new Image, remove old image
   * Set new Image to current user.
   *
   * @return {Object}
   */
  async updateAvatar(ctx) {
    // Validate
    const {
      request: {
        body = {},
        files: { avatar: _avatar },
      },
    } = ctx;

    try {
      await strapi.plugins.upload.services.utils.checkImage(_avatar, false);
    } catch (error) {
      return ctx.badRequest(null, {
        errors: [
          {
            id: "User.updateAvatar",
            message: "Bad Avatar",
          },
        ],
      });
    }

    const avatar = { ..._avatar, type: type };
    const uploadMeta = getUploadUser(ctx);

    const image =
      await strapi.plugins.upload.services.utils.uploadOrReplaceImage(
        avatar,
        body,
        uploadMeta.avatarId
      );
    const user = await strapi.plugins["users-permissions"].services.user.edit(
      { id: uploadMeta.userId },
      { avatar: image[0].id }
    );
    return sanitizeEntity(user, {
      model: strapi.query("user", "users-permissions").model,
    });
  },

  async updateDeviceToken(ctx) {
    const { device_token } = ctx.request.body;
    return await strapi.plugins["users-permissions"].services.user.edit(
      { id: ctx.state.user.id },
      { device_token: device_token }
    );
  },

  async sendNoti(ctx) {
    const { device_token, ...message } = ctx.request.body;
    return await strapi.firebase.sendCloudMessage(device_token, message);
  },
};

function getUploadUser(ctx) {
  if (ctx.state.user.role.name === "Admin") {
    const { userId, avaId: avatarId } = ctx.request.body;
    return { userId, avatarId };
  } else {
    return {
      userId: ctx.state.user.id,
      avatarId: ctx.state.user.avatar?.id,
    };
  }
}
