module.exports = {
  async handleNoti(type, object) {
    let message;
    switch (type) {
      case "order":
        message = {
          title: "Thông báo đơn hàng mới",
          sub_title: `Bạn có một đơn hàng mới từ ${object.from_address.city}`,
          message_type: "order",
          reference_id: object.id
        };
        break;
      case "broken":
        message = {
          title: "Thông báo xe trục trặc",
          sub_title: `Xe biển số ${object.car.licence} gặp trục trặc`,
          message_type: "broken",
          reference_id: object.car.id
        };
        break;
      case "furlough":
        message = {
          title: "Thông báo nhân viên nghỉ phép",
          sub_title: `Nhân viên ${object.driver.name}`,
          message_type: "furlough",
          reference_id: object.driver.id
        };
        break;
      default:
        message = {
          title: "Thông báo",
          sub_title: "Thông báo",
          message_type: "order",
        };
        break;
    }
    let _message = await strapi.services.notification.create(message);
    global.io.emit("notification", _message);
  },
};
