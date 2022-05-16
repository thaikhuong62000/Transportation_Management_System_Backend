const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");
const testCaseData = [
  {
    message: "driver create new shiment item response 200 ",
    expect: 200,
    type: "driver",
    send: {
      shipment: "6258e204304f6f211eea4b4b",
      quantity: 1,
      package: 1,
    },
  },
  {
    message: "customer create new shiment item response 403",
    expect: 403,
    type: "customer",
    send: {
      shipment: "6258e204304f6f211eea4b4b",
      quantity: 1,
      package: 1,
    },
  },
  {
    message: "stocker create new shiment item response 403",
    expect: 403,
    type: "stocker",
    send: {
      shipment: "6258e204304f6f211eea4b4b",
      quantity: 1,
      package: 1,
    },
  },
];

it.each(testCaseData)("$message", async ({ expect, send, type }) => {
  switch (send.package) {
    case 1:
      send.package = variable("package");
      break;
    // case 2:
    //   send.package = "";
    //   break;
    // default:
    //   send.package = variable("package");
  }
  const idSI = await request(strapi.server)
    .post("/shipment-items")
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

  if (idSI) {
    await request(strapi.server)
      .delete("/shipment-items/" + idSI)
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(200);
  }
});
