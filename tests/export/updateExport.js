const request = require("supertest");

const { jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");

const testCaseData = [
  {
    message: "stocker update export response 403",
    type: "stocker",
    send: { quantity: 1, package: 1 },
    expect: 403,
  },
  {
    message: "admin update export response 403",
    type: "admin",
    send: { quantity: 1, package: 1 },
    expect: 403,
  },
];

it.each(testCaseData)("$message", async ({ expect, type, send }) => {
  switch (send.package) {
    case 1:
      send.package = variable("package");
      break;
  }

  const idExport = await request(strapi.server) // app server is an instance of Class: http.Server
    .post("/exports")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .send({
      quantity: 10,
      package: variable("package"),
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      return data.body.id;
    });

  await request(strapi.server) // app server is an instance of Class: http.Server
    .put("/exports/" + idExport)
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .send(send)
    .expect("Content-Type", /json/)
    .expect(expect);

  await request(strapi.server) // app server is an instance of Class: http.Server
    .delete("/exports/" + idExport)
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .expect("Content-Type", /json/)
    .expect(200);
});
