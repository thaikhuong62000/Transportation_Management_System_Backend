const request = require("supertest");
const { jwtToken } = require("../../__mocks__/AuthMocks");

const testCaseData = [
  {
    message: "admin create report day response 200 ",
    expect: 200,
    type: "admin",
    send: { type: "day" },
  },
  {
    message: "admin create report week response 200 ",
    expect: 200,
    type: "admin",
    send: { type: "week" },
  },
  {
    message: "admin create report month response 200 ",
    expect: 200,
    type: "admin",
    send: { type: "month" },
  },
];

it.each(testCaseData)("$message", async ({ expect, type, send }) => {
  const reportId = await request(strapi.server)
    .post("/report/6252b84e5eedf42d04bd515c")
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
  if (reportId) {
    await request(strapi.server) // app server is an instance of Class: http.Server
      .delete("/reports/" + reportId)
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(200);
  }
});
