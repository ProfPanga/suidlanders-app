import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * Account Entity - A credential-based login for the app.
 *
 * One table serves every type of login; the `role` column distinguishes them:
 *  - 'member'   — optional account a member creates for device recovery (secret = ID number)
 *  - 'medical'  — medical staff (secret = chosen password)
 *  - 'security' — security staff (secret = chosen password)
 *  - 'admin'    — administrator (secret = chosen password)
 *
 * NOTE: 'reception' is NOT stored here — reception uses a Pi-provisioned device
 * token (no human login). See AuthService.issueDeviceToken().
 *
 * The credential secret is always bcrypt-hashed into `passwordHash`, never stored
 * in plaintext. For members the hashed value is currently the ID number; this can
 * be swapped for a chosen PIN later without any schema change.
 */
@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  role: string; // 'member' | 'medical' | 'security' | 'admin'

  @Column({ nullable: true })
  displayName: string;

  // Links a 'member' account back to its Member intake record (members.id).
  @Column({ nullable: true })
  memberId: string;

  @CreateDateColumn()
  createdAt: Date;
}
