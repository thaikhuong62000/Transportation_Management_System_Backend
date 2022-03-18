"use strict";

const { sanitizeEntity } = require("strapi-utils/lib");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async getOrderTracing(ctx) {
    const { id } = ctx.params;

    let packages = await strapi.query("package").find({
      order: id,
    });

    packages = packages.map((pack) => {
      return sanitizeEntity(pack, {
        model: strapi.query("package").model,
        includeFields: ["quantity", "order", "current_address"],
      });
    });

    let imports = await strapi.services.import.getImporstByPackages(
      packages.map((item) => item.id)
    );

    let exports = await strapi.services.export.getExportsByPackages(
      packages.map((item) => item.id)
    );

    imports = imports
      .map((item) => {
        return {
          id: item.package._id,
          storage: item.storage.name,
          quantity: item.package.quantity,
          importQuantity: item.quantity,
          time: item.updatedAt,
        };
      })
      .reduce((total, item, index) => {
        total[item.storage] = total[item.storage] || [];
        total[item.storage].push(item);

        return total;
      }, {});

    exports = exports
      .map((item) => {
        return {
          id: item.package._id,
          storage: item.storage.name,
          quantity: item.package.quantity,
          importQuantity: item.quantity,
          time: item.updatedAt,
        };
      })
      .reduce((total, item) => {
        total[item.storage] = total[item.storage] || [];
        total[item.storage].push(item);

        return total;
      }, {});

    let importResult = {};

    for (let ele of Object.values(imports)) {
      for (let item of ele) {
        importResult[item.storage] = importResult[item.storage] || [];
        if (item.quantity === item.importQuantity) {
          importResult[item.storage].push({
            id: item.id,
            time: item.time,
          });
        }
      }
    }

    let exportResult = {};

    for (let ele of Object.values(exports)) {
      for (let item of ele) {
        exportResult[item.storage] = exportResult[item.storage] || [];
        if (item.quantity === item.importQuantity) {
          exportResult[item.storage].push({
            id: item.id,
            time: item.time,
          });
        }
      }
    }

    let tracingResult = [];

    for (let item in importResult) {
      if (importResult && importResult[item]) {
        if (exportResult[item]) {
          if (
            importResult[item].length === packages.length &&
            exportResult[item].length === packages.length
          ) {
            tracingResult.push({
              storage: item,
              status: 3,
              time: importResult[item][1].time,
            });
          } else if (
            importResult[item].length === packages.length &&
            exportResult[item].length < packages.length
          ) {
            tracingResult.push({
              storage: item,
              status: 2,
            });
          } else {
            tracingResult.push({
              storage: item,
              status: 5,
            });
          }
        } else {
          if (importResult[item].length === packages.length) {
            tracingResult.push({
              storage: item,
              status: 1,
              time: importResult[item][1].time,
            });
          } else {
            tracingResult.push({
              storage: item,
              status: 0,
            });
          }
        }
      }
    }

    let isLastStage = packages[0]?.current_address?.city
      ? packages[0].current_address.city === packages[0].order.to_address.city
      : false;

    return {
      tracingResult,
      lastStage: isLastStage,
    };
  },

  async getDeliveredOrder(ctx) {
    const { page = 0, size = 5 } = ctx.query;
    const { id } = ctx.state.user;

    let orders = await strapi.services.order.getDeliveredOrder(
      id,
      size,
      page * size
    );

    return orders;
  },

  async getDeliveringOrder(ctx) {
    const { page = 0, size = 10 } = ctx.query;
    const { id } = ctx.state.user;

    let orders = await strapi.services.order.getDeliveringOrder(
      id,
      size,
      page * size
    );

    return orders;
  },

  async create(ctx) {
    const { id } = ctx.state.user;
    const {
      sender_phone,
      sender_name,
      receiver_phone,
      receiver_name,
      method,
      fee,
      remain_fee,
      from_address,
      to_address,
      name,
      packages,
      payer_name,
      payer_phone,
      note = "",
    } = ctx.request.body;

    if (!remain_fee || remain_fee < 0 || !fee || fee < 0) {
      return ctx.badRequest([
        {
          id: "order.create",
          message: "Invalid order fee",
        },
      ]);
    }

    if (
      !sender_phone ||
      !sender_name ||
      !receiver_phone ||
      !receiver_name ||
      !payer_name ||
      !payer_phone ||
      !packages.length ||
      typeof from_address !== "object" ||
      typeof to_address !== "object"
    ) {
      return ctx.badRequest([
        {
          id: "order.create",
          message: "Invalid order information",
        },
      ]);
    }

    let order = await strapi.query("order").create({
      fee,
      remain_fee,
      sender_name,
      sender_phone,
      receiver_name,
      receiver_phone,
      from_address,
      to_address,
      name,
      note,
      customer: id,
    });

    let payment = await strapi.query("payment").create({
      method,
      payer_name,
      payer_phone,
      order: order.id,
    });

    for (let pack of packages) {
      await strapi.query("package").create({
        ...pack,
        order: order.id,
      });
    }

    return order;
  },
};
