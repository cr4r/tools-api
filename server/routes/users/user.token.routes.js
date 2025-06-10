const root_path = process.cwd();
const { pengguna } = require(root_path + '/' + process.env.CONFIG_FILE);

const {
  user_token_refresh,
  user_history_delete,
  history_get,
} = require(`${root_path}/controllers`);
const { verifyTokenAndRole } = require(`${root_path}/middlewares`);

const { rateLimitConfig } = require(`${root_path}/services`);

async function userTokenRoutes(fastify, options) {
  // Kelola user
  fastify.get(
    pengguna.user.url + "/history/:id",
    {
      preHandler: verifyTokenAndRole("admin.user"),
      config: rateLimitConfig({ userLimit: 10 }),
    },
    history_get
  );
  fastify.get(
    pengguna.user.url + "/refresh",
    { config: rateLimitConfig() },
    user_token_refresh
  );
  fastify.delete(
    pengguna.user.url + "/history/:id",
    {
      preHandler: [verifyTokenAndRole("admin.user")],
      config: rateLimitConfig(),
    },
    user_history_delete
  );
}

module.exports = { userTokenRoutes };
