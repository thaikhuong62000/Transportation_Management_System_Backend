const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");

const testCaseData = [
  {
    message: "create car-broken",
    type: "driver",
    expect: 200,
    day: Date(),
  },
  {
    message: "create car-broken wrong time format",
    type: "driver",
    expect: 400,
    day: "123123/123123/123123",
  },
  {
    message: "create car-broken not owner car",
    type: "driver2",
    expect: 400,
    day: Date(),
  },
];

it.each(testCaseData)("$message", async ({ expect, type, day }) => {
  const idCarBroken = await request(strapi.server) // app server is an instance of Class: http.Server
    .post("/car-brokens")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .send({
      time: day,
      car: variable("idCar"),
    })
    .expect("Content-Type", /json/)
    .expect(expect)
    .then((data) => {
      return data?.body?.id;
    });
  if (idCarBroken) {
    await request(strapi.server) // app server is an instance of Class: http.Server
      .delete("/car-brokens/" + idCarBroken)
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(200);
  }
});
