require("./helpers/initTestSuite");

const request = require("supertest");
const initUser = require("./helpers/initUser");
const initOrder = require("./helpers/initOrder");
const loginUser = require("./helpers/loginUser");
const { createdUser, jwtToken } = require("./__mocks__/AuthMocks");
const { createdOrder } = require("./__mocks__/OrderMocks");

const mockOrder = require("./order/mockOrder");
const { mockUserData } = require("./testsuite1/mockData");
let shipment;
let shipment_item;

["customer", "driver", "stocker1", "stocker2"].forEach((userType) => {
  initUser(userType, mockUserData[userType]);
});
loginUser("admin", mockUserData.admin);
initOrder("order", mockOrder[5]);

it("driver accept shipment", async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for creating shipment
  shipment = await strapi.services.shipment.findOne(
    {
      packages_in: createdOrder("order").packages.map((item) => item.id),
    },
    []
  );
  await request(strapi.server)
    .put("/shipments/accept/" + shipment.id)
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("driver"))
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      expect(data.body.driver).toBe(createdUser("driver").id);
    });
});

it("driver receive packages", async () => {
  shipment_item = await request(strapi.server)
    .post("/shipment-items")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("driver"))
    .send({
      quantity: 12,
      shipment: shipment.id,
      package: createdOrder("order").packages[0].id,
      assmin: false,
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => data.body);
});

it("stocker1 import packages", async () => {
  await request(strapi.server)
    .put("/imports/update-quantity")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("stocker1"))
    .send({
      packageId: createdOrder("order").packages[0].id,
      shipmentItem: shipment_item.id,
      quantity: 12,
    })
    .expect("Content-Type", /json/)
    .expect(200);
});

it("admin create export shipment", async () => {
  const from_storage = createdUser("stocker1").storage;
  const to_storage = await strapi.services.storage.getNearestStorage(
    createdOrder("order").to_address
  );

  const { _id: _fid, id: fid, ...from_address } = from_storage.address;
  const { _id: _tid, id: tid, ...to_address } = to_storage.address;

  shipment = await request(strapi.server)
    .post("/shipments")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .send({
      shipmentData: {
        driver: createdUser("driver").id,
        from_address: from_address,
        to_address: to_address,
        packages: createdOrder("order").packages.map((item) => item.id),
        from_storage: from_storage.id,
        to_storage: to_storage.id,
      },
      shipmentItems: [
        {
          quantity: 12,
          package: createdOrder("order").packages[0].id,
          assmin: true,
        },
      ],
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => data.body[0]);
});

it("stocker1 export packages", async () => {
  shipment_item = await strapi.services["shipment-item"].findOne(
    {
      shipment: shipment.id,
    },
    []
  );

  await request(strapi.server)
    .put("/exports/update-quantity")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("stocker1"))
    .send({
      packageId: createdOrder("order").packages[0].id,
      shipmentItem: shipment_item.id,
      quantity: 12,
    })
    .expect("Content-Type", /json/)
    .expect(200);
});

it("stocker2 import packages", async () => {
  await request(strapi.server)
    .put("/imports/update-quantity")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("stocker2"))
    .send({
      packageId: createdOrder("order").packages[0].id,
      shipmentItem: shipment_item.id,
      quantity: 12,
    })
    .expect("Content-Type", /json/)
    .expect(200);
});

it("driver accept shipment", async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for creating shipment
  shipment = await strapi.services.shipment.find(
    {
      packages_in: createdOrder("order").packages.map((item) => item.id),
    },
    []
  );
  shipment = shipment.find((item) => !item.to_storage && item.from_storage);
  await request(strapi.server)
    .put("/shipments/accept/" + shipment.id)
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("driver"))
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      expect(data.body.driver).toBe(createdUser("driver").id);
    });
});

it("stocker2 export packages", async () => {
  await request(strapi.server)
    .put("/exports/update-quantity")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("stocker2"))
    .send({
      packageId: createdOrder("order").packages[0].id,
      quantity: 11,
      shipment: shipment.id,
    })
    .expect("Content-Type", /json/)
    .expect(200);
});

it("driver throw packages", async () => {
  shipment_item = await request(strapi.server)
    .post("/shipment-items")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("driver"))
    .send({
      quantity: 11,
      shipment: shipment.id,
      package: createdOrder("order").packages[0].id,
      assmin: false,
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => data.body);
});

it("from testSui get orders tracing ", async () => {
  await request(strapi.server)
    .get("/orders/tracing/" + createdOrder("order").id)
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("customer"))
    .expect("Content-Type", /json/)
    .expect(200);
});

afterAll(() => {
  // return strapi.services["shipment-item"]
  //   .delete({
  //     package_in: createdOrder("order").packages.map((item) => item.id),
  //   })
  //   .then((data) => {
  //     expect(data).toBeDefined();
  //   });
});
