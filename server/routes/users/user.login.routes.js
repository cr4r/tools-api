const configFile = process.env.CONFIG_FILE;
const root_path = process.env.ROOT_PATH;
const { tools, root, pengguna } = require(configFile);

const { login_post, logout_post } = require(`${root_path}/controllers`);
const { detectDevice } = require(`${root_path}/middlewares`);
const { rateLimitConfig } = require(`${root_path}/services`);

async function userLoginRoutes(fastify, options) {
  // Kelola user
  fastify.post(
    pengguna.login.url,
    {
      preHandler: detectDevice,
      config: rateLimitConfig({
        message:
          "Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit.",
      }),
    },
    login_post
  );
  fastify.post(
    pengguna.user.url + "/logout",
    {
      config: rateLimitConfig({
        userLimit: 3,
        message: "Terlalu banyak percobaan logout, Silahkan coba lagi nanti",
      }),
    },
    logout_post
  );
}

module.exports = { userLoginRoutes };
