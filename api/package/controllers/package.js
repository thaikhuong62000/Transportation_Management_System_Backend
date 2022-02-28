const { sanitizeEntity } = require("strapi-utils");
const validateUploadBody = require("strapi-plugin-upload/controllers/validation/upload");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async update(ctx) {
    const { id } = ctx.params;
    const {
      name = "",
      len,
      width,
      height,
      weight,
      quantity,
      state,
      street = "",
      ward = "",
      province = "",
      city = "",
    } = ctx.request.body;

    if (!len || !width || !height || !weight || !quantity) {
      return ctx.badRequest("Invalid package parameter!");
    }

    if (state < 0) {
      return ctx.badRequest("Invalid package state!");
    }

    let size = { len, width, height };

    let current_address = { street, ward, province, city };

    const package = await strapi.query("package").update(
      { id: id },
      {
        name,
        size,
        weight,
        quantity,
        current_address,
        state,
      }
    );

    return sanitizeEntity(package, {
      model: strapi.models.package,
      includeFields: ["size", "current_address"],
    });
  },

  async updatePackageImage(ctx) {
    const { packagesId } = ctx.params;
    const files = ctx.request.files;
    const data = JSON.parse(ctx.request.body.data);
    const { _delete } = data;
    let _upload = Object.values(files)[0];

    if (!Array.isArray(_upload)) {
      _upload = _upload ? [_upload] : [];
    }

    if (
      Array.isArray(_upload) &&
      _upload.length &&
      _upload.some(
        (item) => item && "type" in item && item.type.split("/")[0] !== "image"
      )
    ) {
      return ctx.badRequest({
        errors: [
          {
            id: "Package.updatePackageImage",
            message: "Invalid file type",
          },
        ],
      });
    }

    if (_delete.length) {
      for (let element of _delete) {
        await strapi.query("file", "upload").model.deleteOne({ _id: element });
      }
    }

    if (_upload.length) {
      await strapi.plugins.upload.services.upload.upload({
        data: await validateUploadBody(ctx.request.body),
        files: _upload,
      });
    }
    let entities = await strapi.query("package").findOne({ id: packagesId });

    return sanitizeEntity(entities, {
      model: strapi.models.package,
      includeFields: ["images"],
    });
  },
};
