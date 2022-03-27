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

  async create(ctx) {
    const {
      data,
      files: { receipt },
    } = await strapi.plugins.upload.services.utils.getDataAndFile(ctx);

    try {
      await strapi.plugins.upload.services.utils.checkImage(
        receipt,
        false,
        false
      );
    } catch (error) {
      return ctx.badRequest({
        errors: [
          {
            id: "Payment.create",
            message: "Image error",
          },
        ],
      });
    }

    const { payer_name = "", payer_phone = "", order = "", paid = 0 } = data;

    if (paid < 0) {
      return ctx.badRequest({
        errors: [
          {
            id: "Payment.create",
            message: "Negative Payment",
          },
        ],
      });
    }

    const order_ = await strapi.query("order").findOne({
      id: order,
    });

    if (order_.remain_fee >= paid) {
      await strapi
        .query("order")
        .update({ id: order }, { remain_fee: order_.remain_fee - paid });

      const image =
        await strapi.plugins.upload.services.utils.uploadOrReplaceImage(
          receipt,
          ctx.request.body
        );

      await strapi.services.payment.create({
        payer_name: payer_name,
        payer_phone: payer_phone,
        method: "direct",
        order: order,
        paid: paid,
        receipt: image ? image[0].id : image,
        driver: ctx.state.user.id,
      });

      return ctx.created();
    } else {
      return ctx.badRequest({
        errors: [
          {
            id: "Payment.create",
            message: "Payment > Fee",
          },
        ],
      });
    }
  },
};
