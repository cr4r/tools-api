const configFile = process.env.CONFIG_FILE;
const root_path = process.env.ROOT_PATH;
const { pengguna } = require(configFile);
const {
  verifyTokenAndRole,
  schemaValidatorUser,
} = require(`${root_path}/middlewares`);
const { pengguna_put, pengguna_delete } = require(`${root_path}/controllers`);
const { userUpdateSchema } = require(`${root_path}/schemas`);

async function userPenggunaRoutes(fastify, options) {
  // Kelola user
  fastify.put(
    pengguna.user.url,
    {
      preHandler: [
        verifyTokenAndRole("admin.user"),
        schemaValidatorUser(userUpdateSchema),
      ],
    },
    pengguna_put
  );
  fastify.delete(
    pengguna.user.url + "/:id?",
    { preHandler: verifyTokenAndRole("admin.user") },
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
