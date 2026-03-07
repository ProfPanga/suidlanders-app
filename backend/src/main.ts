import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Bootstrap the Suidlanders Backend API
 */
async function bootstrap() {
  // Ensure data directory exists for SQLite database
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create NestJS application
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend (Reception Dashboard)
  // Allow all origins for offline camp scenario - devices connect from various IPs on local network
  app.enableCors({
    origin: true, // Allows all origins (safe for offline local network)
    credentials: true,
  });

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT);

  console.log('\n========================================');
  console.log('🚀 Suidlanders Backend API Started');
  console.log('========================================');
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`📊 Database: SQLite (data/camp.db)`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET  http://localhost:${PORT}/api/members`);
  console.log(`  GET  http://localhost:${PORT}/api/members/:id`);
  console.log(`  POST http://localhost:${PORT}/api/members`);
  console.log(`  GET  http://localhost:${PORT}/api/members/health`);
  console.log('========================================');
  console.log('');
  console.log('✅ Story 1.1: Triage logic active');
  console.log('✅ Story 1.2: Reception API ready');
  console.log('');
  console.log('💡 Tip: Use npm run seed to add demo data');
  console.log('');
}

bootstrap();
