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

    console.log(ctx.request.body)

    let rawData = Buffer.from(extraData, "base64").toString("ascii");
    let parsedId = "";

    try {
      parsedId = JSON.parse(rawData).id;
    } catch (error) {
      return ctx.send(204);
    }

    let order = await strapi.query("order").findOne({
      id: parsedId,
    });

    const db = strapi.connections.default;
    let session;
    const { Payment, UsersPermissionsUser, Order } = db.models;

    try {
      session = await db.startSession();
      session.startTransaction();

      if (resultCode === 0) {
        if (Number.parseInt(order.remain_fee) >= Number.parseInt(amount)) {
          let _order = await Order.findOneAndUpdate(
            { _id: order._id },
            {
              remain_fee:
                Number.parseInt(order.remain_fee) - Number.parseInt(amount),
            }
          ).session(session);

          if (!_order) {
            throw "Update order fee failed";
          }

          let created_payment = await Payment.create(
            [
              {
                payer_name: order.sender_name,
                payer_phone: order.sender_phone,
                order: parsedId,
                paid: Number.parseInt(amount),
                method: "momo",
              },
            ],
            { session: session }
          );

          if (!created_payment) {
            throw "Created payment failed";
          }

          let { point } = strapi.tms.config;

          let point_level = Object.keys(point)
            .filter(
              (item) =>
                Number.parseInt(order.customer.point) +
                  Math.floor(amount / 100000) >=
                point[item]
            )
            .reverse()[0];

          let updated_level = handlePointLevel(point_level);

          let user_point = await UsersPermissionsUser.findOneAndUpdate(
            {
              _id: order.customer._id,
            },
            {
              point:
                Number.parseInt(order.customer.point) +
                Math.floor(amount / 100000),
              type: updated_level,
            }
          ).session(session);

          if (!user_point) {
            throw "Cannot update user point";
          }

          await session.commitTransaction();
          session.endSession();
        }
      }
      return ctx.send(204);
    } catch (error) {
      console.log(error)
      await session.abortTransaction();
      session.endSession();
      return ctx.send(204);
    }
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

    const db = strapi.connections.default;
    let session;
    const { Payment, UsersPermissionsUser, Order } = db.models;

    try {
      const { payer_name = "", payer_phone = "", order = "", paid = 0 } = data;

      session = await db.startSession();
      session.startTransaction();

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

      let order_ = await Order.findOne({
        _id: order,
      });

      let { customer } = await Order.populate(order_, {
        path: "customer",
      });

      if (order_.remain_fee >= paid) {
        order_ = await Order.findOneAndUpdate(
          { _id: order },
          { remain_fee: order_.remain_fee - Number.parseInt(paid) }
        ).session(session);

        if (!order_) {
          throw "Update order failed";
        }

        const image =
          await strapi.plugins.upload.services.utils.uploadOrReplaceImage(
            receipt,
            ctx.request.body
          );

        let created_payment = await Payment.create(
          [
            {
              payer_name: payer_name,
              payer_phone: payer_phone,
              method: "direct",
              order: order,
              paid: paid,
              receipt: image ? image[0].id : image,
              driver: ctx.state.user.id,
            },
          ],
          { session: session }
        );

        if (!created_payment) {
          throw "Create payment failed";
        }

        let { point } = strapi.tms.config;

        let point_level = Object.keys(point)
          .filter(
            (item) =>
              Number.parseInt(customer.point) + Math.floor(paid / 100000) >=
              point[item]
          )
          .reverse()[0];

        let updated_level = handlePointLevel(point_level);

        let user_point = await UsersPermissionsUser.findOneAndUpdate(
          {
            _id: customer._id,
          },
          {
            point: Number.parseInt(customer.point) + Math.floor(paid / 100000),
            type: updated_level,
          }
        ).session(session);

        if (!user_point) {
          throw "Cannot update user point";
        }

        await session.commitTransaction();
        session.endSession();

        return created_payment[0];
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
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return ctx.badRequest([
        {
          id: "payment.create",
          message: JSON.stringify(error),
        },
      ]);
    }
  },
};

function handlePointLevel(level) {
  switch (level) {
    case "silver":
      return "Iron";
    case "gold":
      return "Gold";
    case "diamond":
      return "Diamond";
    case "platinum":
      return "Platinum";
    default:
      return "User";
  }
}
