const request = require("supertest");
const { jwtToken } = require("../../__mocks__/AuthMocks");
const testCaseData = [
  {
    message: "user update another user response 400 ",
    expect: 400,
    type: "customer",
  },
];
it.each(testCaseData)("$message", async ({ expect, type }) => {
  await request(strapi.server)
    .put("/users/62903034ca190219504")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .expect("Content-Type", /json/)
    .expect(expect);
});
