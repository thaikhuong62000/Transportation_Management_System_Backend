const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const { createdOrder } = require("../__mocks__/OrderMocks");

// const picture = "public/uploads/map.png";

const testCaseData = [
  {
    message: "create payment success",
    expect: 200,
    send: {
      payer_name: "Khuong",
      payer_phone: "0957862325",
      paid: 0,
    },
  },
  {
    message: "create payment success",
    expect: 400,
    send: {
      payer_name: "Khuong",
      payer_phone: "0957862325",
      paid: -1,
    },
  },
];

it.each(testCaseData)("$message", async ({ expect, send }) => {
  const data = JSON.stringify({
    ...send,
    order: createdOrder("order").id,
  });
  await request(strapi.server)
    .post("/payments")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("driver"))
    .field("data", data)
    .expect("Content-Type", /json/)
    .expect(expect)
    .then((data) => {
      if (data?.body?.id) {
        return data.body.id;
      }
    });
});
