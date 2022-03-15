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
      [{ path: "car" }]
    );

    return shipments.map((entity) => {
      const {
        from_address,
        id,
        car: { licence },
      } = entity;
      return { id, from_address, licence };
    });
  },

  async find(ctx) {
    const { page = 0, size = 5 } = ctx.query;
    const { storage } = ctx.state.user;

    let imports = await strapi.services.import.getImportByStorage(
      storage,
      size,
      page * size
    );

    return imports.map((item) =>
      sanitizeEntity(item, {
        model: strapi.query("import").model,
      })
    );
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
