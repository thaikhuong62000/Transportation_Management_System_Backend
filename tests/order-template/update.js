const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");

const constData = {
  send: {
    name: "vẫn là testing",
    receiver_name: "Pham Nguyen Thai Khuong",
    receiver_phone: "0937236128",
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
    message: "update mẫu",
    expect: 200,
    send: {
      name: "testing",
      receiver_name: "Pham Nguyen Thai Khuong",
      receiver_phone: "0937236128",
      from_address: {
        street: "135 Nguyễn Cửu Đàm",
        ward: "Tân Sơn Nhì",
        province: "Tân Phú",
        city: "Thành phố Hồ Chí Minh",
        Latitude: 11111,
        Longitude: 22222,
      },
      to_address: {
        street: "Đ. 3/2",
        ward: "Xuân Khánh",
        province: "Ninh Kiều",
        city: "Cần Thơ",
        Latitude: 12311,
        Longitude: 12312,
      },
    },
  },
  {
    message: "update mẫu ko có tọa độ",
    expect: 200,
    send: {
      name: "vẫn là testing",
      receiver_name: "Pham Nguyen Thai Khuong",
      receiver_phone: "0937236128",
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
    message: "update mẫu ko ten ng nhận",
    expect: 400,
    send: {
      name: "vẫn là testing",
      receiver_name: "",
      receiver_phone: "0937236128",
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
    message: "update mẫu ko phone ng nhận",
    expect: 400,
    send: {
      name: "vẫn là testing",
      receiver_name: "",
      receiver_phone: "0937236128",
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
];

it.each(testCaseData)("$message", async ({ expect, type, send }) => {
  const idTemplate = await request(strapi.server)
    .post("/order-templates")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("customer"))
    .send(constData.send)
    .expect("Content-Type", expect === 404 ? /text/ : /json/)
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
      .expect("Content-Type", expect === 404 ? /text/ : /json/)
      .expect(expect);
    await request(strapi.server)
      .post("/order-templates/delete")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("customer"))
      .send({
        deleteList:[idTemplate]
      })
      .expect("Content-Type", expect === 404 ? /text/ : /json/)
      .expect(200);
  }
});
