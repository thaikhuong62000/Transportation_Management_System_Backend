const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");

const image = "public/uploads/voucher_pic0.jpg";
const image_map_png = "public/uploads/map.png";

const images = [
  {
    image: "public/uploads/voucher_pic0.jpg",
    type: "admin",
    name: "kiểm tra quyền admin update voucher .jpg file",
    expected: 200,
  },
  {
    image: "public/uploads/voucher_pic0.jpg",
    type: "user",
    name: "kiểm tra quyền user không dc update voucher",
    expected: 403,
  },
  {
    image: "public/uploads/voucher_pic0.jpg",
    type: "admin",
    name: "kiểm tra quyền admin update voucher .jpg file",
    expected: 200,
  },
  {
    image: "public/uploads/map.png",
    type: "admin",
    name: "kiểm tra quyền admin update voucher .png file",
    expected: 200,
  },
  {
    image: ".gitignore",
    type: "admin",
    name: "kiểm tra quyền admin update image nhưng không phải file hình voucher",
    expected: 400,
  },
];

it.each(images)("$name", async ({ image, type, expected }) => {
  const jwt = type === "admin" ? jwtToken("admin") : jwtToken("customer");
  const image_id = await request(strapi.server)
    .post("/vouchers/image")
    .set("accept", "*")
    .set("Authorization", "Bearer " + jwt)
    .attach("image", image)
    .expect("Content-Type", /json/)
    .expect(expected)
    .then((data) => {
      return expected === 200 ? data.body[0]._id : undefined;
    });
  if (image_id) {
    await strapi.query("file", "upload").model.deleteOne({ _id: image_id });
  }
});
