const request = require("supertest");
const { variable } = require("../__mocks__/Global");
const { jwtToken } = require("../__mocks__/AuthMocks");
const testCaseData = [
  {
    message: "customer delete orders",
    expect: 200,
    type: "customer",
  },
];
it.each(testCaseData)("$message", async ({ expect, type }) => {
  await request(strapi.server)
    .put("/orders/" + variable("order"))
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .expect("Content-Type", /json/)
    .expect(expect);
});
