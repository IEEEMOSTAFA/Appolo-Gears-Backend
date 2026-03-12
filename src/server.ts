



import app from './app';
import config from './config';
import { prisma } from './lib/prisma';

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    const server = app.listen(config.port, () => {
      console.log(`🚀 Server listening on port ${config.port}`);
    });

    // ─── Uncaught Exception (Synchronous Error) ───────────────────────
    // যেমন: console.log(undefinedVariable)
    process.on('uncaughtException', (err: Error) => {
      console.error('💥 Uncaught Exception! Shutting down...');
      console.error(err.name, err.message);
      process.exit(1); // সাথে সাথে বন্ধ, server cleanup দরকার নেই
    });

    // ─── Unhandled Rejection (Async/Promise Error) ────────────────────
    // যেমন: async function-এ try/catch না থাকলে
    process.on('unhandledRejection', async (err: Error) => {
      console.error('💥 Unhandled Rejection! Shutting down...');
      console.error(err.name, err.message);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('🔌 Database disconnected');
        process.exit(1);
      });
    });

    // ─── SIGTERM (External kill signal, e.g. Docker / Cloud stop) ─────
    // যেমন: Kubernetes pod terminate করলে, Railway/Render stop করলে
    process.on('SIGTERM', async () => {
      console.log('📴 SIGTERM received. Shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('🔌 Database disconnected');
        console.log('👋 Process terminated');
        process.exit(0);
      });
    });

    // ─── SIGINT (Ctrl+C in terminal) ──────────────────────────────────
    // যেমন: Development-এ Ctrl+C চাপলে
    process.on('SIGINT', async () => {
      console.log('\n SIGINT received (Ctrl+C). Shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('🔌 Database disconnected');
        console.log('👋 Process terminated');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}


main();
