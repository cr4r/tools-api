const configFile = process.env.CONFIG_FILE;
const root_path = process.env.ROOT_PATH;
const { pengguna } = require(configFile);
const { verifyRefreshToken, auth } = require(`${root_path}/middlewares`);

const {
  registrasi_post,
  registrasi_put,
  registrasi_delete,
} = require(`${root_path}/controllers`);

async function userRegistrasiRoutes(fastify, options) {
  // Kelola user
  fastify.post(pengguna.registrasi.url, registrasi_post);
  fastify.put(pengguna.user.url, { preHandler: auth }, registrasi_put);
  fastify.delete(
    pengguna.user.url + "/:jenis?",
    { preHandler: auth },
    registrasi_delete
  );
}

/*
app.route({
  method: 'GET',
  url: '/admin-endpoint',
  preHandler: async (req, reply) => {
    req.requiredRole = 'admin.user'; // Tentukan role yang diperlukan
    await verifyTokenAndRole(req, reply); // Verifikasi token dan role
  },
  handler: async (req, reply) => {
    // Hanya admin yang dapat mengakses bagian ini
    reply.send({ message: "Welcome, admin!" });
  }
});
*/

module.exports = { userRegistrasiRoutes };
