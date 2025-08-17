const root_path = process.cwd();
const {
  handleServerResponseError,
  sanitizeInput,
} = require(`${root_path}/services`);

const { User } = require(`${root_path}/models`);

const registrasi_post = async (req, reply) => {
  // console.log(req.body);
  try {
    let allowInput = ["email", "password", "fullName"];
    let body = await sanitizeInput(req.body, allowInput);

    const create_user = new User(body);
    const { fullName, email } = await create_user.save();
    return reply.status(200).send({
      status: true,
      data: { fullName, email },
      message: "Akun anda telah dibuat",
    });
  } catch (err) {
    const { codeStatus, status, message } = await handleServerResponseError(
      err
    );
    console.log(message);
    return reply.status(codeStatus).send({ status, message });
  }
};

module.exports = {
  registrasi_post,
};
