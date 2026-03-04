import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Member Entity - Represents a registered Suidlanders member
 * Includes both basic info and medical data for triage logic
 */
@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Information
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  idNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  // Family Information
  @Column({ default: 1 })
  familySize: number;

  // Medical Information (SENSITIVE - excluded from Reception API)
  @Column({ nullable: true })
  bloodType: string;

  @Column({ nullable: true, type: 'text' })
  chronicConditions: string;

  @Column({ nullable: true, type: 'text' })
  medication: string;

  @Column({ nullable: true, type: 'text' })
  allergies: string;

  // Camp Assignment (Result of Triage Logic)
  @Column({ nullable: true })
  campAssignment: string; // 'red' | 'green' | null

  @Column({ nullable: true, type: 'text' })
  triageReason: string; // Why assigned to Red/Green (for medical staff only)

  // Sync Tracking
  @CreateDateColumn()
  syncedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: 'active' })
  status: string;
}
