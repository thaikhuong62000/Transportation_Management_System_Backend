const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const testCaseData = [
  {
    message: "get UnCollectPackage by admin response 200 ",
    expect: 200,
    type: "admin",
    storeId: "6252b34e5eedf42d04bd5147",
  },
];

it.each(testCaseData)("$message", async ({ expect, type, storeId }) => {
  await request(strapi.server)
    .get("/packages/uncollect/" + storeId)
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .expect("Content-Type", /json/)
    .expect(expect);
});
