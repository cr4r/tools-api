const configFile = process.env.CONFIG_FILE;
const root_path = process.env.ROOT_PATH;
const { pengguna } = require(configFile);

const { user_token_post } = require(`${root_path}/controllers`);
const { rateLimitConfig } = require(`${root_path}/services`);

async function userTokenRoutes(fastify, options) {
  // Kelola user
  fastify.post(
    pengguna.user.url + "/refresh",
    { config: rateLimitConfig() },
    user_token_post
  );
}

module.exports = { userTokenRoutes };
