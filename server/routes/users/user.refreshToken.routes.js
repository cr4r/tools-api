const configFile = process.env.CONFIG_FILE;
const root_path = process.env.ROOT_PATH;
const { pengguna } = require(configFile);

const { refresh_token_post } = require(`${root_path}/controllers`);

async function userRefreshTokenRoutes(fastify, options) {
  // Kelola user
  fastify.post(pengguna.user.url + "/refresh", refresh_token_post);
}

module.exports = { userRefreshTokenRoutes };
