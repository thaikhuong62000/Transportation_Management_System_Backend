const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");

const testCaseData = [
  {
    message: "tạo mẫu package mới response 200",
    expect: 200,
    send: {
      name: "test",
      package_type: "normal",
      quantity: 10,
      weight: 10,
      len: 10,
      width: 10,
      height: 10,
      note: "ko co note",
    },
  },
  {
    message: "tạo mẫu package mới response 400",
    expect: 400,
    send: {
      name: "test",
      quantity: 10,
      weight: 10,
      len: 10,
      width: 10,
      height: 10,
      note: "ko co note",
    },
  },
];

it.each(testCaseData)("$message", async ({ expect, send }) => {
  const idTemplate = await request(strapi.server)
    .post("/package-templates")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("customer"))
    .send(send)
    .expect("Content-Type", expect === 404 ? /text/ : /json/)
    .expect(expect)
    .then((data) => {
      if (data?.body?.id) {
        return data.body.id;
      }
    });
  if (idTemplate) {
    await request(strapi.server)
      .post("/package-templates/delete")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("customer"))
      .send({
        deleteList: [idTemplate],
      })
      .expect("Content-Type", expect === 404 ? /text/ : /json/)
      .expect(200);
  }
});
