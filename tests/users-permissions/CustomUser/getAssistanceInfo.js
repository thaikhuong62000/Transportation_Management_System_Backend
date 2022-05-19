const request = require("supertest");
const { jwtToken } = require("../../__mocks__/AuthMocks");

const testCaseData = [
  {
    message: "admin get assistance status response 200 ",
    expect: 200,
    type: "admin",
  },
];

it.each(testCaseData)("$message", async ({ expect, type }) => {
  await request(strapi.server)
    .get("/assistance/status")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .expect("Content-Type", /json/)
    .expect(expect);
});
