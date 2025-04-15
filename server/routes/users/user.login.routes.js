const configFile = process.env.CONFIG_FILE;
const root_path = process.env.ROOT_PATH;
const { tools, root, pengguna } = require(configFile);

const { login_post, logout_post } = require(`${root_path}/controllers`);

async function userLoginRoutes(fastify, options) {
  // Kelola user
  fastify.post(pengguna.login.url, login_post);
  fastify.post(pengguna.user.url + "/logout", logout_post);
}

module.exports = { userLoginRoutes };
