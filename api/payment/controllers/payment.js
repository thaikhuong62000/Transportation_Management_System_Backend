"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async momoNotification(ctx) {
    const { resultCode, message } = ctx.request.body;
    // TODO: Response to momo ipn post and check for payment status
    // TODO: Validate amount and currency in database and momo body

    console.log(ctx.request.body);

    return ctx.send(
      {
        resultCode: resultCode,
        message: message,
      },
      204
    );
  },
};
