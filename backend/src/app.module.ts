import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { MembersController } from './controllers/members.controller';
import { MembersService } from './services/members.service';
import { TriageService } from './services/triage.service';

/**
 * App Module - Root module for Suidlanders Backend API
 *
 * Configuration:
 * - SQLite database (camp.db file)
 * - TypeORM for database access
 * - Auto-sync schema in development
 */
@Module({
  imports: [
    // TypeORM with SQLite
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/camp.db', // SQLite file location
      entities: [Member],
      synchronize: true, // Auto-create tables in development
      logging: false, // Set to true for SQL query logging
    }),
    // Register Member entity for injection
    TypeOrmModule.forFeature([Member]),
  ],
  controllers: [MembersController],
  providers: [MembersService, TriageService],
})
export class AppModule {}
