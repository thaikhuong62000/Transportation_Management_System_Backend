const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");

const testCaseData = [
  {
    message: "stocker find report",
    expect: 200,
    type: "stocker",
  },
  {
    message: "admin find report",
    expect: 200,
    type: "admin",
  },
  {
    message: "stocker find report",
    expect: 403,
    type: "driver",
  },
  {
    message: "stocker find report",
    expect: 403,
    type: "customer",
  },
];

it.each(testCaseData)("$message", async ({ expect, type }) => {
  await request(strapi.server)
    .get("/reports")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .expect("Content-Type", /json/)
    .expect(expect);
});
