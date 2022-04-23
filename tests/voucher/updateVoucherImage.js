const request = require("supertest");
const mockUserData = {
  username: "FujiwaraChika",
  password: "12345678",
  adminUsername:"admin",
  adminPassword:"12345678"
};

it("kiểm tra quyền user không dc update voucher", async () => {
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
    .send({
        files: { image: "_image" },
    })
    .expect("Content-Type", /json/)
    .expect(403);
});

// it("kiểm tra quyền user không dc update voucher", async () => {
//     const jwt = await request(strapi.server)
//       .post("/auth/local")
//       .set("accept", "application/json")
//       .set("Content-Type", "application/json")
//       .send({
//         identifier: mockUserData.adminUsername,
//         password: mockUserData.adminPassword,
//       })
//       .expect("Content-Type", /json/)
//       .expect(200)
//       .then((data) => {
//         expect(data.body.jwt).toBeDefined();
//         return data.body.jwt;
//       });
//     await request(strapi.server)
//       .post("/vouchers/image")
//       .set("accept", "application/json")
//       .set("Content-Type", "application/json")
//       .set("Authorization", "Bearer " + jwt)
//       .send({},{
//           image: 'Pictures/278455850_566423334621521_1622723246964081647_n.jpg' ,
//       })
//       .expect("Content-Type", /json/)
//       .expect(200);
//   });