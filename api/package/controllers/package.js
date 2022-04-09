const { sanitizeEntity } = require("strapi-utils");
const validateUploadBody = require("strapi-plugin-upload/controllers/validation/upload");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async update(ctx) {
    const { id } = ctx.params;
    const {
      name = "",
      len,
      width,
      height,
      weight,
      quantity,
      state = 0,
      street = "",
      ward = "",
      province = "",
      city = "",
      position = "",
      current_address,
      package_type,
      size,
    } = ctx.request.body;

    if (!len || !width || !height || !weight || !quantity) {
      return ctx.badRequest("Invalid package parameter!");
    }

    if (state < 0) {
      return ctx.badRequest("Invalid package state!");
    }

    const package = await strapi.query("package").update(
      { _id: id },
      {
        name,
        weight,
        quantity,
        state,
        position,
        package_type,
        size: {
          ...size,
          len,
          width,
          height,
        },
        current_address: {
          ...current_address,
          street,
          ward,
          province,
          city,
        },
      },
      { new: true }
    );

    return sanitizeEntity(package, {
      model: strapi.query("package").model,
      includeFields: [
        "size",
        "current_address",
        "images",
        "name",
        "package_type",
        "position",
        "weight",
        "quantity",
      ],
    });
  },

  async updatePackageImage(ctx) {
    const { packagesId } = ctx.params;
    const files = ctx.request.files;
    const data = JSON.parse(ctx.request.body.data);
    const { _delete } = data;
    let _upload = Object.values(files)[0];

    if (!Array.isArray(_upload)) {
      _upload = _upload ? [_upload] : [];
    }

    if (
      Array.isArray(_upload) &&
      _upload.length &&
      _upload.some(
        (item) => item && "type" in item && item.type.split("/")[0] !== "image"
      )
    ) {
      return ctx.badRequest({
        errors: [
          {
            id: "Package.updatePackageImage",
            message: "Invalid file type",
          },
        ],
      });
    }

    if (_delete.length) {
      for (let element of _delete) {
        await strapi.query("file", "upload").model.deleteOne({ _id: element });
      }
    }

    if (_upload.length) {
      await strapi.plugins.upload.services.upload.upload({
        data: await validateUploadBody(ctx.request.body),
        files: _upload,
      });
    }
    let entities = await strapi.query("package").findOne({ id: packagesId });

    return sanitizeEntity(entities, {
      model: strapi.models.package,
      includeFields: ["images"],
    });
  },

  async getPackagesInStorage(ctx) {
    // Get package in storage and not exported yet (don't have shipment)
    const { storage, role } = ctx.state.user;
    const { page = 0, size = 5, storeId = "", state = 0 } = ctx.query;
    let packages = [];

    if (role.name === "Stocker") {
      packages = await strapi.query("import").find({
        // ...ctx.query,
        _limit: Number.parseInt(size),
        _start: page * Number.parseInt(size),
        storage: storage,
        "package.exports.storage": {
          $ne: storage,
        },
      });
    } else if (role.name === "Admin") {
      if (!storeId)
        return ctx.badRequest([
          {
            id: "package.getPackagesInStorage",
            message: "Invalid store id",
          },
        ]);

      packages = await strapi.query("import").find({
        _limit: size,
        _start: page * size,
        storage: storeId,
        "package.state": state,
        "package.exports.storage": {
          $ne: storage,
        },
      });
    }

    return packages.map((package) =>
      sanitizeEntity(package, {
        model: strapi.query("import").model,
        includeFields: [
          "package",
          "quantity",
          "size",
          "current_address",
          "note",
        ],
      })
    );
  },

  async getPackagesAfterScan(ctx) {
    // type: 0 - import
    // type: 1 - export

    const { id } = ctx.params;
    const { storage } = ctx.state.user;
    const { type } = ctx.request.query;

    let remainingPackage = "";

    let package = await strapi.query("package").findOne({
      id: id,
    });

    if (type === "0") {
      let storedPackage = await strapi.query("import").findOne({
        storage: storage,
        package: id,
      });

      remainingPackage = storedPackage
        ? package.quantity - storedPackage.quantity
        : package.quantity;
    } else if (type === "1") {
      let awaitExportPackage = await strapi.query("export").findOne({
        storage: storage,
        package: id,
      });

      remainingPackage = awaitExportPackage
        ? package.quantity - awaitExportPackage.quantity
        : package.quantity;
    }

    package = sanitizeEntity(package, {
      model: strapi.query("package").model,
      includeFields: [
        "name",
        "weight",
        "size",
        "note",
        "package_type",
        "quantity",
      ],
    });

    return {
      remainingPackage,
      ...package,
    };
  },

  async getUnArrangePackage(ctx) {
    const { storage } = ctx.params;
    const { state = 0 } = ctx.query

    let importedPack = await strapi.services.import.getCurrentImports(storage);

    let shipPack = await strapi.services[
      "shipment-item"
    ].getArrangedPackagesByStorage(storage);

    let unArrangePack = importedPack.reduce(
      (total, item) => {
        let temp = shipPack.find(item2 => item2.package._id.toString() === item.package._id.toString())
        if (temp) {
          let quantity = item.quantity - temp.quantity
          if (quantity && quantity > 0) {
            total.push({
              ...item.package,
              id: item._id,
              size: item.size,
              quantity: quantity
            })
          } 
        } else {
          total.push({
            ...item.package,
            id: item._id,
            size: item.size,
            quantity: item.quantity
          })
        }
        return total
      },
      []
    );
    
    unArrangePack = unArrangePack.filter(item => {
      return item.state === Number.parseInt(state)
    })

    return unArrangePack;
  },
};
