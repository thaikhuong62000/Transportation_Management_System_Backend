const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const testCaseData = [
  {
    message: "đếm danh sách orders by admin",
    expect: 200,
    type: "admin",
  },
  {
    message: "đếm danh sách orders by user",
    expect: 200,
    type: "customer",
  },
];

it.each(testCaseData)("$message", async ({ expect, type }) => {
  await request(strapi.server)
    .get("/orders/count")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .expect("Content-Type", /json/)
    .expect(expect);
});
