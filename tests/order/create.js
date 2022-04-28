const request = require("supertest");
const initOrder = require("../helpers/initOrder");
const { jwtToken } = require("../__mocks__/AuthMocks");
const { createdOrder } = require("../__mocks__/OrderMocks");

const mockAddress = [
  {
    street: "942/2 Kha Vạn Cân",
    ward: "Trường Thọ",
    province: "Thủ Đức",
    city: "Hồ Chí Minh",
    latitude: 10.8486187,
    longitude: 106.7534891,
  },
  {
    street: "29 Hoàng Quốc Việt",
    ward: "Hùng Thắng",
    province: "Hạ Long",
    city: "Quảng Ninh",
    latitude: 20.9521162,
    longitude: 107.0219849,
  },
];

const mockPackage = [
  {
    package_type: "normal",
    name: "Ao",
    quantity: 12,
    weight: 21,
    note: "",
    size: {
      len: 12,
      width: 12,
      height: 12,
    },
  },
  {
    package_type: "normal",
    name: "Thien Quy",
    quantity: 1,
    weight: 50,
    note: "Thien Quy",
    size: {
      len: 35,
      width: 20,
      height: 165,
    },
  },
];

const mockOrder = [
  {
    name: "Test order",
    sender_phone: "0968059020",
    sender_name: "Thái Khương",
    receiver_phone: "012345678",
    receiver_name: "Nhi Long",
    from_address: mockAddress[0],
    to_address: mockAddress[1],
    packages: [mockPackage[0]],
  },
  {
    name: "Test order 2",
    sender_phone: "0968059020",
    sender_name: "Thái Khương",
    receiver_phone: "012345678",
    receiver_name: "Nhi Long",
    from_address: mockAddress[0],
    to_address: mockAddress[1],
    packages: [mockPackage[1]],
  },
];

initOrder("order1", mockOrder[0]);

it("đúng dữ liệu /orders", async () => {
  const order = createdOrder("order1");
  expect(order.from_address.latitude).toBe(mockAddress[0].latitude);
});

/*
{"fee": 1000000,
 "from_address": {"city": "Thành phố Hồ Chí Minh", "province": "Tân Phú", "street": "135 Nguyễn Cửu Đàm", "ward": " Tân Sơn Nhì"},
  "method": "direct", 
  "name": "xa phong play boy", 
  "packages": [{"createdAt": "2022-04-12T04:56:19.048Z", 
  "name": "xa phong tam play boy", 
  "note": "", 
  "package_type": "normal",
   "quantity": 30, 
   "size": [Object],
   "updatedAt": "2022-04-20T08:16:24.090Z",
    "user": [Object], "weight": 3}], 
    
    "payer_name": "Khuong Thai Nguyen Pham", 
    "payer_phone": "0938286027", 
    "receiver_name": "Khuong Thai Nguyen Pham", 
    "receiver_phone": "0938286027", 
    "remain_fee": 1000000, 
    "sender_name": "Fujiwara Chika", 
    "sender_phone": "012232457", 
    "to_address": {"city": "Cần Thơ", "province": "Ninh Kiều", "street": "Đ. 3/2", "ward": "Xuân Khánh"}, 
    "voucher": undefined}


*/

it.skip("test len âm /orders", async () => {
  const auth = await request(strapi.server)
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
      return data;
    });
  await request(strapi.server)
    .post("/orders")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + auth.body.jwt)
    .send({
      sender_phone: auth.body.user.phone,
      sender_name: auth.body.user.username,
      receiver_phone: "1",
      receiver_name: "fuuuu",
      method: "direct",
      fee: 10,
      remain_fee: 10,
      from_address: {
        city: "a",
        province: "a",
        street: "a",
        ward: "a",
      },
      to_address: {
        city: "a",
        province: "a",
        street: "a",
        ward: "a",
      },
      name: "testing",
      packages: [
        {
          updatedAt: "2022-04-20T08:16:24.080Z",
          name: "values.name",
          note: "",
          size: {
            len: -11,
            width: 11,
            height: 11,
          },
          weight: 11,
          quantity: 11,
          package_type: "normal",
        },
      ],
      payer_name: auth.body.user.username,
      payer_phone: auth.body.user.phone,
    })
    .expect("Content-Type", /json/)
    .expect(400);
});

it.skip("test quantity âm /orders", async () => {
  const auth = await request(strapi.server)
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
      return data;
    });
  await request(strapi.server)
    .post("/orders")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + auth.body.jwt)
    .send({
      sender_phone: auth.body.user.phone,
      sender_name: auth.body.user.username,
      receiver_phone: "1",
      receiver_name: "fuuuu",
      method: "direct",
      fee: 10,
      remain_fee: 10,
      from_address: {
        city: "a",
        province: "a",
        street: "a",
        ward: "a",
      },
      to_address: {
        city: "a",
        province: "a",
        street: "a",
        ward: "a",
      },
      name: "testing",
      packages: [
        {
          updatedAt: "2022-04-20T08:15:24.080Z",
          name: "values.name",
          note: "",
          size: {
            len: -11,
            width: 11,
            height: 11,
          },
          weight: 11,
          quantity: -11,
          package_type: "normal",
        },
      ],
      payer_name: auth.body.user.username,
      payer_phone: auth.body.user.phone,
    })
    .expect("Content-Type", /json/)
    .expect(400);
});
// remain_fee: 1,
//       fee:1,
//       from_address:    {
//         "street": "942/2 Kha Vạn Cân",
//         "ward": "Trường Thọ",
//         "province": "Thủ Đức",
//         "city": "Hồ Chí Minh"},
//       to_address:{      "street": "29 Hoàng Quốc Việt",
//       "ward": "Hùng Thắng",
//       "province": "Hạ Long",
//       "city": "Quảng Ninh"},
//       packages:[{
//         "quantity": 10,
//         "weight": 6.78,
//         "package_type": "normal",
//         "name": "Bia Tiger ",
//         "size": {
//           "len": 35.2,
//           "width": 23.7,
//           "height": 14,
//         }
//       }],

// it("sai định dạng thoi gian", async () => {
//   const jwt = await request(strapi.server)
//     .post("/auth/local")
//     .set("accept", "application/json")
//     .set("Content-Type", "application/json")
//     .send({
//       identifier: mockUserData.username,
//       password: mockUserData.password,
//     })
//     .expect("Content-Type", /json/)
//     .expect(200)
//     .then((data) => {
//       expect(data.body.jwt).toBeDefined();
//       return data.body.jwt;
//     });
//   await request(strapi.server)
//     .post("/car-brokens")
//     .set("accept", "application/json")
//     .set("Content-Type", "application/json")
//     .set("Authorization", "Bearer " + jwt)
//     .send({
//       time: "22/12/2000",
//       car: "624bb872e68d1a14e46f7706",
//     })
//     .expect("Content-Type", /json/)
//     .expect(400);
// });

// it("xe ko ton tai", async () => {
//   const jwt = await request(strapi.server)
//     .post("/auth/local")
//     .set("accept", "application/json")
//     .set("Content-Type", "application/json")
//     .send({
//       identifier: mockUserData.username,
//       password: mockUserData.password,
//     })
//     .expect("Content-Type", /json/)
//     .expect(200)
//     .then((data) => {
//       expect(data.body.jwt).toBeDefined();
//       return data.body.jwt;
//     });
//   await request(strapi.server)
//     .post("/car-brokens")
//     .set("accept", "application/json")
//     .set("Content-Type", "application/json")
//     .set("Authorization", "Bearer " + jwt)
//     .send({
//       time: "22/12/2000",
//       car: "624bb872e68d2a14e46f7796",
//     })
//     .expect("Content-Type", /json/)
//     .expect(400);
// });
