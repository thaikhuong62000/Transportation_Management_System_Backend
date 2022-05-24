const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");

const constData = {
  send: {
    name: "vẫn là testing",
    receiver_name: "Pham Nguyen Thai Khuong",
    receiver_phone: "0937236128",
    sender_name: "Fujiwara Chika",
    sender_phone: "0122324572",
    from_address: {
      street: "135 Nguyễn Cửu Đàm",
      ward: "Tân Sơn Nhì",
      province: "Tân Phú",
      city: "Thành phố Hồ Chí Minh",
    },
    to_address: {
      street: "Đ. 3/2",
      ward: "Xuân Khánh",
      province: "Ninh Kiều",
      city: "Cần Thơ",
    },
  },
};

const testCaseData = [
  {
    message: "update mẫu order response 200",
    expect: 200,
    send: {
      name: "testing",
      receiver_name: "Pham Nguyen Thai Khuong",
      receiver_phone: "0937236128",
      sender_name: "Fujiwara Chika",
      sender_phone: "0122324572",
      from_address: {
        street: "135 Nguyễn Cửu Đàm",
        ward: "Tân Sơn Nhì",
        province: "Tân Phú",
        city: "Thành phố Hồ Chí Minh",
        latitude: 11111,
        longitude: 22222,
      },
      to_address: {
        street: "Đ. 3/2",
        ward: "Xuân Khánh",
        province: "Ninh Kiều",
        city: "Cần Thơ",
        latitude: 11111,
        longitude: 22222,
      },
    },
  },
  {
    message: "update mẫu order ko có tọa độ response 200",
    expect: 200,
    send: {
      name: "vẫn là testing",
      receiver_name: "Pham Nguyen Thai Khuong",
      receiver_phone: "0937236128",
      sender_name: "Fujiwara Chika",
      sender_phone: "0122324572",
      from_address: {
        street: "135 Nguyễn Cửu Đàm",
        ward: "Tân Sơn Nhì",
        province: "Tân Phú",
        city: "Thành phố Hồ Chí Minh",
      },
      to_address: {
        street: "Đ. 3/2",
        ward: "Xuân Khánh",
        province: "Ninh Kiều",
        city: "Cần Thơ",
      },
    },
  },
  {
    message: "update mẫu order ko ten ng nhận response 400",
    expect: 400,
    send: {
      name: "vẫn là testing",
      receiver_name: "",
      receiver_phone: "0937236128",
      sender_name: "Fujiwara Chika",
      sender_phone: "0122324572",
      from_address: {
        street: "135 Nguyễn Cửu Đàm",
        ward: "Tân Sơn Nhì",
        province: "Tân Phú",
        city: "Thành phố Hồ Chí Minh",
        latitude: 11111,
        longitude: 22222,
      },
      to_address: {
        street: "Đ. 3/2",
        ward: "Xuân Khánh",
        province: "Ninh Kiều",
        city: "Cần Thơ",
        latitude: 11111,
        longitude: 22222,
      },
    },
  },
  {
    message: "update mẫu order ko phone ng nhận response 400",
    expect: 400,
    send: {
      name: "vẫn là testing",
      receiver_name: "a",
      receiver_phone: "",
      sender_name: "Fujiwara Chika",
      sender_phone: "0122324572",
      from_address: {
        street: "135 Nguyễn Cửu Đàm",
        ward: "Tân Sơn Nhì",
        province: "Tân Phú",
        city: "Thành phố Hồ Chí Minh",
        latitude: 11111,
        longitude: 22222,
      },
      to_address: {
        street: "Đ. 3/2",
        ward: "Xuân Khánh",
        province: "Ninh Kiều",
        city: "Cần Thơ",
        latitude: 11111,
        longitude: 22222,
      },
    },
  },
];

it.each(testCaseData)("$message", async ({ expect, type, send }) => {
  const idTemplate = await request(strapi.server)
    .post("/order-templates")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("customer"))
    .send(constData.send)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      if (data?.body?.id) {
        return data.body.id;
      }
    });

  if (idTemplate) {
    await request(strapi.server)
      .put("/order-templates/" + idTemplate)
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("customer"))
      .send(send)
      .expect("Content-Type", /json/)
      .expect(expect);
    await request(strapi.server)
      .post("/order-templates/delete")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("customer"))
      .send({
        deleteList: [idTemplate],
      })
      .expect("Content-Type", /json/)
      .expect(200);
  }
});
