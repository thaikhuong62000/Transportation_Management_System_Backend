"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Unused policy
 *
 * @param {*} ctx
 * @param {*} next
 */
module.exports = async (ctx, next) => {
  await next();
  if (ctx.response.body.user)
    ctx.response.body = {
      ...ctx.response.body,
      user: sanitizeEntity(ctx.response.body.user, {
        model: strapi.query("user", "users-permissions").model,
        includeFields: [
          "type",
          "name",
          "phone",
          "username",
          "email",
          "birthday",
          "address",
          "car",
          "avatar",
          "package_templates",
          "order_templates",
        ],
      }),
    };
};
