"use strict";
const { sanitizeEntity } = require("strapi-utils");
var moment = require("moment");

module.exports = {
  async getDriverStatus(ctx) {
    let unfinishedShip =
      await strapi.services.shipment.getUnfinishedShipmentByDriver(
        ctx.state.user.id
      );

    let finishedShip =
      await strapi.services.shipment.getFinishedShipmentByDriverByMonth(
        ctx.state.user.id,
        parseInt(moment().format("MM"))
      );

    let car = await strapi.services.car.findOne({ id: ctx.state.user.car }, []);

    return [
      {
        name: "Đơn hàng hiện tại",
        iconName: "assignment",
        count: unfinishedShip.length,
        color: "#f0b432",
      },
      {
        name: "Hoàn thành tháng",
        iconName: "event-available",
        count: finishedShip.length,
        color: "#5ffa62",
      },
      {
        name: "Trạng thái xe",
        iconName: "local-shipping",
        count: car ? 1 : 0,
        color: "#1cacff",
      },
    ];
  },
};
