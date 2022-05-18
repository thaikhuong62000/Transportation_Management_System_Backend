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
  {
    street: "2 Đại Cồ Việt",
    ward: "Lê Đại Hành",
    province: "Hai Bà Trưng",
    city: "Hà Nội",
    latitude: 21.0092066,
    longitude: 105.8508869,
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
    name: "Ao",
    quantity: -12,
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
    name: "Ao",
    quantity: 12,
    weight: 21,
    note: "",
    size: {
      len: -12,
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
  {
    name: "Test order",
    sender_phone: "0968059020",
    sender_name: "Thái Khương",
    receiver_phone: "012345678",
    receiver_name: "Nhi Long",
    from_address: mockAddress[0],
    to_address: mockAddress[1],
  },
  {
    name: "Test order",
    sender_phone: "0968059020",
    sender_name: "Thái Khương",
    receiver_phone: "012345678",
    receiver_name: "Nhi Long",
    from_address: mockAddress[0],
    to_address: mockAddress[1],
    packages: [mockPackage[1]],
  },
  {
    name: "Test order",
    sender_phone: "0968059020",
    sender_name: "Thái Khương",
    receiver_phone: "012345678",
    receiver_name: "Nhi Long",
    from_address: mockAddress[0],
    to_address: mockAddress[1],
    packages: [mockPackage[2]],
  },
  {
    name: "Test order",
    from_address: mockAddress[0],
    to_address: mockAddress[1],
    packages: [mockPackage[0]],
  },
  {
    name: "Test order",
    sender_phone: "0968059020",
    sender_name: "Thái Khương",
    receiver_phone: "012345678",
    receiver_name: "Nhi Long",
    from_address: mockAddress[0],
    to_address: mockAddress[2],
    packages: [mockPackage[0]],
  },
];

module.exports = { mockOrder, mockAddress };
