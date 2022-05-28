const userDefault = {
  provider: "local",
  password: "12345678",
  phone: "0987654322",
  confirmed: true,
  blocked: null,
  name: "test user",
  avatar: "6252e8b4ea1e034ff2ad3e02",
  device_token:
    "u49zhc8RBqAoptvZtJnue:APA91bGuqOL0Cpo93MeWN-CCMAMjqfagOfQpqiEqPeEqNu9Vo1Y_yhP4lIFOFqTXiQm11JHKRjvytl2cXw1EirFLRExBMHS-FaGqxqIOoyv-XUQxa8Az_NbvvqkT3mp9xqPSl3NG4ji9",
};

const mockUserData = {
  customer: {
    ...userDefault,
    username: "ts1_1",
    email: "ts1_1@strapi.com",
    type: "Platinum",
    role: "customer",
  },
  customerPayment: {
    ...userDefault,
    username: "ts1_cpm",
    email: "ts1_cpm@strapi.com",
    type: "Platinum",
    role: "customer",
  },
  driver: {
    ...userDefault,
    username: "ts1_2",
    email: "ts1_2@strapi.com",
    role: "driver",
  },
  driverPayment: {
    ...userDefault,
    username: "ts1_dpm",
    email: "ts1_dpm@strapi.com",
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
