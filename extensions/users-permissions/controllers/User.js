"use strict";
const { sanitizeEntity } = require("strapi-utils");
const validateUploadBody = require("strapi-plugin-upload/controllers/validation/upload");

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

    if (_avatar === undefined) {
      return ctx.badRequest(null, {
        errors: [
          {
            id: "User.updateAvatar",
            message: "Avatar is undefined",
          },
        ],
      });
    }
    if (Array.isArray(_avatar)) {
      return ctx.badRequest(null, {
        errors: [
          {
            id: "User.updateAvatar",
            message: "Cannot upload multiple avatar",
          },
        ],
      });
    }

    const mime = require("mime");
    const type = mime.getType(_avatar.name);
    if (Array.isArray(type) && type.split("/")[0] !== "image") {
      return ctx.badRequest(null, {
        errors: [
          {
            id: "User.updateAvatar",
            message: "Avatar must be image",
          },
        ],
      });
    }

    const avatar = { ..._avatar, type: type };
    const userId = ctx.state.user.id;
    const avatarExist = ctx.state.user.avatar && ctx.state.user.avatar.id;
    const isAdminUpdate = ctx.state.user.role.name === "Admin";

    // For admin update avatar
    if (isAdminUpdate) {
      let { userId, avaId } = ctx.request.body;
      if (!avaId) {
        const image = await strapi.plugins.upload.services.upload.upload({
          data: await validateUploadBody(body),
          files: avatar,
        });
        return await strapi.plugins["users-permissions"].services.user.edit(
          { id: userId },
          { avatar: image[0].id }
        );
      } else {
        const image = await strapi.plugins.upload.services.upload.replace(
          avaId,
          {
            data: await validateUploadBody(body),
            file: avatar,
          }
        );
        const sanitizedImage = sanitizeEntity(image, {
          model: strapi.getModel("file", "upload"),
          includeFields: ["name", "url", "formats"],
        });
        return { avatar: sanitizedImage };
      }
    }

    // Replace Or Upload image
    if (avatarExist) {
      ctx.query.id = ctx.state.user.avatar.id;
      const image = await strapi.plugins.upload.services.upload.replace(
        ctx.state.user.avatar.id,
        {
          data: await validateUploadBody(body),
          file: avatar,
        }
      );
      const sanitizedImage = sanitizeEntity(image, {
        model: strapi.getModel("file", "upload"),
        includeFields: ["name", "url", "formats"],
      });
      return { ...ctx.state.user, avatar: sanitizedImage };
    } else {
      const image = await strapi.plugins.upload.services.upload.upload({
        data: await validateUploadBody(body),
        files: avatar,
      });
      return await strapi.plugins["users-permissions"].services.user.edit(
        { id: userId },
        { avatar: image[0].id }
      );
    }
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
