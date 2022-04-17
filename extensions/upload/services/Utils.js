"use strict";

const { parseMultipartData } = require("strapi-utils");
const validateUploadBody = require("strapi-plugin-upload/controllers/validation/upload");
const mime = require("mime");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  /**
   * Utility to uniform body type since parseMultipartData throw lots of errors
   *
   * @param {JSON: body} data
   * @param {Files: body} files
   * @returns data & files
   */
  async getDataAndFile(ctx) {
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      return { data, files };
    } else {
      return { data: JSON.parse(ctx.request.body) };
    }
  },

  /**
   * Utility to check constrain of input image
   *
   * @param {Image, null} image check if param image is image
   * @param {Bool} isArray check if image is array or not
   * @param {Bool} imageRequired check if image is required
   * @returns Throw if error exist
   */
  async checkImage(image, isArray, imageRequired = true) {
    if (imageRequired && !image) throw "Image Required";
    if (!image) return;

    if (Array.isArray(image) !== isArray) throw "Is Array";

    if (
      isArray &&
      image.length &&
      image.some(
        (item) => item && "type" in item && getType(item.name) !== "image"
      )
    ) {
      throw "Invalid file type";
    } else if (!image || ("type" in image && getType(image) !== "image"))
      throw "Invalid file type";
  },

  /**
   *
   * @param {Image, null} image to upload or replace
   * @param {Object} body required for upload and replace function
   * @param {Bool} imageId if exist image will be replace instead of upload
   * @returns Array of 1 image
   */
  async uploadOrReplaceImage(image, body, imageId = null) {
    if (!image) return null;
    if (imageId) {
      return [
        await strapi.plugins.upload.services.upload.replace(imageId, {
          data: await validateUploadBody(body),
          file: image,
        }),
      ];
    } else {
      return await strapi.plugins.upload.services.upload.upload({
        data: await validateUploadBody(body),
        files: image,
      });
    }
  },
};

/**
 * Get extension of file then get mime type
 */
function getType(image) {
  return mime.getType(image.name).split("/")[0];
}
