// ---------------------------------------------------------------------------
// index.js — server entry point
// ---------------------------------------------------------------------------
import { env } from "./config/env.js";
import app     from "./app.js";
import prisma  from "./config/db.js";

async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");

    app.listen(env.PORT, () => {
      console.log(`🚀 Khokahano API running on port ${env.PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Frontend:    ${env.FRONTEND_URL}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();