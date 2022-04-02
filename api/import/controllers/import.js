"use strict";
const { sanitizeEntity } = require("strapi-utils");
var mongoose = require("mongoose");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async getCurrentImport(ctx) {
    let shipments = await strapi.services.shipment.find(
      {
        _where: [
          { to_storage: ctx.state.user.storage },
          { arrived_time_null: true },
        ],
      },
      [{ path: "driver", populate: "car" }]
    );

    return shipments.map((entity) => {
      const {
        from_address,
        id,
        driver: { car },
      } = entity;
      return { id, from_address, licence: car.licence };
    });
  },

  async update(ctx) {
    const { storage } = ctx.state.user;
    const { quantity, packageId } = ctx.request.body;
    const importedId = ctx.params.id;

    if (quantity < 0 || !quantity) {
      return ctx.badRequest([
        {
          id: "import.updateImportQuantityByPackage",
          message: "Invalid package quantity",
        },
      ]);
    }

    let importedPackage = await strapi.query("import").findOne(
      {
        id: importedId,
      },
      ["package"]
    );

    // If imported package not exist, then create a new one
    if (!importedPackage) {
      let newImport = await strapi.query("import").create({
        package: packageId,
        quantity: quantity,
        store_manager: ctx.state.user.id,
        storage: storage,
      });

      return newImport;
    }

    if (quantity > importedPackage.package.quantity) {
      return ctx.badRequest([
        {
          id: "import.updateImportQuantityByPackage",
          message: "Invalid package quantity",
        },
      ]);
    }

    let updatedImport = await strapi.query("import").update(
      {
        id: importedId,
      },
      {
        quantity: quantity,
      }
    );

    return updatedImport;
  },

  async updateImportQuantityByPackage(ctx) {
    const { packageId, quantity } = ctx.request.body;
    const { storage, id } = ctx.state.user;

    let pack = await strapi.services.package.findOne({ id: packageId });
    if (!pack) {
      return ctx.badRequest([
        {
          id: "import.updateImportQuantityByPackage",
          message: "invalid QR code",
        },
      ]);
    }

    if (!quantity && quantity < 0) {
      return ctx.badRequest([
        {
          id: "import.updateImportQuantityByPackage",
          message: "Invalid package quantity",
        },
      ]);
    }

    let importedPackage = await strapi
      .query("import")
      .model.findOneAndUpdate(
        { package: packageId },
        { quantity: quantity },
        { new: true }
      );

    if (!importedPackage) {
      let newImport = await strapi.query("import").create({
        package: packageId,
        quantity: quantity,
        store_manager: id,
        storage: storage,
      });

      // update package address
      let store = await strapi.services.storage.findOne({ id: storage });
      let { street, ward, city, province, longitude } = store.address;

      await strapi.services.package.update(
        { id: packageId },
        {
          current_address: {
            street,
            ward,
            city,
            province,
            longitude,
          },
        }
      );

      return sanitizeEntity(newImport, {
        model: strapi.query("import").model,
        includeFields: ["quantity"],
      });
    }

    return sanitizeEntity(importedPackage, {
      model: strapi.query("import").model,
      includeFields: ["quantity"],
    });
  },
};
