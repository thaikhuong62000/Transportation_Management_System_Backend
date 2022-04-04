"use strict";
const { sanitizeEntity } = require("strapi-utils");
var moment = require("moment");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   * Return info of a shipment for driver (included sender/receiver info, some of order info)
   *
   * Precondition: Logined in as Driver
   * @param {String: param} id of a shipment
   * @returns
   */
  async findOne(ctx) {
    const { id } = ctx.params;

    let shipment = await strapi.services.shipment.findOne({ id }, [
      "packages",
      "from_storage",
      "to_storage",
    ]);
    shipment = sanitizeEntity(shipment, {
      model: strapi.models.shipment,
      includeFields: ["packages", "from_storage", "to_storage"],
    });

    if (
      shipment.packages.length > 0 &&
      !(shipment.from_storage && shipment.to_storage)
    ) {
      const order = await strapi.services.order.findOne(
        { id: shipment.packages[0].order },
        []
      );
      return { ...shipment, ...order, order_id: shipment.packages[0].order };
    } else return shipment;
  },

  /**
   * Get current shipment of a driver and nearby shipment
   *
   * Precondition: Logined in as Driver
   * @returns
   */
  async getCurrentShipment(ctx) {
    let shipments =
      await strapi.services.shipment.getUnfinishedShipmentByDriver(
        ctx.state.user.id
      );

    return shipments.map((entity) =>
      sanitizeEntity(entity, {
        model: strapi.models.shipment,
        includeFields: ["to_address", "arrived_time"],
      })
    );
  },

  /**
   * Get finished shipment of a driver
   *
   * Precondition: Logined in as Driver
   * @returns
   */
  async getFinishedShipment(ctx) {
    const { pageIndex = 0 } = ctx.query;
    let shipments = await strapi.services.shipment.getFinishedShipmentByDriver(
      ctx.state.user.id,
      pageIndex * 10,
      10
    );

    return shipments.map((entity) =>
      sanitizeEntity(entity, {
        model: strapi.models.shipment,
        includeFields: ["to_address", "arrived_time"],
      })
    );
  },

  /**
   *
   * @param {String: param} id of a shipment
   * @returns
   */
  async getVehicleDetailByShipment(ctx) {
    const { id } = ctx.params;

    let shipmentDetail = await strapi.query("shipment").findOne({ id: id });

    shipmentDetail = sanitizeEntity(shipmentDetail, {
      model: strapi.models.shipment,
      includeFields: ["packages", "to_address", "driver", "assistance"],
    });

    const totalWeight = shipmentDetail.packages.reduce((total, item) => {
      return total + item.weight * item.quantity;
    }, 0);

    return {
      total_weight: totalWeight,
      ...shipmentDetail,
    };
  },

  /**
   * Create shipment
   * Split Order
   * Update package, order state
   * Update vehicle's shipment
   *
   * @param {...} ...
   * @returns
   */
  async create(ctx) {
    let {
      orderId,
      vehicleId,
      shipmentInfo,
      newOrderInfo,
      updateQuantityList = [], // {id, quantity}
      updatePackageList = [], // {id},
      removePackageList = [], // {id}
      newPackageList = [],
      orderState = null, // number
    } = ctx.request.body;
    let shipment = "";

    if (newOrderInfo) {
      // Update quantity of package for old order
      if (updateQuantityList.length) {
        for (let item of updateQuantityList) {
          await strapi.services.package.update(
            { id: item.id },
            { quantity: item.quantity }
          );
        }
      }

      // Remove relation of package have full quantity for shipment
      if (updatePackageList.length) {
        await strapi.services.order.update(
          { id: orderId },
          { packages: updatePackageList }
        );
      }

      // Create package for order
      let newOrder = await strapi.services.order.create(newOrderInfo);
      if (newPackageList) {
        for (let pack of newPackageList) {
          await strapi.services.package.create({
            ...pack,
            state: 1,
            order: newOrder.id,
          });
        }
      }

      // Add package relation
      let insertedOrder = await strapi.services.order.findOne({
        id: newOrder.id,
      });
      if (removePackageList.length) {
        insertedOrder = await strapi.services.order.update(
          {
            id: insertedOrder.id,
          },
          {
            packages: [
              ...insertedOrder.packages.map((item) => item.id),
              ...removePackageList,
            ],
          }
        );
      }

      // Create shipment
      shipment = await strapi.services.shipment.create({
        ...shipmentInfo,
        packages: insertedOrder.packages.map((item) => item.id),
      });

      // Update car current shipments
      await strapi.services.car.update(
        {
          id: vehicleId,
        },
        {
          $push: {
            shipments: shipment.id,
          },
        }
      );
    } else {
      shipment = await strapi.services.shipment.create(shipmentInfo);

      //  Update current shipments for car
      await strapi.services.car.update(
        { id: vehicleId },
        {
          $push: {
            shipments: shipment.id,
          },
        }
      );

      // Update order state and package state
      if (orderState && orderState !== null) {
        await strapi.services.order.update(
          { id: orderId },
          { state: orderState }
        );
        await strapi.services.package.update(
          { order: orderId },
          { state: orderState, multi: true }
        );
      }
    }

    return shipment;
  },
};
