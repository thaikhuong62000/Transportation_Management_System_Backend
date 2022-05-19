"use-strict";

module.exports = async (ctx, next) => {
  await next();
  const { user: driver } = ctx.state;
  const shipment = ctx.response.body;
  if (shipment.packages && shipment.packages.length > 0) {
    const order = await strapi.services.order.findOne(
      {
        id: shipment.packages[0].order,
      },
      ["customer"]
    );
    let room = await strapi.services["room-chat"].findRoomByUsers(
      driver.id,
      order.customer.id
    );
    if (room === null) {
      room = await strapi.services["room-chat"].create({
        user1: driver.id,
        user2: order.customer.id,
      });
      await strapi.firebase.sendCloudMessage(order.customer.device_token, {
        id: String(driver.id),
        name: driver.name,
        phone: driver.phone,
        avatar: driver.avatar?.url ? driver.avatar?.url : "",
        room: room.id,
        type: "ROOM",
      });
    }

    const messageData = {
      text: `Tôi đang tiếp nhận vận chuyển đơn hàng ${
        order.name ? order.name : order.id
      }`,
      user: {
        _id: driver.id,
        name: driver.name,
        avatar: driver.avatar?.url ? driver.avatar?.url : "",
      },
      createdAt: new Date(),
      _id: `${Math.random()}`,
    };

    strapi.services.message.create({
      subID: messageData._id,
      text: messageData.text,
      user: messageData.user._id,
      room: room.id,
    });

    strapi.firebase.sendCloudMessage(order.customer.device_token, {
      data: JSON.stringify(messageData),
      room: room.id,
      type: "CHAT",
    });
  }
};
