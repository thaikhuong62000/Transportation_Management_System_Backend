'use strict';
const validateUploadBody = require("strapi-plugin-upload/controllers/validation/upload");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async updateVoucherImage(ctx) {
    const {
      request: {
        body = {},
        files: { image: _image },
      },
    } = ctx;

    if (_image === undefined) {
      return ctx.badRequest(null, {
        errors: [
          {
            id: "Voucher.updateVoucherImage",
            message: "Voucher is undefined",
          },
        ],
      });
    }
    if (Array.isArray(_image)) {
      return ctx.badRequest(null, {
        errors: [
          {
            id: "Voucher.updateVoucherImage",
            message: "Cannot upload multiple image",
          },
        ],
      });
    }

    const mime = require("mime");
    const type = mime.getType(_image.name);
    if (Array.isArray(type) && type.split("/")[0] !== "image") {
      return ctx.badRequest(null, {
        errors: [
          {
            id: "Voucher.updateAvatar",
            message: "Voucher must be image",
          },
        ],
      });
    }

    const image = await strapi.plugins.upload.services.upload.upload({
      data: await validateUploadBody(body),
      files: _image,
    });

    return image
  },
};
