const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");
const testCaseData = [
  {
    message: "admin create new shiment response 200 ",
    expect: 200,
    type: "admin",
    send: {
      shipmentData: {
        to_storage: 1,
        from_storage: 1,
        to_address: {
          street: "942/2 Kha Vạn Cân",
          ward: "Trường Thọ",
          province: "Thủ Đức",
          city: "Hồ Chí Minh",
        },
        from_address: {
          street: "475A Điện Biên Phủ",
          ward: "Phường 25",
          province: "Bình Thạnh",
          city: "Thành phố Hồ Chí Minh",
        },
        packages: 1,
      },
      shipmentitem: "",
    },
  },
  {
    message: "admin create new shiment without packages response 400 ",
    expect: 400,
    type: "admin",
    send: {
      shipmentData: {
        to_storage: 1,
        from_storage: 1,
        to_address: {
          street: "942/2 Kha Vạn Cân",
          ward: "Trường Thọ",
          province: "Thủ Đức",
          city: "Hồ Chí Minh",
        },
        from_address: {
          street: "475A Điện Biên Phủ",
          ward: "Phường 25",
          province: "Bình Thạnh",
          city: "Thành phố Hồ Chí Minh",
        },
        packages: 2,
      },
      shipmentitem: "",
    },
  },
  {
    message: "admin create new shiment without to_storage response 400 ",
    expect: 400,
    type: "admin",
    send: {
      shipmentData: {
        to_storage: 2,
        from_storage: 1,
        to_address: {
          street: "942/2 Kha Vạn Cân",
          ward: "Trường Thọ",
          province: "Thủ Đức",
          city: "Hồ Chí Minh",
        },
        from_address: {
          street: "475A Điện Biên Phủ",
          ward: "Phường 25",
          province: "Bình Thạnh",
          city: "Thành phố Hồ Chí Minh",
        },
        packages: 1,
      },
      shipmentitem: "",
    },
  },
  {
    message: "admin create new shiment without from_storage response 400 ",
    expect: 400,
    type: "admin",
    send: {
      shipmentData: {
        to_storage: 1,
        from_storage: 2,
        to_address: {
          street: "942/2 Kha Vạn Cân",
          ward: "Trường Thọ",
          province: "Thủ Đức",
          city: "Hồ Chí Minh",
        },
        from_address: {
          street: "475A Điện Biên Phủ",
          ward: "Phường 25",
          province: "Bình Thạnh",
          city: "Thành phố Hồ Chí Minh",
        },
        packages: 1,
      },
      shipmentitem: "",
    },
  },
  {
    message: "customer create new shiment response 403",
    expect: 403,
    type: "customer",
    send: {
      shipmentData: {
        to_storage: 1,
        from_storage: 1,
        to_address: {
          street: "942/2 Kha Vạn Cân",
          ward: "Trường Thọ",
          province: "Thủ Đức",
          city: "Hồ Chí Minh",
        },
        from_address: {
          street: "475A Điện Biên Phủ",
          ward: "Phường 25",
          province: "Bình Thạnh",
          city: "Thành phố Hồ Chí Minh",
        },
        packages: 1,
      },
    },
  },
  {
    message: "stocker create new shiment response 403",
    expect: 403,
    type: "stocker",
    send: {
      shipmentData: {
        to_storage: 1,
        from_storage: 1,
        to_address: {
          street: "942/2 Kha Vạn Cân",
          ward: "Trường Thọ",
          province: "Thủ Đức",
          city: "Hồ Chí Minh",
        },
        from_address: {
          street: "475A Điện Biên Phủ",
          ward: "Phường 25",
          province: "Bình Thạnh",
          city: "Thành phố Hồ Chí Minh",
        },
        packages: 1,
      },
    },
  },
];

it.each(testCaseData)("$message", async ({ expect, send, type }) => {
  switch (send.shipmentData.packages) {
    case 1:
      send.shipmentData.packages = variable("package");
      break;
    case 2:
      send.shipmentData.packages = "";
      break;
  }
  switch (send.shipmentData.to_storage) {
    case 1:
      send.shipmentData.to_storage = variable("storage");
      break;
    case 2:
      send.shipmentData.to_storage = "";
      break;
  }
  switch (send.shipmentData.from_storage) {
    case 1:
      send.shipmentData.from_storage = variable("storage");
      break;
    case 2:
      send.shipmentData.from_storage = "";
      break;
  }
  const idS = await request(strapi.server)
    .post("/shipments")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .send(send)
    .expect("Content-Type", /json/)
    .expect(expect)
    .then((data) => {
      if (data?.body[0]?.id) {
        return data.body[0].id;
      }
    });

  if (idS) {
    await request(strapi.server)
      .delete("/shipments/" + idS)
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(200);
  }
});
