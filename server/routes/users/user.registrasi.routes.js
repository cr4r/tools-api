const root_path = process.cwd();
const { pengguna } = require(root_path + '/' + process.env.CONFIG_FILE);

const { registrasi_post } = require(`${root_path}/controllers`);

const { schemaValidatorUser } = require(`${root_path}/middlewares`);
const { userRegisterSchema } = require(`${root_path}/schemas`);

const { rateLimitConfig } = require(`${root_path}/services`);

async function userRegistrasiRoutes(fastify, options) {
  // Kelola user
  fastify.post(
    pengguna.registrasi.url,
    {
      preHandler: schemaValidatorUser(userRegisterSchema),
      config: rateLimitConfig(),
    },
    registrasi_post
  );
}

module.exports = { userRegistrasiRoutes };
