const userDefault = {
  provider: "local",
  password: "12345678",
  phone: "0987654322",
  confirmed: true,
  blocked: null,
};

const mockUserData = {
  customer: {
    ...userDefault,
    username: "ts1_1",
    email: "ts1_1@strapi.com",
    type: "Platinum",
    role: "customer",
  },
  driver: {
    ...userDefault,
    username: "ts1_2",
    email: "ts1_2@strapi.com",
    role: "driver",
  },
  stocker1: {
    ...userDefault,
    username: "ts1_3",
    email: "ts1_3@strapi.com",
    role: "stocker",
    storage: "6252b6055eedf42d04bd514e",
  },
  stocker2: {
    ...userDefault,
    username: "ts1_4",
    email: "ts1_4@strapi.com",
    role: "stocker",
    storage: "6252b7e05eedf42d04bd5158",
  },
  admin: {
    email: "admin",
    password: "12345678",
  },
};

module.exports = { mockUserData };
