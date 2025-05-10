const configFile = process.env.CONFIG_FILE;
const root_path = process.env.ROOT_PATH;
const { pengguna } = require(configFile);

// routes/auth.routes.js
const { logout_post } = require(`${root_path}/controllers`);

async function logout_routes(fastify, options) {
  fastify.post(pengguna.user.url + "/logout", logout_post);
}

module.exports = { logout_routes };
