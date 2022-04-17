var mongoose = require("mongoose")

module.exports = {
  async generateReport(startTime, endTime, storage) {
    let importes = await strapi.query("import").model.aggregate([
      {
        $match: {
          storage: mongoose.Types.ObjectId(storage),
          createdAt: {
            $gte: startTime,
            $lte: endTime,
          },
        },
      },
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "package",
        },
      },
      {
        $unwind: "$package"
      },
      {
        $group: {
          _id: "$package._id",
          quantity: {
            $sum: "$quantity",
          },
          weight: {
            $first: "$package.weight"
          },
          size: {
            "$first": "$package.size"
          }
        },
      },
      {
        $unwind: "$size"
      },
      {
        $lookup: {
          from: "components_package_sizes",
          localField: "size.ref",
          foreignField: "_id",
          as: "size",
        },
      },
      {
        $unwind: "$size"
      },
    ]);

    let exportes = await strapi.query("export").model.aggregate([
      {
        $match: {
          storage: mongoose.Types.ObjectId(storage),
          createdAt: {
            $gte: startTime,
            $lte: endTime,
          },
        },
      },
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "package",
        },
      },
      {
        $unwind: "$package"
      },
      {
        $group: {
          _id: "$package._id",
          quantity: {
            $sum: "$quantity",
          },
        },
      },
    ]);

    return {
      importes,
      exportes
    };
  },
};
