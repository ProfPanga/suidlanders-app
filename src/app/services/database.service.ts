import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { SuidlandersDB } from './indexed-db.service';
import { SyncQueueService, SyncQueueItem } from './sync-queue.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private indexedDB: SuidlandersDB;
  private dbReady = new BehaviorSubject<boolean>(false);
  private encryptionKey = 'your-secret-key'; // In production, this should be securely stored
  private useIndexedDB = false;
  private currentVersion = 2; // Increment version for new schema

  constructor(
    private platform: Platform,
    private syncQueueService: SyncQueueService
  ) {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.indexedDB = new SuidlandersDB();
    
    this.platform.ready().then(() => {
      if (this.platform.is('desktop') || this.platform.is('mobileweb')) {
        this.useIndexedDB = true;
        this.initializeIndexedDB();
      } else {
        this.initializeDatabase();
      }
    });
  }

  private async initializeIndexedDB() {
    try {
      await this.indexedDB.open();
      
      // Check if we need to migrate from localStorage
      const oldData = localStorage.getItem('suidlanders_entries');
      if (oldData) {
        const entries = JSON.parse(oldData);
        for (const entryId of Object.keys(entries)) {
          const decryptedData = this.decrypt(entries[entryId]);
          await this.indexedDB.createMember(decryptedData);
        }
        // Clear localStorage after successful migration
        localStorage.removeItem('suidlanders_entries');
      }
      
      this.dbReady.next(true);
    } catch (error) {
      console.error('IndexedDB initialization error:', error);
      throw error;
    }
  }

  private async initializeDatabase() {
    try {
      await this.platform.ready();

      const db = await this.sqlite.createConnection(
        'suidlanders',
        false,
        'no-encryption',
        this.currentVersion,
        false
      );

      await db.open();
      this.db = db;

      // Check and handle migrations
      await this.handleMigrations();
      
      // Create tables
      await this.createTables();

      this.dbReady.next(true);
    } catch (error) {
      console.error('Database initialization error:', error);
      // If SQLite fails, try IndexedDB as fallback
      this.useIndexedDB = true;
      await this.initializeIndexedDB();
    }
  }

  private async handleMigrations() {
    try {
      // Check current database version
      const result = await this.db.query('PRAGMA user_version;');
      const currentVersion = result.values?.[0]?.user_version || 1;

      if (currentVersion < this.currentVersion) {
        // Backup existing data
        const oldEntries = await this.getAllEntries();
        
        // Migrate data to new schema
        if (oldEntries.length > 0) {
          await this.migrateData(oldEntries);
        }

        // Update database version
        await this.db.execute(`PRAGMA user_version = ${this.currentVersion};`);
      }
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }

  private async migrateData(oldEntries: any[]) {
    try {
      // Start transaction
      await this.db.execute('BEGIN TRANSACTION;');

      for (const entry of oldEntries) {
        // Extract data from old format
        const {
          basicInfo,
          memberInfo,
          addressInfo,
          medicalInfo,
          vehicleInfo,
          skillsInfo,
          equipmentInfo,
          campInfo,
          otherInfo,
          documentsInfo
        } = entry;

        // Create member record first
        const memberId = entry.entryId || this.generateEntryId();
        await this.db.run(
          'INSERT INTO members (id, created_at, updated_at, status, version) VALUES (?, ?, ?, ?, ?)',
          [memberId, Date.now(), Date.now(), 'active', this.currentVersion]
        );

        // Insert into respective tables
        if (basicInfo) {
          await this.db.run(
            'INSERT INTO basic_info (member_id, van, noem_naam, tweede_naam, huistaal, geslag, ouderdom, geboorte_datum, id_nommer, cell_nommer, email, huwelik_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [memberId, basicInfo.van, basicInfo.noemNaam, basicInfo.tweedeNaam, basicInfo.huistaal, basicInfo.geslag, basicInfo.ouderdom, basicInfo.geboorteDatum, basicInfo.idNommer, basicInfo.cellNommer, basicInfo.email, basicInfo.huwelikStatus]
          );
        }

        // Continue with other tables...
        // Similar INSERT statements for other tables
      }

      // Commit transaction
      await this.db.execute('COMMIT;');
    } catch (error) {
      // Rollback on error
      await this.db.execute('ROLLBACK;');
      console.error('Data migration error:', error);
      throw error;
    }
  }

  private async createTables() {
    const tables = [
      // Members table
      `CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        status TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1
      );`,

      // Basic info table
      `CREATE TABLE IF NOT EXISTS basic_info (
        member_id TEXT PRIMARY KEY,
        van TEXT NOT NULL,
        noem_naam TEXT NOT NULL,
        tweede_naam TEXT,
        huistaal TEXT NOT NULL,
        geslag TEXT NOT NULL,
        ouderdom INTEGER NOT NULL,
        geboorte_datum TEXT NOT NULL,
        id_nommer TEXT NOT NULL UNIQUE,
        cell_nommer TEXT NOT NULL,
        email TEXT NOT NULL,
        huwelik_status TEXT NOT NULL,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      );`,

      // Member info table
      `CREATE TABLE IF NOT EXISTS member_info (
        member_id TEXT PRIMARY KEY,
        lid_nommer TEXT UNIQUE,
        reddings_verwysing TEXT,
        bevelstruktuur TEXT,
        radio_roepsein TEXT,
        nood_kontak_naam TEXT NOT NULL,
        nood_kontak_nommer TEXT NOT NULL,
        nood_kontak_verwantskap TEXT NOT NULL,
        wapenlisensie BOOLEAN NOT NULL DEFAULT 0,
        skiet_ervaring TEXT,
        ehbo_kwalifikasie BOOLEAN NOT NULL DEFAULT 0,
        ehbo_vlak TEXT,
        ehbo_verval_datum TEXT,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      );`,

      // Address info table
      `CREATE TABLE IF NOT EXISTS address_info (
        member_id TEXT PRIMARY KEY,
        straat_adres TEXT NOT NULL,
        voorstad TEXT NOT NULL,
        stad TEXT NOT NULL,
        provinsie TEXT NOT NULL,
        pos_kode TEXT NOT NULL,
        gps_lat REAL,
        gps_lng REAL,
        naaste_hospitaal TEXT,
        naaste_polisie TEXT,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      );`,

      // Medical info table
      `CREATE TABLE IF NOT EXISTS medical_info (
        member_id TEXT PRIMARY KEY,
        bloed_groep TEXT NOT NULL,
        chroniese_siektes TEXT,
        medikasie TEXT,
        allergies TEXT,
        mediese_fonds TEXT,
        mediese_fonds_nommer TEXT,
        huis_dokter TEXT,
        huis_dokter_nommer TEXT,
        mediese_notas TEXT,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      );`,

      // Vehicle info table
      `CREATE TABLE IF NOT EXISTS vehicle_info (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        is_primary BOOLEAN NOT NULL,
        fabrikaat TEXT NOT NULL,
        model TEXT NOT NULL,
        jaar INTEGER NOT NULL,
        registrasie_nommer TEXT NOT NULL,
        brandstof_tipe TEXT NOT NULL,
        kilometer_stand INTEGER NOT NULL,
        bande_toestand TEXT,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      );`,

      // Skills info table
      `CREATE TABLE IF NOT EXISTS skills_info (
        member_id TEXT PRIMARY KEY,
        beroep TEXT NOT NULL,
        kwalifikasies TEXT,
        spesialis_vaardighede TEXT,
        tale_kennis TEXT,
        rekenaar_vaardig BOOLEAN NOT NULL DEFAULT 0,
        bestuurslisensie_kode TEXT,
        bestuurslisensie_pdp BOOLEAN NOT NULL DEFAULT 0,
        bestuurslisensie_verval TEXT,
        amateur_radio_lisensie BOOLEAN NOT NULL DEFAULT 0,
        radio_roepsein TEXT,
        radio_toerusting TEXT,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      );`,

      // Equipment info table
      `CREATE TABLE IF NOT EXISTS equipment_info (
        member_id TEXT PRIMARY KEY,
        kommunikasie_radio BOOLEAN NOT NULL DEFAULT 0,
        kommunikasie_satelliet BOOLEAN NOT NULL DEFAULT 0,
        kommunikasie_tweerigtingradio BOOLEAN NOT NULL DEFAULT 0,
        krag_generator BOOLEAN NOT NULL DEFAULT 0,
        krag_sonkrag BOOLEAN NOT NULL DEFAULT 0,
        krag_omvormer BOOLEAN NOT NULL DEFAULT 0,
        water_boorgat BOOLEAN NOT NULL DEFAULT 0,
        water_tenk BOOLEAN NOT NULL DEFAULT 0,
        water_filtrasie BOOLEAN NOT NULL DEFAULT 0,
        verdediging_vuurwapens BOOLEAN NOT NULL DEFAULT 0,
        verdediging_lisensies BOOLEAN NOT NULL DEFAULT 0,
        verdediging_opleiding BOOLEAN NOT NULL DEFAULT 0,
        kampering_tent BOOLEAN NOT NULL DEFAULT 0,
        kampering_slaapsak BOOLEAN NOT NULL DEFAULT 0,
        kampering_toerusting BOOLEAN NOT NULL DEFAULT 0,
        noodvoorraad_kos INTEGER,
        noodvoorraad_water INTEGER,
        noodvoorraad_brandstof INTEGER,
        noodvoorraad_medies BOOLEAN NOT NULL DEFAULT 0,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      );`,

      // Camp info table
      `CREATE TABLE IF NOT EXISTS camp_info (
        member_id TEXT PRIMARY KEY,
        kamp_provinsie TEXT NOT NULL,
        kamp_naam TEXT NOT NULL,
        datum_in_kamp TEXT NOT NULL,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      );`,

      // Other info table
      `CREATE TABLE IF NOT EXISTS other_info (
        member_id TEXT PRIMARY KEY,
        addisionele_notas TEXT,
        spesiale_vaardighede TEXT,
        belangstellings TEXT,
        beskikbaarheid TEXT,
        vrywilliger_werk TEXT,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      );`,

      // Documents table
      `CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        type TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        uploaded_at INTEGER NOT NULL,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      );`,

      // Create indexes
      `CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);`,
      `CREATE INDEX IF NOT EXISTS idx_documents_member_type ON documents(member_id, type);`,
      `CREATE INDEX IF NOT EXISTS idx_vehicle_member ON vehicle_info(member_id);`
    ];

    for (const table of tables) {
      await this.db.execute(table);
    }
  }

  // Save entry with sync
  async saveEntry(entry: any): Promise<void> {
    try {
      await this.waitForDatabase();

      if (this.useIndexedDB) {
        if (!entry.entryId) {
          entry.entryId = this.generateEntryId();
        }
        await this.indexedDB.createMember(entry);
        
        // Queue for sync
        await this.queueForSync({
          type: entry.entryId ? 'update' : 'create',
          table: 'members',
          recordId: entry.entryId,
          data: entry
        });
      } else {
        await this.db.execute('BEGIN TRANSACTION;');

        try {
          const memberId = entry.entryId || this.generateEntryId();
          
          await this.db.run(
            'INSERT OR REPLACE INTO members (id, created_at, updated_at, status, version) VALUES (?, ?, ?, ?, ?)',
            [memberId, Date.now(), Date.now(), 'active', this.currentVersion]
          );

          if (entry.basicInfo) {
            await this.saveBasicInfo(memberId, entry.basicInfo);
          }
          if (entry.memberInfo) {
            await this.saveMemberInfo(memberId, entry.memberInfo);
          }
          // ... similar for other sections

          await this.db.execute('COMMIT;');

          // Queue for sync
          await this.queueForSync({
            type: entry.entryId ? 'update' : 'create',
            table: 'members',
            recordId: memberId,
            data: entry
          });
        } catch (error) {
          await this.db.execute('ROLLBACK;');
          throw error;
        }
      }
    } catch (error) {
      console.error('Save entry error:', error);
      throw error;
    }
  }

  // Get all entries
  async getAllEntries(): Promise<any[]> {
    try {
      await this.waitForDatabase();

      if (this.useIndexedDB) {
        return this.indexedDB.getAllMembers();
      } else {
        const members = await this.db.query(
          'SELECT * FROM members WHERE status != "deleted" ORDER BY created_at DESC'
        );
        
        const entries = [];
        for (const member of members.values || []) {
          const entry = await this.reconstructEntry(member.id);
          entries.push(entry);
        }
        
        return entries;
      }
    } catch (error) {
      console.error('Get entries error:', error);
      return [];
    }
  }

  // Delete entry with sync
  async deleteEntry(id: string): Promise<void> {
    try {
      await this.waitForDatabase();

      if (this.useIndexedDB) {
        await this.indexedDB.deleteMember(id);
      } else {
        await this.db.run(
          'UPDATE members SET status = "deleted", updated_at = ? WHERE id = ?',
          [Date.now(), id]
        );
      }

      // Queue for sync
      await this.queueForSync({
        type: 'delete',
        table: 'members',
        recordId: id
      });
    } catch (error) {
      console.error('Delete entry error:', error);
      throw error;
    }
  }

  // Test database access
  async testDatabaseAccess(): Promise<{ success: boolean; message: string }> {
    try {
      await this.waitForDatabase();

      if (this.useIndexedDB) {
        await this.indexedDB.members.count();
        return { 
          success: true, 
          message: 'Successfully accessed IndexedDB database' 
        };
      } else {
        await this.db.execute('SELECT 1');
        const version = await this.db.query('PRAGMA user_version;');
        return { 
          success: true, 
          message: `Successfully accessed SQLite database. Version: ${version.values?.[0]?.user_version || 'unknown'}` 
        };
      }
    } catch (error: any) {
      console.error('Database access test error:', error);
      return {
        success: false,
        message: `Failed to access database: ${error.message}`
      };
    }
  }

  // Keep existing utility methods
  private encrypt(data: any): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
  }

  private decrypt(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  private generateEntryId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `ID${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  getDatabaseState(): Observable<boolean> {
    return this.dbReady.asObservable();
  }

  private async waitForDatabase(): Promise<void> {
    if (!this.dbReady.getValue()) {
      await new Promise<void>((resolve) => {
        const subscription = this.dbReady.subscribe((ready) => {
          if (ready) {
            subscription.unsubscribe();
            resolve();
          }
        });
      });
    }
  }

  // Keep existing table creation and migration methods
  private async saveBasicInfo(memberId: string, basicInfo: any) {
    const query = `
      INSERT OR REPLACE INTO basic_info (
        member_id, van, noem_naam, tweede_naam, huistaal, 
        geslag, ouderdom, geboorte_datum, id_nommer, 
        cell_nommer, email, huwelik_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.db.run(query, [
      memberId,
      basicInfo.van,
      basicInfo.noemNaam,
      basicInfo.tweedeNaam,
      basicInfo.huistaal,
      basicInfo.geslag,
      basicInfo.ouderdom,
      basicInfo.geboorteDatum,
      basicInfo.idNommer,
      basicInfo.cellNommer,
      basicInfo.email,
      basicInfo.huwelikStatus
    ]);
  }

  private async saveMemberInfo(memberId: string, memberInfo: any) {
    const query = `
      INSERT OR REPLACE INTO member_info (
        member_id, lid_nommer, reddings_verwysing, bevelstruktuur,
        radio_roepsein, nood_kontak_naam, nood_kontak_nommer,
        nood_kontak_verwantskap, wapenlisensie, skiet_ervaring,
        ehbo_kwalifikasie, ehbo_vlak, ehbo_verval_datum
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.db.run(query, [
      memberId,
      memberInfo.lidNommer,
      memberInfo.reddingsVerwysing,
      memberInfo.bevelstruktuur,
      memberInfo.radioRoepsein,
      memberInfo.noodKontakNaam,
      memberInfo.noodKontakNommer,
      memberInfo.noodKontakVerwantskap,
      memberInfo.wapenlisensie ? 1 : 0,
      memberInfo.skietErvaring,
      memberInfo.ehboKwalifikasie ? 1 : 0,
      memberInfo.ehboVlak,
      memberInfo.ehboVervalDatum
    ]);
  }

  private async reconstructEntry(memberId: string): Promise<any> {
    const entry: any = { entryId: memberId };

    // Get basic info
    const basicInfoResult = await this.db.query('SELECT * FROM basic_info WHERE member_id = ?', [memberId]);
    if (basicInfoResult.values?.length) {
      entry.basicInfo = basicInfoResult.values[0];
    }

    // Get member info
    const memberInfoResult = await this.db.query('SELECT * FROM member_info WHERE member_id = ?', [memberId]);
    if (memberInfoResult.values?.length) {
      entry.memberInfo = memberInfoResult.values[0];
    }

    // ... similar for other sections

    return entry;
  }

  // Queue changes for sync
  private async queueForSync(change: SyncQueueItem): Promise<void> {
    await this.syncQueueService.queueChange(change);
  }

  // Apply changes from server
  async applyServerChanges(changes: any[]): Promise<void> {
    for (const change of changes) {
      try {
        switch (change.type) {
          case 'create':
          case 'update':
            if (this.useIndexedDB) {
              await this.indexedDB.createMember(change.data);
            } else {
              // Apply changes to SQLite database
              await this.applyChangeToSQLite(change);
            }
            break;
          case 'delete':
            if (this.useIndexedDB) {
              await this.indexedDB.deleteMember(change.recordId);
            } else {
              await this.db.run('DELETE FROM members WHERE id = ?', [change.recordId]);
            }
            break;
        }
      } catch (error) {
        console.error(`Failed to apply server change: ${error}`);
        throw error;
      }
    }
  }

  private async applyChangeToSQLite(change: any): Promise<void> {
    // Start transaction
    await this.db.execute('BEGIN TRANSACTION;');
    try {
      const { recordId, data } = change;
      
      // Update or create member record
      await this.db.run(
        'INSERT OR REPLACE INTO members (id, created_at, updated_at, status, version) VALUES (?, ?, ?, ?, ?)',
        [recordId, data.created_at || Date.now(), Date.now(), data.status || 'active', this.currentVersion]
      );

      // Update related tables
      if (data.basicInfo) {
        await this.saveBasicInfo(recordId, data.basicInfo);
      }
      if (data.memberInfo) {
        await this.saveMemberInfo(recordId, data.memberInfo);
      }
      // ... handle other tables ...

      await this.db.execute('COMMIT;');
    } catch (error) {
      await this.db.execute('ROLLBACK;');
      throw error;
    }
  }
} 