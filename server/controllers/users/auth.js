const root_path = process.env.ROOT_PATH;
const { User } = require(`${root_path}/models`);
const {
  verifyRefreshToken,
  generateTokens,
} = require(`${root_path}/middlewares`);

const refresh_token_post = async (req, reply) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return reply
      .code(403)
      .send({ status: false, message: "Error!!!", error: "Token tidak valid" });

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findOne({
      _id: decoded._id,
      refresh_token: refreshToken,
    });

    if (!user)
      return reply.code(403).send({
        status: false,
        message: "Error!!!",
        error: "Token tidak valid",
      });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      _id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    user.refreshToken = newRefreshToken;
    await user.save();

    reply.send({
      status: true,
      message: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    reply.code(403).send({
      status: false,
      message: "Error",
      error: "Token tidak valid atau kadaluarsa",
      detail: err.message,
    });
  }
};

module.exports = {
  refresh_token_post,
};
