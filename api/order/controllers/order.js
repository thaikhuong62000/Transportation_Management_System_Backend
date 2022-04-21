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
          importQuantity: item.quantity,
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
        if (item.quantity === item.importQuantity) {
          exportResult[item.storage].push({
            id: item.id,
            timeUpdate: item.timeUpdate,
            timeCreate: item.timeCreate,
          });
        }
      }
    }

    let tracingResult = [];

    for (let item in importResult) {
      if (importResult && importResult[item]) {
        if (exportResult[item].length) {
          if (
            importResult[item].length === packages.length &&
            exportResult[item].length === packages.length
          ) {
            tracingResult.push({
              storage: item,
              status: 3,
              time: exportResult[item][exportResult[item].length - 1]
                .timeUpdate,
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
    const { id: customer, _id, point } = ctx.state.user;
    let {
      remain_fee,
      fee,
      from_address,
      to_address,
      packages,
      voucher = "",
      ...body
    } = ctx.request.body;

    const db = strapi.connections.default;
    let session;
    const {
      Package,
      Order,
      ComponentAddressAddress,
      ComponentPackageSize,
      UsersPermissionsUser,
    } = db.models;

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

      // try {
      //   if (!from_address.latitude || !from_address.longitude) {
      //     const response = await strapi.geocode(mergeAddress(from_address));
      //     const coord = response.data.results[0].geometry.location;
      //     from_address.latitude = coord.lat;
      //     from_address.longitude = coord.lng;
      //   }
      //   if (!to_address.latitude || !to_address.longitude) {
      //     const response = await strapi.geocode(mergeAddress(to_address));
      //     const coord = response.data.results[0].geometry.location;
      //     to_address.latitude = coord.lat;
      //     to_address.longitude = coord.lng;
      //   }
      // } catch (error) {
      //   throw "Invalid address";
      // }

      // Temporary comment
      // fee = await strapi.services.fee.calcFee(
      //   from_address,
      //   to_address,
      //   packages,
      //   ctx.state.user
      // );

      // Calculate fee from voucher and initial fee
      if (voucher) {
        let _voucher = await strapi.services.voucher.findOne({ id: voucher });
        if (!_voucher) {
          throw "Cannot find voucher";
        }

        let { sale_type, sale, sale_max } = _voucher;
        if (sale_type === "value") {
          if (fee >= sale) {
            fee = fee - sale;
          }
        } else if (sale_type === "percentage") {
          let discount = fee - (fee * sale) / 100;
          if (discount > sale_max) {
            discount = sale_max;
          }
          fee = fee - discount;
        }
      }

      remain_fee = fee;

      session = await db.startSession();
      session.startTransaction();

      const addresses = await ComponentAddressAddress.create(
        [from_address, to_address],
        { session: session }
      );

      let order = await Order.create(
        [
          {
            ...body,
            from_address: {
              kind: "ComponentAddressAddress",
              ref: addresses[0]._id,
            },
            to_address: {
              kind: "ComponentAddressAddress",
              ref: addresses[1]._id,
            },
            fee,
            remain_fee,
            customer,
          },
        ],
        { session: session }
      );

      if (!order) throw "Create order failed!";

      const size = await ComponentPackageSize.create(
        [...packages.map((item) => item.size)],
        { session: session }
      );

      for (let index = 0; index < size.length; index++) {
        packages[index] = {
          ...packages[index],
          size: { kind: "ComponentPackageSize", ref: size[index]._id },
          order: order[0]._id,
        };
      }

      packages = await Package.create([...packages], {
        session: session,
      });

      if (!packages) throw "Create package failed!";

      let user_point = await UsersPermissionsUser.findOneAndUpdate(
        {
          _id: _id,
        },
        {
          point: Number.parseInt(point) + Math.floor(fee / 100000),
        }
      ).session(session);

      if (!user_point) {
        throw "Cannot update user point";
      }

      await session.commitTransaction();
      session.endSession();

      return order[0];
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      session.endSession();
      return ctx.badRequest([
        {
          id: "order.create",
          message: JSON.stringify(error),
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
