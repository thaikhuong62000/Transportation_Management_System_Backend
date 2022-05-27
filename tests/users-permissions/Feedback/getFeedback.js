const request = require("supertest");
const { jwtToken } = require("../../__mocks__/AuthMocks");

const testCaseData = [
  {
    message: "customer get fee back response 200 ",
    expect: 200,
    type: "customer",
  },
];

it.each(testCaseData)("$message", async ({ expect, type, send }) => {
  await request(strapi.server)
    .get("/feedbacks")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .send(send)
    .expect("Content-Type", /json/)
    .expect(expect);
});
