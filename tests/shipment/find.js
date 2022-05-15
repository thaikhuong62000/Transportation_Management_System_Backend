const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");
const testCaseData = [
  {
    message: "get Shipment response 200 ",
    expect: 200,
    type: "driver",
  },
];

it.each(testCaseData)("$message", async ({ expect, type }) => {
  await request(strapi.server)
    .get("/shipments/")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .expect("Content-Type", expect === 404 ? /text/ : /json/)
    .expect(expect);
});
