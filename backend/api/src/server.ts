import app from "./app";
import env from "../config/env";
import prisma from "../config/database";

const server = app.listen(env.PORT, () => {
  console.log("======================================");
  console.log("🚀 LabCore ELIS Backend Started");
  console.log(`📍 Port : ${env.PORT}`);
  console.log(`🌍 Mode : ${env.NODE_ENV}`);
  console.log(`🔗 URL  : http://localhost:${env.PORT}`);
  console.log("======================================");
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down...`);

  await prisma.$disconnect();

  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));