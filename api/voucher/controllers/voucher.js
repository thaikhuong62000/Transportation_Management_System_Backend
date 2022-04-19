"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   *
   * @param {Image: body} _image
   * @returns
   */
  async updateVoucherImage(ctx) {
    const {
      request: {
        body = {},
        files: { image: _image },
      },
    } = ctx;

    try {
      await strapi.plugins.upload.services.utils.checkImage(_image, false);
    } catch (error) {
      return ctx.badRequest(null, {
        errors: [
          {
            id: "Voucher.updateVoucherImage",
            message: "Bad Image",
          },
        ],
      });
    }

    const image =
      await strapi.plugins.upload.services.utils.uploadOrReplaceImage(
        _image,
        body
      );
    // const voucher = await strapi.service.voucher.create({});
    return image;
  },
};
