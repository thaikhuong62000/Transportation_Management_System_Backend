const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const testCaseData = [
  {
    message: "get Packages InStorage by admin response 200 ",
    expect: 200,
    type: "admin",
    storeId: "1",
  },
  {
    message: "get Packages InStorage without storeID by admin response 400 ",
    expect: 400,
    type: "admin",
    storeId: "",
  },
  {
    message: "get Packages InStorage stocker response 200 ",
    expect: 200,
    type: "stocker",
    storeId: "",
  },
];

it.each(testCaseData)("$message", async ({ expect, type, storeId }) => {
  await request(strapi.server)
    .get("/packages/in-storage")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .query({ storeId: storeId })
    .expect("Content-Type", /json/)
    .expect(expect);
});
