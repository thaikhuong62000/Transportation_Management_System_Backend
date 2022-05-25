const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");
const testCaseData = [
  {
    message: "get Finished Shipment response 200 ",
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
];

it.each(testCaseData)("$message", async ({ expect, send, type }) => {
  send.shipmentData.packages = variable("package");
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
      .get("/finished-shipments")
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
      .get("/finished-shipments")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(400);
  }
});
