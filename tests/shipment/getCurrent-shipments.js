const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const testCaseData = [
  {
    message: "get Current Shipment response 200 ",
    expect: 200,
    type: "driver",
  },
];

it.each(testCaseData)("$message", async ({ expect, type }) => {
  await request(strapi.server)
    .get("/current-shipments")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .expect("Content-Type", /json/)
    .expect(expect);
});
