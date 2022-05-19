const request = require("supertest");

const { jwtToken } = require("../__mocks__/AuthMocks");

const testCaseData = [
  {
    message: "driver create furlough response 200",
    type: "driver",
    send: {
      start_time: "October 13, 2013 11:13:00",
      days: 1,
      reason: "a",
    },
    expect: 200,
  },
  {
    message: "driver create furlough, day = 0 response 400",
    type: "driver",
    send: {
      start_time: "October 13, 2013 11:13:00",
      days: 0,
      reason: "a",
    },
    expect: 400,
  },
  {
    message: "driver create furlough, day = 100 response 400",
    type: "driver",
    send: {
      start_time: "October 13, 2013 11:13:00",
      days: 100,
      reason: "a",
    },
    expect: 400,
  },
  {
    message: "driver create furlough, day = -10 response 400",
    type: "driver",
    send: {
      start_time: "October 13, 2013 11:13:00",
      days: 0,
      reason: "",
    },
    expect: 400,
  },
  {
    message: "driver create furlough, start_time at 2200 response 400",
    type: "driver",
    send: {
      start_time: "October 13, 2200 11:13:00",
      days: 1,
      reason: "",
    },
    expect: 400,
  },
  {
    message: "driver create furlough,wrong start_time response 400",
    type: "driver",
    send: {
      start_time: "October 40, 2013 11:13:00",
      days: 1,
      reason: "",
    },
    expect: 400,
  },
  {
    message: "stocker create furlough response 403",
    type: "stocker",
    send: {
      start_time: "October 13, 2013 11:13:00",
      days: 1,
      reason: "a",
    },
    expect: 403,
  },
  {
    message: "admin create furlough response 200",
    type: "admin",
    send: {
      start_time: "October 13, 2013 11:13:00",
      days: 1,
      reason: "a",
    },
    expect: 200,
  },
  {
    message: "customer create furlough response 403",
    type: "customer",
    send: {
      start_time: "October 13, 2013 11:13:00",
      days: 1,
      reason: "a",
    },
    expect: 403,
  },
];

it.each(testCaseData)("$message", async ({ expect, type, send }) => {
  const idFurlough = await request(strapi.server)
    .post("/furloughs")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .send(send)
    .expect("Content-Type", /json/)
    .expect(expect)
    .then((data) => {
      if (data?.body?.id) {
        return data.body.id;
      }
    });
  if (idFurlough) {
    await request(strapi.server)
      .delete("/furloughs/" + idFurlough)
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(200);
  }
});
