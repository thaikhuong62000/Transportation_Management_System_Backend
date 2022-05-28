const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");
const testCaseData = [
  {
    message: "get Packages InStorage by admin response 200 ",
    expect: 200,
    type: "admin",
    typeCall: "1",
  },
  {
    message: "get Packages InStorage stocker response 200 ",
    expect: 200,
    type: "stocker",
    typeCall: "0",
  },
];

it.each(testCaseData)("$message", async ({ expect, type, typeCall }) => {
  await request(strapi.server)
    .get("/packages/scanned/" + variable("package"))
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .query({ type: typeCall })
    .expect("Content-Type", /json/)
    .expect(expect);
});
