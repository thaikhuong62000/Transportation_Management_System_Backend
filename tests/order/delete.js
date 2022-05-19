const request = require("supertest");
const { createdOrder } = require("../__mocks__/OrderMocks");
const { jwtToken } = require("../__mocks__/AuthMocks");
const testCaseData = [
  {
    message: "customer delete orders fail",
    expect: 403,
    type: "customer",
  },
];
it.each(testCaseData)("$message", async ({ expect, type }) => {
  await request(strapi.server)
    .delete("/orders/" + createdOrder("order").id)
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .expect("Content-Type", /json/)
    .expect(expect);
});
