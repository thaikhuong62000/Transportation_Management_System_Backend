const initOrder = require("../helpers/initOrder");
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

initOrder("order1", mockOrder[0]);
it("đúng dữ liệu /orders", async () => {
  const order = createdOrder("order1");
  expect(order.from_address.latitude).toBe(mockAddress[0].latitude);
});
