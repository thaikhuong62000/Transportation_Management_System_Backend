const request = require("supertest");
const { createdOrder } = require("../__mocks__/OrderMocks");

const testCaseData = [
  {
    message: "momo noti success",
    expect: 200,
    send: {
      amount: 0,
      resultCode: 0,
    },
  },
  {
    message: "momo noti success",
    expect: 200,
    send: {
      amount: 0,
      extraData: "",
      resultCode: 1,
    },
  },
  {
    message: "momo noti fail",
    expect: 400,
    send: {
      amount: 0,
      extraData: { id: "a" },
      resultCode: 1,
    },
  },
];

it.each(testCaseData)("$message", async ({ expect, send, type }) => {
  const data = JSON.stringify(
    send.extraData ? send.extraData : { id: createdOrder("order").id }
  );
  const extraData = Buffer.from(data).toString("base64");
  await request(strapi.server)
    .post("/payments/momo-notify")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .send({
      ...send,
      extraData: extraData,
    })
    .expect("Content-Type", /json/)
    .expect(expect)
    .then((data) => {
      if (data?.body?.id) {
        return data.body.id;
      }
    });
});
