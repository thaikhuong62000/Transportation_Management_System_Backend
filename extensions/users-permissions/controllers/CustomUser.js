"use strict";
const { sanitizeEntity } = require("strapi-utils");
var moment = require("moment");

module.exports = {
  async getDriverStatus(ctx) {
    let unfinishedShip =
      await strapi.services.shipment.getUnfinishedShipmentByDriver(
        0,
        0,
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
        count: car ? "Tốt" : "Không tốt",
        color: "#1cacff",
      },
    ];
  },

  async getStorekeeperStatus(ctx) {
    const { storage } = ctx.state.user;

    const totalPackage =
      await strapi.services.shipment.getTotalPackageNeedImport(storage);

    const isNight =
      new Date().getHours() > 20 || new Date().getHours < 5
        ? "Ngưng hoạt động"
        : "Đang hoạt động";

    return {
      storage_status: isNight,
      total_packages: totalPackage ? totalPackage["total_packages"] : 0,
    };
  },

  async getAdminStatus(ctx) {
    let date = new Date();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let quarterlyIncome = await strapi.plugins[
      "users-permissions"
    ].services.user.getIncome(
      (Math.ceil(month / 3) - 1) * 3 + 1,
      (Math.ceil(month / 3) - 1) * 3 + 3,
      year
    );

    let yearlyIncome = await strapi.plugins[
      "users-permissions"
    ].services.user.getIncome(1, 12, year);

    let currentOrder = await strapi.services.order.count({
      state: 0,
    });

    let unshipOrder = await strapi.services.order.count({
      state_in: [1, 3],
    });

    let shipments = await strapi.services.shipment.getShipmentByMonth(month)

    return {
      quarterlyIncome: quarterlyIncome ? quarterlyIncome.income : 0,
      yearlyIncome: yearlyIncome ? yearlyIncome.income : 0,
      currentOrder: currentOrder,
      unshipOrder: unshipOrder,
      shipments
    };
  },

  async getAssistanceInfo(ctx) {
    let shipments =
      await strapi.services.shipment.getUnfinishedShipmentByDriver(
        ctx.state.user.id
      );

    let assistance = await strapi
      .query("user", "users-permissions")
      .findOne({ id: shipments[0].assistance });

    return sanitizeEntity(assistance, {
      model: strapi.query("user", "users-permissions").model,
      includeFields: ["name", "phone"],
    });
  },

  async getCustomerList(ctx) {
    const { _start = 0, _limit = 5 } = ctx.query;

    let customers = await strapi.query("user", "users-permissions").search({
      ...ctx.query,
      _start: _start * _limit,
      _limit: _limit,
      "role.name": "Customer",
    });

    let totalPage = Math.ceil(customers.length / _limit);

    return {
      customers: customers,
      totalPage,
    };
  },

  async getStaffList(ctx) {
    const { _start = 0, _limit = 5 } = ctx.query;

    let staffs = await strapi.query("user", "users-permissions").search({
      ...ctx.query,
      _start: _start * _limit,
      _limit: _limit,
      "role.name": {
        $in: ["Driver", "Assistance", "Stocker"],
      },
    });

    let totalPage = Math.ceil(staffs.length / _limit);

    return {
      staffs: staffs,
      totalPage,
    };
  },
};
