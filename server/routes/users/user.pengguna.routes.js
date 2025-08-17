const root_path = process.cwd();
const { pengguna } = require(root_path + "/" + process.env.CONFIG_FILE);
const {
  verifyTokenAndRole,
  schemaValidatorUser,
} = require(`${root_path}/middlewares`);
const {
  pengguna_put,
  pengguna_delete,
  pengguna_get,
} = require(`${root_path}/controllers`);
const { userUpdateSchema } = require(`${root_path}/schemas`);
const { rateLimitConfig } = require(`${root_path}/services`);

async function userPenggunaRoutes(fastify, options) {
  // Kelola user
  fastify.get(
    pengguna.user.url,
    {
      preHandler: [verifyTokenAndRole("admin.owner.developer")],
      config: rateLimitConfig(),
    },
    pengguna_get
  );
  fastify.put(
    pengguna.user.url,
    {
      preHandler: [
        verifyTokenAndRole("admin.user"),
        schemaValidatorUser(userUpdateSchema),
      ],
      config: rateLimitConfig(),
    },
    pengguna_put
  );
  fastify.delete(
    pengguna.user.url + "/:id?",
    {
      preHandler: verifyTokenAndRole("admin.user"),
      config: rateLimitConfig(),
    },
    pengguna_delete
  );
}

/*
app.route({
  method: 'GET',
  url: '/admin-endpoint',
  preHandler: verifyTokenAndRole("admin.user"),
  handler: async (req, reply) => {
    // Hanya admin yang dapat mengakses bagian ini
    reply.send({ message: "Welcome, admin!" });
  }
});
*/

module.exports = { userPenggunaRoutes };
