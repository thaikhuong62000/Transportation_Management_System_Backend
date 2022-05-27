const request = require("supertest");
const { createdOrder } = require("../__mocks__/OrderMocks");
const { jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");

it("stocker2 export packages fail", async () => {
  await request(strapi.server)
    .put("/exports/update-quantity")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("stocker2"))
    .send({
      quantity: 11,
      shipment: variable("shipment").id,
    })
    .expect("Content-Type", /json/)
    .expect(400);
});

it("stocker2 export packages fail", async () => {
  await request(strapi.server)
    .put("/exports/update-quantity")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("stocker2"))
    .send({
      packageId: createdOrder("order").packages[0].id,
      quantity: -11,
      shipment: variable("shipment").id,
    })
    .expect("Content-Type", /json/)
    .expect(400);
});
