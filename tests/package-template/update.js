const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");

const constData = {
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
};

const testCaseData = [
  {
    message: "update mẫu package response 200",
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
];

it.each(testCaseData)("$message", async ({ expect, type, send }) => {
  const idTemplate = await request(strapi.server)
    .post("/package-templates")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("customer"))
    .send(constData.send)
    .expect("Content-Type", expect === 404 ? /text/ : /json/)
    .expect(200)
    .then((data) => {
      if (data?.body?.id) {
        return data.body.id;
      }
    });

  if (idTemplate) {
    await request(strapi.server)
      .put("/package-templates/" + idTemplate)
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("customer"))
      .send(send)
      .expect("Content-Type", expect === 404 ? /text/ : /json/)
      .expect(expect);
    await request(strapi.server)
      .post("/package-templates/delete")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("customer"))
      .send({
        deleteList:[idTemplate]
      })
      .expect("Content-Type", expect === 404 ? /text/ : /json/)
      .expect(200);
  }
});
