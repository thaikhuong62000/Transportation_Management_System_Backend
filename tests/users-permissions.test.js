require("./helpers/initTestSuite");
const initUser = require("./helpers/initUser");
const getFirebaseToken = require("./helpers/getFirebaseToken");
const loginUser = require("./helpers/loginUser");
const { firebaseToken } = require("./__mocks__/AuthMocks");
const { jwtToken } = require("./__mocks__/AuthMocks");
const mockUserData = {
  username: "atesterup",
  email: "atesterup@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654321",
  confirmed: true,
  blocked: null,
  role: "customer",
};
<<<<<<< HEAD

const adminData = {
  email: "admin",
  password: "12345678",
};
loginUser("admin", adminData);
initUser("customer", mockUserData);
=======
loginUser("admin", mockUserData.admin);
initUser("customer", mockCustomerData);
>>>>>>> b8468e95cc4f1d995ed41d25d5d4245f88a42bbd

// Get FirebaseToken
beforeAll(async () => {
  const token = await getFirebaseToken(mockCustomerData.phone, true);
  firebaseToken.mockReturnValue(token);
});

require("./users-permissions");
