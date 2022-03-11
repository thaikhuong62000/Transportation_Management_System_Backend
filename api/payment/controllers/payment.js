"use strict";
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async momoNotification(ctx) {
    const {
      amount = 0,
      extraData = "",
      message = "",
      resultCode = 0,
    } = ctx.request.body;

    console.log(ctx.request.body);
    console.log(Buffer.from(ctx.request.body.id, "base64").toString("ascii"));

    return ctx.send(204);
  },
};
