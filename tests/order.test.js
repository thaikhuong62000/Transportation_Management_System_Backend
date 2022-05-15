require("./helpers/initTestSuite");
const initUser = require("./helpers/initUser");
const loginUser = require("./helpers/loginUser");
const { variable } = require("./__mocks__/Global");
const request = require("supertest");
const { jwtToken } = require("./__mocks__/AuthMocks");
const mockUserData = {
  username: "acustomerod",
  email: "acustomerod@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654322",
  confirmed: true,
  blocked: null,
  type: "Platinum",
  role: "customer",
};

const voucherData = {
  sale_max: 20000,
  sale: 0.1,
  name: "new years vouchers",
};

initUser("customer", mockUserData);

const mockAdminData = {
  email: "admin",
  password: "12345678",
};

loginUser("admin", mockAdminData);

beforeAll(async () => {
  await request(strapi.server)
    .post("/vouchers")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .send(voucherData)
    .expect("Content-Type", expect === 404 ? /text/ : /json/)
    .expect(200)
    .then((data) => {
      expect(data.body.id).toBeDefined();
      variable("voucher", data.body.id);
    });
  let i = 0;
  while (i < 5 && !variable("order")) {
    i++;
    await request(strapi.server)
      .post("/orders")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("customer"))
      .send({
        fee: 12,
        from_address: {
          city: "Quảng Ninh",
          latitude: 15.920886145522292,
          longitude: 108.2056727260351,
          province: "Hạ Long",
          street: "2 Duong tu biet",
          ward: "Hà Khánh",
        },
        method: "direct",
        name: "Chuyen apple cho long",
        note: "gap",
        packages: [
          {
            name: "apple",
            note: "a",
            package_type: "normal",
            quantity: 23,
            size: { height: 123, len: 213, width: 123 },
            weight: 123,
          },
        ],
        payer_name: "Khuong2",
        payer_phone: "0922382839",
        receiver_name: "Khuong2",
        receiver_phone: "0922382839",
        remain_fee: 12,
        sender_name: "Fujiwara Chika",
        sender_phone: "0122324572",
        to_address: {
          city: "Hồ Chí Minh",
          latitude: 10.806322512527341,
          longitude: 106.61174286156894,
          province: "1",
          street: "2 hem 24",
          ward: "Tân Định",
        },
        voucher: variable("voucher"),
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((data) => {
        if (data?.body?.id) {
          variable("order", data.body.id);
        }
      });
    console.log("test");
    console.log(i);
    console.log(variable("order"));
  }
});

afterAll(async () => {
  await request(strapi.server) // app server is an instance of Class: http.Server
    .delete("/vouchers/" + variable("voucher"))
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .expect("Content-Type", /json/)
    .expect(200);
  if (variable("order")) {
    await request(strapi.server)
      .get("/orders/" + variable("order"))
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(200)
      .then((data) => {
        data.body.packages.forEach(async (element) => {
          await strapi.services.shipment
            .delete({
              packages: [element.id],
            })
            .then((data) => {
              expect(data).toBeDefined();
            });
          await request(strapi.server)
            .delete("/packages/" + element.id)
            .set("accept", "application/json")
            .set("Content-Type", "application/json")
            .set("Authorization", "Bearer " + jwtToken("admin"))
            .expect("Content-Type", /json/)
            .expect(200);
        });
      });
    await request(strapi.server)
      .delete("/orders/" + variable("order"))
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(200);
  }
});

require("./order");
