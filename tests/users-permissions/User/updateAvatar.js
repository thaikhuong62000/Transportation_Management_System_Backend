const request = require("supertest");

const { jwtToken } = require("../../__mocks__/AuthMocks");

const mockAvatar = [
  { avatar: "public/uploads/map.png", expected: "update" },
  { avatar: "public/uploads/MDT-48.txt", expected: "not update" },
  { avatar: "", expected: "not update" },
];
const adminMockAvatar = [
  { avatar: "public/uploads/map.png", expected: "update" },
];
it.each(mockAvatar)("should $expected avatar", async ({ avatar, expected }) => {
  const user = (
    await request(strapi.server)
      .put("/users/avatar")
      .set("accept", "*")
      .set("Authorization", "Bearer " + jwtToken("customer"))
      .attach("avatar", avatar)
      .expect("Content-Type", /json/)
      .expect(expected === "update" ? 200 : 400)
  )._body;
  const avatarName = avatar.split("/").pop();
  if (expected === "update") {
    expect(user.avatar?.name).toBe(avatarName);
    // Delete Test Avatar
    await strapi
      .query("file", "upload")
      .model.deleteOne({ _id: user.avatar?.id });
  }
});

it.each(adminMockAvatar)("admin update avatar", async () => {
  await request(strapi.server)
    .put("/users/avatar")
    .set("accept", "*")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .attach("avatar", "public/uploads/map.png") // tui ko biet dau` vao` la` gi` :(
    .expect("Content-Type", /json/)
    .expect(200);
});
