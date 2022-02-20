const { sanitizeEntity } = require("strapi-utils");

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
};
