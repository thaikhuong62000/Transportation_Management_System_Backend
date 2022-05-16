require("./helpers/initTestSuite");
const initUser = require("./helpers/initUser");
const loginUser = require("./helpers/loginUser");
const initOrder = require("./helpers/initOrder");
const { REMOTE_URL } = require("./helpers/constant");

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

const mockAdminData = {
  email: "admin",
  password: "12345678",
};

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
];

initUser("customer", mockUserData);
loginUser("customer_remote", mockUserData, REMOTE_URL);
loginUser("admin", mockAdminData);
initOrder("order", mockOrder[0]);

require("./order");
