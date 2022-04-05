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
    const { id: customer } = ctx.state.user;
    let { remain_fee, fee, from_address, to_address, packages, ...body } =
      ctx.request.body;

    const db = strapi.connections.default;
    const session = await db.startSession();
    session.startTransaction();
    const { Package, Order, ComponentAddressAddress } = db.models;

    try {
      if (!remain_fee || remain_fee < 0 || !fee || fee < 0) {
        if (role.name !== "Admin") throw "Invalid order fee";
      }

      if (
        !body.sender_phone ||
        !body.sender_name ||
        !body.receiver_phone ||
        !body.receiver_name ||
        !packages ||
        !packages.length ||
        typeof from_address !== "object" ||
        typeof to_address !== "object"
      ) {
        if (role.name !== "Admin") throw "Invalid order information";
      }

      try {
        if (!from_address.latitude || !from_address.longitude) {
          const response = await strapi.geocode(mergeAddress(from_address));
          const coord = response.data.results[0].geometry.location;
          from_address.latitude = coord.lat;
          from_address.longitude = coord.lng;
        }
        if (!to_address.latitude || !to_address.longitude) {
          const response = await strapi.geocode(mergeAddress(to_address));
          const coord = response.data.results[0].geometry.location;
          to_address.latitude = coord.lat;
          to_address.longitude = coord.lng;
        }
      } catch (error) {
        // throw "Invalid address";
      }

      // TODO: Calculate Fee
      fee = strapi.services.fee.calcFee(
        from_address,
        to_address,
        packages,
        ctx.state.user
      );
      remain_fee = fee;

      const addresses = await ComponentAddressAddress.create(
        [from_address, to_address],
        { session: session }
      );

      const packages = await Package.create([...packages], {
        session: session,
      });

      const order = await Order.create(
        [
          {
            ...body,
            from_address: addresses[0]._id,
            to_address: addresses[1]._id,
            fee,
            remain_fee,
            customer,
            packages: packages.map((item) => item._id),
          },
        ],
        { session: session }
      );

      if (!order) throw "Create order failed!";

      await session.commitTransaction();
      session.endSession();

      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return ctx.badRequest([
        {
          id: "order.create",
          message: error,
        },
      ]);
    }
  },
};

function mergeAddress(address) {
  let newAddress = "";
  ["street", "ward", "province", "city"].forEach((element) => {
    if (address[element] && address[element] !== "")
      newAddress = newAddress + `, ${address[element]}`;
  });
  return newAddress.slice(1);
}
