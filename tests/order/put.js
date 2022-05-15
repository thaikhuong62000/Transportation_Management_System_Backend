const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");
const testCaseData = [
  {
    message: "sửa orders by admin",
    expect: 200,
    type: "admin",
    send: { sender_name: "a" },
  },
  {
    message: "sửa orders by customer",
    expect: 200,
    type: "customer",
    send: { sender_name: "a" },
  },
];

it.each(testCaseData)("$message", async ({ expect, type, send }) => {
  await request(strapi.server)
    .put("/orders/" + variable("order"))
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .send(send)
    .expect("Content-Type", /json/)
    .expect(expect);
});
