const request = require("supertest");
const { jwtToken } = require("../../__mocks__/AuthMocks");
const testCaseData = [
  {
    message: "admin update config response 200 ",
    expect: 200,
    type: "admin",
  },
];
it.each(testCaseData)("$message", async ({ expect, type }) => {
  const send = await request(strapi.server)
    .get("/config")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .expect("Content-Type", /json/)
    .expect(expect)
    .then((data) => {
      return data.body;
    });
  await request(strapi.server)
    .put("/config")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .send(send)
    .expect("Content-Type", /json/)
    .expect(expect);
});
it("admin update config fail response 400 ", async () => {
  await request(strapi.server)
    .put("/config")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .send({
      oil: {},
      furlough: {},
      point: {},
    })
    .expect("Content-Type", /json/)
    .expect(400);
});
