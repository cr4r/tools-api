const configFile = process.env.CONFIG_FILE;
const root_path = process.env.ROOT_PATH;
const { pengguna } = require(configFile);

const { registrasi_post } = require(`${root_path}/controllers`);

const { schemaValidatorUser } = require(`${root_path}/middlewares`);
const { userRegisterSchema } = require(`${root_path}/schemas`);

async function userRegistrasiRoutes(fastify, options) {
  // Kelola user
  fastify.post(
    pengguna.registrasi.url,
    { preHandler: schemaValidatorUser(userRegisterSchema) },
    registrasi_post
  );
}

module.exports = { userRegistrasiRoutes };
