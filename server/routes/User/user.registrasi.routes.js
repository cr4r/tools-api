const configFile = process.env.CONFIG_FILE;
const root_path = process.env.ROOT_PATH;
const { tools, root, user } = require(configFile);

const {
  registrasi_post,
  registrasi_put,
  registrasi_delete,
} = require(`${root_path}/controllers/user`);

async function userRegistrasiRoutes(fastify, options) {
  // Kelola user
  fastify.post(user.registrasi.url + "/:id", registrasi_post);
  fastify.put(user.registrasi.url + "/:id", registrasi_put);
  fastify.delete(user.registrasi.url + "/:jenis?", registrasi_delete);
}

module.exports = { userRegistrasiRoutes };
