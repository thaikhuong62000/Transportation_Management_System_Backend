"use strict";

const { parseMultipartData } = require("strapi-utils");
const validateUploadBody = require("strapi-plugin-upload/controllers/validation/upload");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async getDataAndFile(ctx) {
    if (ctx.is("multipart")) {
      const {
        data,
        files: { receipt },
      } = parseMultipartData(ctx);
      return { data, receipt };
    } else {
      return { data: JSON.parse(ctx.request.body) };
    }
  },

  async checkImage(image, isArray, imageRequired = true) {
    if (imageRequired && !image) throw "Image Required";
    if (!image) return;

    if (Array.isArray(image) !== isArray) throw "Is Array";

    if (
      isArray &&
      image.length &&
      image.some(
        (item) => item && "type" in item && item.type.split("/")[0] !== "image"
      )
    ) {
      throw "Invalid file type";
    } else if (
      !image ||
      ("type" in image && image.type.split("/")[0] !== "image")
    )
      throw "Invalid file type";
  },

  async uploadOrReplaceImage(image, body, imageId = null) {
    if (!image) return null;
    if (imageId) {
      return await strapi.plugins.upload.services.upload.replace(imageId, {
        data: await validateUploadBody(body),
        file: image,
      });
    } else {
      return await strapi.plugins.upload.services.upload.upload({
        data: await validateUploadBody(body),
        files: image,
      });
    }
  },
};
