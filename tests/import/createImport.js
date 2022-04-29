const request = require("supertest");

const { jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");

const testCaseData = [
  {
    message: "stocker create import response 200",
    type: "stocker",
    send: { quantity: 1, package: 1 },
    expect: 200,
  },
  {
    message: "stocker create import without package response 400",
    type: "stocker",
    send: { quantity: 1, package: 2 },
    expect: 400,
  },
  {
    message: "stocker create import with 0 quantity response 400",
    type: "stocker",
    send: { quantity: 0, package: 1 },
    expect: 400,
  },
  {
    message: "stocker create import with negative quantity response 400",
    type: "stocker",
    send: { quantity: -10, package: 1 },
    expect: 400,
  },
  {
    message: "admin create import response 200",
    type: "admin",
    send: { quantity: 1, package: 1 },
    expect: 200,
  },
  {
    message: "customer create import response 403",
    type: "customer",
    send: { quantity: 1, package: 1 },
    expect: 403,
  },
  {
    message: "driver create import response 403",
    type: "driver",
    send: { quantity: 1, package: 1 },
    expect: 403,
  },
];

it.each(testCaseData)("$message", async ({ expect, type, send }) => {
  switch (send.package) {
    case 1:
      send.package = variable("package");
      break;
    case 2:
      send.package = "";
      break;
    default:
      send.package = variable("package");
  }

  const idImport = await request(strapi.server) // app server is an instance of Class: http.Server
    .post("/imports")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("stocker"))
    .send({
      quantity: 10,
      package: variable("package"),
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      return data.body.id;
    });

  if (idImport) {
    await request(strapi.server) // app server is an instance of Class: http.Server
      .put("/imports/" + idImport)
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken(type))
      .send(send)
      .expect("Content-Type", /json/)
      .expect(expect);

    await request(strapi.server) // app server is an instance of Class: http.Server
      .delete("/imports/" + idImport)
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(200);
  }
});
