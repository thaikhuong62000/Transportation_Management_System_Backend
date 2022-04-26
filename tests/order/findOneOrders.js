const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const testCaseData = [
  {
    message: "lấy một orders by admin",
    expect: 200,
    type: "admin",
  },
  {
    message: "lấy một orders by user chưa có đơn hàng",
    expect: 404,
    type: "user",
  },
];

// wait tao don hang for test
const orderData = {
  id: "6264241e21f4d0285291ffa8",
};

it.each(testCaseData)("$message", async ({ expect, type }) => {
  const jwt = type === "admin" ? jwtToken("admin") : jwtToken("customer");
  await request(strapi.server)
    .get("/orders/" + orderData.id)
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwt)
    .expect("Content-Type", expect === 404 ? /text/ : /json/)
    .expect(expect);
});
