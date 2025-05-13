const configFile = process.env.CONFIG_FILE;
const root_path = process.env.ROOT_PATH;
const { pengguna } = require(configFile);
const { verifyRefreshToken, auth } = require(`${root_path}/middlewares`);

const { registrasi_post } = require(`${root_path}/controllers`);

async function userRegistrasiRoutes(fastify, options) {
  // Kelola user
  fastify.post(pengguna.registrasi.url, registrasi_post);
}

module.exports = { userRegistrasiRoutes };
