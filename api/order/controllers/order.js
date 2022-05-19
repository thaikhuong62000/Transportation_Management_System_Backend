"use strict";

const { sanitizeEntity } = require("strapi-utils/lib");

module.exports = {
  async getOrderTracing(ctx) {
    const { id } = ctx.params;

    let packages = await strapi.query("package").find({
      order: id,
    });

    packages = packages.map((pack) => {
      return sanitizeEntity(pack, {
        model: strapi.query("package").model,
        includeFields: ["quantity", "order", "current_address", "state"],
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
          timeUpdate: item.updatedAt,
          timeCreate: item.createdAt,
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
          exportQuantity: item.quantity,
          timeUpdate: item.updatedAt,
          timeCreate: item.createdAt,
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
            timeUpdate: item.timeUpdate,
            timeCreate: item.timeCreate,
          });
        }
      }
    }

    let exportResult = {};

    for (let ele of Object.values(exports)) {
      for (let item of ele) {
        exportResult[item.storage] = exportResult[item.storage] || [];
        if (item.quantity === item.exportQuantity) {
          exportResult[item.storage].push({
            id: item.id,
            timeUpdate: item.timeUpdate,
            timeCreate: item.timeCreate,
          });
        } else {
          exportResult[item.storage].push({
            id: item.id,
            timeUpdate: item.timeUpdate,
            timeCreate: item.timeCreate,
            remain: true,
          });
        }
      }
    }

    let tracingResult = [];

    for (let item in importResult) {
      if (importResult && importResult[item]) {
        if (exportResult[item] && exportResult[item].length) {
          if (
            importResult[item].length === packages.length &&
            exportResult[item].length === packages.length &&
            !exportResult[item].some((pack) => pack.remain)
          ) {
            tracingResult.push({
              storage: item,
              status: 3,
              time: exportResult[item][exportResult[item].length - 1]
                .timeUpdate,
            });
          } else if (
            (importResult[item].length === packages.length &&
              exportResult[item].length < packages.length) ||
            (exportResult[item].some((pack) => pack.remain) &&
              exportResult[item].length === packages.length &&
              importResult[item].length === packages.length)
          ) {
            tracingResult.push({
              storage: item,
              status: 2,
            });
          } else {
            tracingResult.push({
              storage: item,
              status: 0,
            });
          }
        } else {
          if (importResult[item].length === packages.length) {
            tracingResult.push({
              storage: item,
              status: 1,
              time: importResult[item][importResult[item].length - 1]
                .timeUpdate,
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

    let isLastStage = packages.every((item) => item.state === 3);

    return {
      importResult,
      exportResult,
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
    const { id: customer } = ctx.state.user;
    let {
      remain_fee,
      fee,
      from_address,
      to_address,
      packages,
      voucher,
      state,
      payments,
      ...body
    } = ctx.request.body;

    const db = strapi.connections.default;
    const { Package, ComponentPackageSize } = db.models;

    try {
      if (
        !body.sender_phone ||
        !body.sender_name ||
        !body.receiver_phone ||
        !body.receiver_name ||
        typeof from_address !== "object" ||
        typeof to_address !== "object"
      ) {
        throw "Invalid order information";
      }

      // Check coords of addresses
      // Calculate fee
      // Apply voucher
      fee = await strapi.services.fee.calcFee(
        from_address,
        to_address,
        packages,
        ctx.state.user,
        voucher,
        customer
      );
      fee = Math.ceil(fee);
      remain_fee = fee;

      const order = await strapi.services.order.create({
        ...body,
        from_address,
        to_address,
        fee,
        remain_fee,
        customer,
      });

      const size = await ComponentPackageSize.create([
        ...packages.map((item) => item.size),
      ]);
      for (let index = 0; index < size.length; index++) {
        packages[index] = {
          ...packages[index],
          size: { kind: "ComponentPackageSize", ref: size[index]._id },
          order: order._id,
        };
      }
      packages = await Package.create([...packages]);

      return { ...order, packages };
    } catch (error) {
      return ctx.badRequest([
        {
          id: "order.create",
          message: error,
        },
      ]);
    }
  },

  async update(ctx) {
    let { id } = ctx.params;
    let { state = 0 } = ctx.request.body;
    let order = await strapi.services.order.update(
      { id: id },
      ctx.request.body
    );
    if (state === 5) {
      let shipments = await strapi.services.shipment.update(
        {
          packages: {
            $in: order.packages.map((item) => item.id),
          },
        },
        {
          arrived_time: new Date().toISOString(),
          $unset: {
            driver: undefined
          }
        }
      );

      shipments = await strapi.services.shipment.find({
        packages: {
          $in: order.packages.map((item) => item.id),
        },
      });

      await strapi.services["shipment-item"].delete({
        shipment: {
          $in: shipments.map((item) => item.id)
        },
      });
    }
    return order;
  },
};
