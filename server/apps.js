"use strict";

//=====================================================================================//
// Initialize Module
const { root, tools } = require("./config.json");
require("dotenv").config();
const fastify = require("fastify")({ logger: true });
//=====================================================================================//
// const fView = require("@fastify/view");
const fStatic = require("@fastify/static");
// const ejs = require("ejs");
const path = require("path");
//=====================================================================================//
const mongoose = require("mongoose");
// Session and cookie with mongo
const fastifyCors = require("@fastify/cors");
// const fastifySession = require("@fastify/session");
// const fastifyCookie = require("@fastify/cookie");
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
fastify.register(fastify_limit, {
  max: 5, // Maksimal 100 permintaan
  timeWindow: "1 minute", // Dalam 1 menit
});

// Headers Handler
fastify.register(fastifyCors, {
  origin: (origin, cb) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://localhost:3000",
      "http://localhost",
      "http://192.168.10.15:3000",
      "http://192.168.10.15",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"], // allow these methods
  // headers: true, // allow headers
  credentials: true, // allow credentials,
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  optionsSuccessStatus: 204, // Untuk menangani preflight di browser lama
  // exposedHeaders: ["Coders-Family"],
  bodyParser: {
    json: true,
  },
});

// Custom Header global
fastify.addHook("onSend", async (req, reply, payload) => {
  reply.header("x-powered-by", "cr4r");
  return payload;
});

// register Form data parsing
fastify.register(fastifyFormbody);
// Setup Cookie dan Session
// fastify.register(fastifyCookie);
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
//=====================================================================================//

//=====================================================================================//
//Setup URL (Routing)
//
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
      port: process.env.PORT || 3000,
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
