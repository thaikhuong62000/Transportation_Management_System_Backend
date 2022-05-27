"use strict";

const { sanitizeEntity } = require("strapi-utils/lib");

module.exports = {
  async getOrderTracing(ctx) {
    const { id } = ctx.params;

    const order = await strapi.query("order").findOne({ id }, [
      {
        path: "packages",
        populate: [
          { path: "imports", populate: "storage" },
          { path: "exports", populate: "storage" },
        ],
      },
    ]);

    const packages = order.packages;

    let importResult = {};
    let exportResult = {};

    // Sort importResult's storage by import time
    packages
      .reduce((pre, curr) => pre.concat(curr.imports), [])
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
      .map((_import) => _import.storage.name)
      .forEach((item) => (importResult[item] = []));

    packages.forEach((_pack) => {
      let sumImport = {};
      let sumExport = {};
      // Sum import and export
      _pack.imports.forEach((_import) => {
        let quantity = _import.quantity;
        if (sumImport[_import.storage.name]) {
          quantity += sumImport[_import.storage.name].quantity;
        }
        sumImport[_import.storage.name] = {
          quantity,
          timeUpdate: _import.updatedAt,
          timeCreate: _import.createdAt,
          address: _import.storage.address,
        };
      });
      _pack["exports"].forEach((_export) => {
        let quantity = _export.quantity;
        if (sumExport[_export.storage.name]) {
          quantity += sumExport[_export.storage.name].quantity;
        }
        sumExport[_export.storage.name] = {
          quantity,
          timeUpdate: _export.updatedAt,
          timeCreate: _export.createdAt,
        };
      });
      // Add data to importResult & exportResult
      Object.keys(sumImport).forEach((_storage) => {
        let remain = sumImport[_storage].quantity;
        if (sumExport[_storage]?.quantity)
          remain -= sumExport[_storage].quantity;
        importResult[_storage].push({
          id: _pack.id,
          ...sumImport[_storage],
          imported: sumImport[_storage].quantity,
          remain,
          quantity: _pack.quantity,
        });
      });
      Object.keys(sumExport).forEach((_storage) => {
        if (!exportResult[_storage]) exportResult[_storage] = [];
        exportResult[_storage].push({
          id: _pack.id,
          ...sumExport[_storage],
          exported: sumExport[_storage].quantity,
          quantity: _pack.quantity,
        });
      });
    });

    let tracingResult = [];

    Object.keys(importResult).forEach((storage) => {
      let state = 3;
      let isExported = false;
      for (let i in importResult[storage]) {
        const pack = importResult[storage][i];
        if (pack.remain) {
          state = 2;
        }
        if (pack.remain < pack.imported) {
          isExported = true;
        }
        if (pack.quantity !== pack.imported) {
          state = 0;
          break;
        }
      }
      if (!isExported && state) state = 1;
      let time;
      if (state === 1) time = importResult[storage][0].timeCreate;
      if (state === 3) time = exportResult[storage][0].timeCreate;
      tracingResult.push({
        storage,
        status: state,
        time,
      });
    });

    let isLastStage = packages.every((item) => item.state === 3);

    // Find currently transport package
    let shipments = await strapi.services.shipment.find(
      {
        packages_in: packages.map((item) => item.id),
        driver_null: false,
      },
      ["shipment_items", "driver"]
    );

    shipments = await sanitizeEntity(shipments, {
      model: strapi.query("shipment").model,
      includeFields: ["shipment_items", "driver"],
    });

    let currentShipment = [];

    shipments.forEach((shipment) => {
      // Filter active shipment item
      let items = {};
      shipment.shipment_items.forEach((item) => {
        if (item.assmin === false && item.quantity - item.received > 0)
          items[item.package] = item.quantity - item.received;
        if (item.assmin === true && item.export_received - item.received > 0)
          items[item.package] = item.export_received - item.received;
      });
      // Get filter items
      let _packages = {};
      packages.forEach((pack) => {
        if (items[pack.id]) _packages[pack.id] = items[pack.id];
      });

      if (Object.keys(_packages).length)
        currentShipment.push({
          coord: {
            latitude: shipment.driver.latitude,
            longitude: shipment.driver.longitude,
          },
          packages: _packages,
        });
    });

    return {
      importResult,
      exportResult,
      tracingResult,
      currentShipment,
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
            driver: undefined,
          },
        }
      );

      shipments = await strapi.services.shipment.find({
        packages: {
          $in: order.packages.map((item) => item.id),
        },
      });

      await strapi.services["shipment-item"].delete({
        shipment: {
          $in: shipments.map((item) => item.id),
        },
      });
    }
    return order;
  },
};
