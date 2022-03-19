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

    let rawData = Buffer.from(extraData, "base64").toString("ascii");
    let parsedId = JSON.parse(rawData).id;

    let order = await strapi.query("order").findOne({
      id: parsedId,
    });

    if (resultCode === 0) {
      if (order.fee >= amount) {
        await strapi
          .query("order")
          .update({ id: parsedId }, { remain_fee: order.fee - amount });

        await strapi.query("payment").update(
          { order: parsedId },
          {
            paid: amount,
            time: new Date(),
          }
        );
      }
    } else {
      await strapi.query("order").delete({ id: parsedId });
      await strapi.query("payment").delete({ _id: order.payments[0]._id });
    }
    return ctx.send(204);
  },
};
