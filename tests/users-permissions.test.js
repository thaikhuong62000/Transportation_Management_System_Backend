require("./helpers/initTestSuite");
const initUser = require("./helpers/initUser");
const getFirebaseToken = require("./helpers/getFirebaseToken");
const { mockUserData } = require("./testsuite1/mockData");
const { firebaseToken } = require("./__mocks__/AuthMocks");
const loginUser = require("./helpers/loginUser");
const mockCustomerData = {
  username: "atesterup",
  email: "atesterup@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654321",
  confirmed: true,
  blocked: null,
  role: "customer",
};
loginUser("admin", mockUserData.admin);
initUser("customer", mockCustomerData);

// Get FirebaseToken
beforeAll(async () => {
  const token = await getFirebaseToken(mockCustomerData.phone, true);
  firebaseToken.mockReturnValue(token);
});

require("./users-permissions");
