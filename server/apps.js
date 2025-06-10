"use strict";

//=====================================================================================//
// Initialize Module
const { root, tools } = require("./config.json");
require("dotenv").config();
//=====================================================================================//
// const fView = require("@fastify/view");
const fStatic = require("@fastify/static");
// const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
//=====================================================================================//
const mongoose = require("mongoose");
// Session and cookie with mongo
const fastifyCors = require("@fastify/cors");
// const fastifySession = require("@fastify/session");
const fastifyCookie = require("@fastify/cookie");
const fastifyFormbody = require("@fastify/formbody");
const fastifyMultipart = require("@fastify/multipart");
const fastify_limit = require("@fastify/rate-limit");

const maxCookie = 24 * 60 * 60 * 1000 * 360; // 360 hari

//// Tools Router
const { YoutubeRoutes } = require("./routes");
//// User Router
const {
  userRegistrasiRoutes,
  userTokenRoutes,
  userLoginRoutes,
  userPenggunaRoutes,
} = require("./routes");


//=====================================================================================//

// Baca sertifikat SSL
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../ssl', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../ssl', 'cert.pem'))
};

const fastify = require("fastify")({ logger: true,https: httpsOptions });

//// Tarok root_path di fastify (fastify.root_path;)
fastify.decorate('root_path', process.cwd());

//=====================================================================================//
// function connect Database
const startDatabase = async (app) => {
  // Memulai server tanpa DB
  let statuss = false,
    i = 0;
  app.log.info(`Sedang mencoba menghubungkan database`);
  while (!statuss) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("✔✔✔ Database sudah terhubung ✔✔✔");
      statuss = true;
    } catch (err) {
      // "Error!, Gagal terhubung ke database"
      console.log(`[${i}] Error!!! Gagal terhubung ke database, try again`);
    }
    i++;
  }
};
//=====================================================================================//

//=====================================================================================//
// register Form multipart
fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // Batasi ukuran file maksimum 5MB
  },
});

// Mengonfigurasi rate limit
fastify.register(fastify_limit);

// Headers Handler
fastify.register(fastifyCors, {
  origin: (origin, cb) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://192.168.1.15",
      "http://192.168.1.15:3000",
      "http://192.168.1.1:3000",
      "http://192.168.1.222",
      "http://localhost:4000",
      "https://openwrt.local:3001",
    ];
    console.log(origin);
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Origin not allowed"), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allow these methods
  credentials: true, // allow credentials,
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  optionsSuccessStatus: 204, // Untuk menangani preflight di browser lama
  exposedHeaders: ["x-auth-token", "authorization"],
  // bodyParser: {
  //   json: true,
  // },
});

// Custom Header global
fastify.addHook("onSend", async (req, reply, payload) => {
  reply.header("x-powered-by", "cr4r");
  return payload;
});

//// Handle error schema
fastify.register(require("@fastify/ajv-compiler"), {
  customOptions: {
    allErrors: true,
    ajvErrors: true,
  },
});

// register Form data parsing
fastify.register(fastifyFormbody);
// Setup Cookie dan Session
fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || "123-123ed-sdfjvn-12dsvds", // untuk signed cookie
  hook: "onRequest",
});

// fastify.register(fastifySession, {
//   key: "user_sid",
//   secret:
//     "11b8efw5tfe8sfi87d44167606f848234defcea0c91cd899b9f6c33f8354e74ded09",
//   cookie: {
//     maxAge: maxCookie,
//     secure: false,
//   },
// });
//=====================================================================================//

//=====================================================================================//
// Untuk Views
// fastify.register(fView, {
//   engine: {
//     ejs: ejs,
//   },
//   root: path.join(__dirname, "views"),
//   viewExt: "html",
//   includeViewExtension: true,
// });

// Untuk Style
fastify.register(fStatic, {
  root: path.join(__dirname, "public/assets"),
  prefix: "/assets/",
});

//// untuk web
// fastify.register(fStatic, {
//   root: path.join(__dirname, "public/web"),
//   prefix: "/",
//   decorateReply: false,
// });
//=====================================================================================//

//=====================================================================================//
//Setup URL (Routing)
//
// fastify.addHook("onRequest", (req, reply, done) => {
//   console.log("Cookies?", req.cookies); // <- harusnya tampil
//   done();
// });
fastify.register(YoutubeRoutes, { prefix: "/tools" });
fastify.register(userRegistrasiRoutes, { prefix: "/" });
fastify.register(userTokenRoutes, { prefix: "/" });
fastify.register(userLoginRoutes, { prefix: "/" });
fastify.register(userPenggunaRoutes, { prefix: "/" });
//=====================================================================================//

//=====================================================================================//
// Handle Error Routing
//
fastify.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    status: false,
    message: "Saat ini belum ada halaman website",
    error: "Not Found",
  });
});
//=====================================================================================//

//=====================================================================================//
// Start database dan server
const start = async (app) => {
  try {
    let teks = "Saat ini belum ada halaman website";
    let linkAPi = "/:id?";
    // Menghubungkan database
    await startDatabase(app);

    // Memulai server
    await app.listen({
      host: "0.0.0.0",
      port: process.env.PORT || 5000,
    });
    await app.ready(); // pastikan server siap

    app.log.info(
      `Server telah berjalan di port ${fastify.server.address().port}`
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
//=====================================================================================//

//=====================================================================================//
// RUN Function
start(fastify);
//=====================================================================================//
