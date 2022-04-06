const moment = require("moment");

module.exports = {
  async createReport(ctx) {
    let { storage } = ctx.params;
    let { type } = ctx.query;

    let startTime = "";
    let endTime = "";
    let date = new Date();
    let result = "";
    if (type === "today") {
      startTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      endTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );
      result = await strapi.plugins[
        "users-permissions"
      ].services.report.generateReport(startTime, endTime, storage);
    } else if (type === "week") {
      startTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - 6
      );
      endTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );
      result = await strapi.plugins[
        "users-permissions"
      ].services.report.generateReport(startTime, endTime, storage);
    } else if (type === "month") {
      startTime = new Date(date.getFullYear(), date.getMonth(), 1);
      endTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );
      result = await strapi.plugins[
        "users-permissions"
      ].services.report.generateReport(startTime, endTime, storage);

    }

    let temp = result["importes"].reduce((total, item) => {
      let exported = result["exportes"].find((item2) => {
        return item2._id.toString() == item._id.toString();
      });

      if (exported) {
        total.push({
          id: item._id,
          imported: item.quantity,
          exported: exported.quantity,
          remain: item.quantity - exported.quantity,
          ...item
        });
      } else {
        total.push({
          id: item._id,
          imported: item.quantity,
          exported: 0,
          remain: item.quantity,
          ...item
        });
      }
      return total;
    }, []);

    await strapi.services.report.update(
      {
        storage: storage,
      },
      {
        report_file: JSON.stringify(temp),
      }
    );

    let store = await strapi.services.storage.findOne({
      id: storage
    })

    return {
      name: store.name,
      title: "Báo cáo nhập xuất " + store.name,
      startTime: moment(startTime).format("DD/MM/YYYY"),
      endTime: moment(endTime).format("DD/MM/YYYY"),
      data: temp
    };

  },
};
