const configFile = process.env.CONFIG_FILE;
const { tools, root } = require(configFile);

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
