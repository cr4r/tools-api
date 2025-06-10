const root_path = process.cwd();
const { root, tools } = require(root_path + '/' + process.env.CONFIG_FILE);

const Info = async (req, rep) => {
  return {
    pesan: "",
    session: req.session,
    // config: { tools, root },
    ipServer: req.ip,
  };
};
module.exports = {
  Info,
};
