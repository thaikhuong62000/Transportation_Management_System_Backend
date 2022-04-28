const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");

const testCaseData = [
  {
    message: "get cars by driver",
    type: "driver",
    expect: 200,
  },
  {
    message: "get cars by admin",
    type: "admin",
    expect: 200,
  },
  {
    message: "get cars by stocker",
    type: "stocker",
    expect: 200,
  },
];

it.each(testCaseData)("$message", async ({ expect, type }) => {
  await request(strapi.server) // app server is an instance of Class: http.Server
    .get("/cars")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .expect("Content-Type", /json/)
    .expect(expect);
});
