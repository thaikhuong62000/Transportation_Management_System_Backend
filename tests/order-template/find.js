const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");

const testCaseData = [
  {
    message: "get mẫu",
    expect: 200,
  },
];

it.each(testCaseData)("$message", async ({ expect }) => {
  await request(strapi.server)
    .get("/order-templates")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("customer"))
    .expect("Content-Type", expect === 404 ? /text/ : /json/)
    .expect(expect);
});
