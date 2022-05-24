const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");

const testCaseData = [
  {
    message: "get mẫu packages response 200",
    expect: 200,
  },
];

it.each(testCaseData)("$message", async ({ expect }) => {
  await request(strapi.server)
    .get("/package-templates")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("customer"))
    .expect("Content-Type", /json/)
    .expect(expect);
});
