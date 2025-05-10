const UAParser = require("ua-parser-js");

// Daftar pola khusus buat fallback detection
const patterns = [
  { type: "MobileApp", regex: /Android|iPhone|iOS/i },
  { type: "WebView", regex: /AppleWebKit/i },
  { type: "DesktopApp", regex: /Electron|Windows NT|Macintosh/i },
  { type: "CLI", regex: /curl|Postman|wget/i },
  { type: "SmartDevice", regex: /Smart-TV|Tizen|Hub|Printer|Alexa/i },
  { type: "Emulator", regex: /SDK built for x86|Emulator/i },
  { type: "Fake", regex: /TotallyFakeUA|MadeUpOS/i },
  { type: "Bot", regex: /bot|crawl|spider|slurp|google/i }, // Deteksi bot
];

// Fallback parser manual kalau UAParser gagal
function fallbackUAParser(ua = "") {
  let os = "Unknown";
  let version = "Unknown";

  if (/Android/i.test(ua)) {
    os = "Android";
    const match = ua.match(/Android[\/ ]([0-9.]+)/i);
    if (match) version = match[1];
  } else if (/iPhone|iPad|iOS/i.test(ua)) {
    os = "iOS";
    const match = ua.match(/OS (\d+[_\.]\d+)/i);
    if (match) version = match[1].replace("_", ".");
  } else if (/Windows NT/i.test(ua)) {
    os = "Windows";
    const match = ua.match(/Windows NT ([0-9.]+)/i);
    if (match) version = match[1];
  } else if (/Mac OS X/i.test(ua)) {
    os = "macOS";
    const match = ua.match(/Mac OS X ([0-9_]+)/i);
    if (match) version = match[1].replace(/_/g, ".");
  }

  return { os, version };
}

// Deteksi tipe perangkat dari pattern
function detectUAType(ua) {
  for (const p of patterns) {
    if (p.regex.test(ua)) return p.type;
  }
  return "Unknown";
}

// Fungsi untuk memeriksa apakah request datang dari bot
function isBot(ua) {
  return /bot|crawl|spider|slurp|google|bing|yandex/i.test(ua);
}

// Deteksi device dengan optimasi dan pengecekan bot
function detectDevice(req, _res, next) {
  const rawUA = req.headers["user-agent"] || "";

  // Langsung cek apakah request dari bot
  if (isBot(rawUA)) {
    req.deviceInfo = {
      bot: true,
      ip: req.ip || req.socket?.remoteAddress || "Unknown",
      sourceType: "Bot",
      rawUA,
    };
    return next();
  }

  const parser = new UAParser(rawUA);
  const parsed = parser.getResult();

  const fallback = fallbackUAParser(rawUA);

  // Kumpulkan informasi perangkat
  req.deviceInfo = {
    browser: parsed.browser.name || "Unknown",
    os: parsed.os.name || fallback.os,
    osVersion: parsed.os.version || fallback.version,
    device: parsed.device.type || "Unknown",
    ip: req.ip || req.socket?.remoteAddress || "Unknown",
    sourceType: detectUAType(rawUA),
    rawUA,
    isMobile: /Android|iPhone|iPad/i.test(rawUA),
    customBrowser: parsed.browser.name == undefined ? true : false,
    bot: false, // Indikasi apakah itu bot, default false
  };

  next();
}

module.exports = { detectDevice };
