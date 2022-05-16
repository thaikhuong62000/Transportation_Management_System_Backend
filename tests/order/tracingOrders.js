const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const { createdOrder } = require("../__mocks__/OrderMocks");

const testCaseData = [
  {
    message: "lấy đường đi orders by admin",
    expect: 200,
    type: "admin",
  },
  {
    message: "lấy đường đi orders by user",
    expect: 200,
    type: "customer",
  },
];

it.each(testCaseData)("$message", async ({ expect, type }) => {
  await request(strapi.server)
    .get("/orders/tracing/" + createdOrder("order").id)
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .expect("Content-Type", /json/)
    .expect(expect);
});
