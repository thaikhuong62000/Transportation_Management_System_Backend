const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const testCaseData = [
  {
    message: "lấy đường đi orders by admin",
    expect: 200,
    type: "admin",
  },
  {
    message: "lấy đường đi orders by user",
    expect: 200,
    type: "user",
  },
];


// wait tao don hang for test
const orderData={
  id : "6264241e21f4d0285291ffa8",
}

it.each(testCaseData)("$message", async ({ expect, type }) => {
  const jwt =
    type === "admin" ? jwtToken("admin") : jwtToken("customer");
  await request(strapi.server)
    .get("/orders/tracing/"+orderData.id)
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwt)
    .expect("Content-Type", /json/)
    .expect(expect);
});
