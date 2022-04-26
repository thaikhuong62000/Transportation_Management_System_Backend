const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const testCaseData = [
  {
    message: "tìm danh sách orders by admin",
    expect: 200,
    type: "admin",
  },
  {
    message: "tìm danh sách orders by user",
    expect: 200,
    type: "user",
  },
];

it.each(testCaseData)("$message", async ({ expect, type }) => {
  const jwt = type === "admin" ? jwtToken("admin") : jwtToken("customer");
  await request(strapi.server)
    .get("/orders")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwt)
    .expect("Content-Type", /json/)
    .expect(expect);
});
