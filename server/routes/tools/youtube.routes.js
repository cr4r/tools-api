const configFile = process.env.CONFIG_FILE;
const { tools, root } = require(configFile);

const {
  youtube_get,
  youtube_post,
  youtube_put,
  youtube_delete,
} = require("../../controllers/tools");

async function YoutubeRoutes(fastify, options) {
  // Kelola Youtube
  fastify.get(tools.youtube.url, youtube_get);
  fastify.post(tools.youtube.url + "/:id", youtube_post);
  fastify.put(tools.youtube.url + "/:id", youtube_put);
  fastify.delete(tools.youtube.url + "/:jenis?", youtube_delete);
}

module.exports = { YoutubeRoutes };
