const request = require("supertest");
const mockUserData = {
  username: "FujiwaraChika",//user customer
  password: "12345678",
  adminUsername:"admin",
  adminPassword:"12345678"
};

it("kiểm tra find voucher customer", async () => {
    const jwt = await request(strapi.server)
      .post("/auth/local")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        identifier: mockUserData.username,
        password: mockUserData.password,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((data) => {
        expect(data.body.jwt).toBeDefined();
        return data.body.jwt;
      });
    await request(strapi.server)
      .get("/vouchers")
      .set("accept", "application/json")
      .set("Authorization", "Bearer " + jwt)
      .expect("Content-Type", /json/)
      .expect(200);
  });

  it("kiểm tra find voucher admin", async () => {
    const jwt = await request(strapi.server)
      .post("/auth/local")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        identifier: mockUserData.adminUsername,
        password: mockUserData.password,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((data) => {
        expect(data.body.jwt).toBeDefined();
        return data.body.jwt;
      });
    await request(strapi.server)
      .get("/vouchers")
      .set("accept", "application/json")
      .set("Authorization", "Bearer " + jwt)
      .expect("Content-Type", /json/)
      .expect(200);
  });
  