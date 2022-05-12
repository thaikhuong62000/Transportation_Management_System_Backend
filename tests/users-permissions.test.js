require("./helpers/initTestSuite");
const initUser = require("./helpers/initUser");
const getFirebaseToken = require("./helpers/getFirebaseToken");

const { firebaseToken } = require("./__mocks__/AuthMocks");

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

initUser("customer", mockUserData);

// Get FirebaseToken
beforeAll(async () => {
  const token = await getFirebaseToken(mockUserData.phone, true);
  firebaseToken.mockReturnValue(token);
});

require("./users-permissions");
