const request = require("supertest");
const mockUserData = {
  username: "FujiwaraChika", //user customer
  password: "12345678",
  adminUsername: "admin",
  adminPassword: "12345678",
};

const mockAvatar = [{ avatar: "public/uploads/voucher_pic0.jpg" }];
const image = "public/uploads/voucher_pic0.jpg";
// const mockVoucherData = [
//   { password: "12345678", newPassword: "12345678", expected: "update" },
//   { password: "123456789", newPassword: "12345678", expected: "not update" },
//   { password: "12345678", newPassword: "123456789", expected: "update" },
//   { password: "123456789", newPassword: "", expected: "not update" },
// ];

it.each(mockAvatar)("kiểm tra quyền admin update voucher", async () => {
  const jwt = await request(strapi.server)
    .post("/auth/local")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .send({
      identifier: mockUserData.adminUsername,
      password: mockUserData.adminPassword,
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      expect(data.body.jwt).toBeDefined();
      return data.body.jwt;
    });
  await request(strapi.server)
    .post("/vouchers/image")
    .set("accept", "*")
    .set("Authorization", "Bearer " + jwt)
    .attach("image",image)
    .expect("Content-Type", /json/)
    .expect(200);

});

it.each(mockAvatar)("kiểm tra quyền user không dc update voucher", async () => {
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
    .post("/vouchers/image")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwt)
    .attach("image",image)
    .expect("Content-Type", /json/)
    .expect(403);
});
