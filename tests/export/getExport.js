const request = require("supertest");

const { jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");

const testCaseData = [
  {
    message: "stocker get export response 200",
    type: "stocker",
    expect: 200,
  },
  {
    message: "admin get export response 200",
    type: "admin",
    expect: 200,
  },
  {
    message: "customer get export response 403",
    type: "customer",
    expect: 403,
  },
  {
    message: "driver get export response 403",
    type: "driver",
    expect: 403,
  },
];

it.each(testCaseData)("$message", async ({ expect, type }) => {
  await request(strapi.server) // app server is an instance of Class: http.Server
    .get("/exports")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .expect("Content-Type", /json/)
    .expect(expect);
});
