"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    const { page = 0, size = 5 } = ctx.query;
    const { id } = ctx.state.user;

    let templates = await strapi.services[
      "order-template"
    ].getOrderTemplatesByUser(id, page * size, size);

    return templates;
  },

  async create(ctx) {
    const {
      name = "",
      receiver_name,
      receiver_phone,
      from_address,
      to_address,
    } = ctx.request.body;

    const { id } = ctx.state.user;

    if (!receiver_name || !receiver_phone) {
      return ctx.badRequest([
        {
          id: "order-template.create",
          message: "Invalid parameter",
        },
      ]);
    }

    let template = await strapi.query("order-template").create({
      user: id,
      name,
      receiver_name,
      receiver_phone,
      from_address,
      to_address,
    });

    return template;
  },

  async update(ctx) {
    const {
      name = "",
      receiver_name,
      receiver_phone,
      from_address,
      to_address,
    } = ctx.request.body;

    const { id } = ctx.params;

    if (!receiver_name || !receiver_phone) {
      return ctx.badRequest([
        {
          id: "order-template.update",
          message: "Invalid parameter",
        },
      ]);
    }

    let template = await strapi.query("order-template").update(
      { id: id },
      {
        name,
        receiver_name,
        receiver_phone,
        from_address,
        to_address,
      }
    );

    return template;
  },
};
