const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");
const testCaseData = [
  {
    message: "shipments is finish true response 200 ",
    expect: 200,
    type: "driver",
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
    message: "shipments is finish false response 400 ",
    expect: 400,
    type: "driver",
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
  send.shipmentData.to_storage = variable("storage");
  send.shipmentData.from_storage = variable("storage");

  const idSI = await request(strapi.server)
    .post("/shipments")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .send(send)
    .expect("Content-Type", /json/)
    .expect(expect)
    .then((data) => {
      if (data?.body[0]?.id) {
        return data.body[0].id;
      }
    });

  if (idSI) {
    await request(strapi.server)
      .put("/shipments/finish/" + idSI)
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(200);
    await request(strapi.server)
      .delete("/shipments/" + idSI)
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(200);
  } else {
    await request(strapi.server)
      .put("/shipments/finish/" + "627bf97176f45b789c9ed1b1")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(400);
  }
});
