const request = require("supertest");

const { jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");

const testCaseData = [
  {
    message: "stocker get imports response 200",
    type: "stocker",
    expect: 200,
  },
  {
    message: "admin get imports response 200",
    type: "admin",
    expect: 200,
  },
  {
    message: "customer get imports response 403",
    type: "customer",
    expect: 403,
  },
  {
    message: "driver get imports response 403",
    type: "driver",
    expect: 403,
  },
];

it.each(testCaseData)("$message", async ({ expect, type }) => {
  await request(strapi.server) // app server is an instance of Class: http.Server
    .get("/imports")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .expect("Content-Type", /json/)
    .expect(expect);
});
