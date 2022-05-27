const request = require("supertest");
const { jwtToken } = require("../../__mocks__/AuthMocks");
const testCaseData = [
  {
    message: "customer send noti response 200 ",
    expect: 200,
    type: "customer",
  },
];
it.each(testCaseData)("$message", async ({ expect, type }) => {
  await request(strapi.server)
    .post("/send-noti")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .send({
      device_token: "a",
    })
    .expect("Content-Type", /json/)
    .expect(expect);
});
