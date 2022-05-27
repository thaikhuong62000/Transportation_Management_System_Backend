"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    const { _start = 0, _limit = 5 } = ctx.query;
    const { id } = ctx.state.user;

    let templates = await strapi.services["package-template"].search({
      ...ctx.query,
      _limit: _limit,
      _start: _start * _limit,
      user: id,
    });

    return templates;
  },

  async create(ctx) {
    const { name, package_type, quantity, weight, len, width, height, note } =
      ctx.request.body;

    const { id } = ctx.state.user;

    if (!quantity || !weight || !len || !width || !height || !package_type) {
      return ctx.badRequest([
        {
          id: "package-template.create",
          message: "Invalid parameter",
        },
      ]);
    }

    let template = await strapi.query("package-template").create({
      user: id,
      name,
      package_type,
      quantity,
      weight,
      size: {
        len,
        width,
        height,
      },
      note,
    });

    return template;
  },

  async update(ctx) {
    const {
      name,
      package_type,
      quantity,
      weight,
      len,
      width,
      height,
      note,
      size,
    } = ctx.request.body;

    const { id } = ctx.params;

    if (!quantity || !weight || !len || !width || !height || !package_type) {
      return ctx.badRequest([
        {
          id: "package-template.update",
          message: "Invalid parameter",
        },
      ]);
    }

    let template = await strapi.query("package-template").update(
      { id: id },
      {
        name,
        package_type,
        quantity,
        weight,
        size: {
          ...size,
          len,
          width,
          height,
        },
        note,
      }
    );

    return template;
  },

  async deleteTemplates(ctx) {
    const { deleteList } = ctx.request.body;
    const { id } = ctx.state.user;

    for (let item of deleteList) {
      await strapi.query("package-template").delete({
        id: item,
      });
    }

    return await strapi.query("package-template").find({
      user: id,
    });
  },
};
