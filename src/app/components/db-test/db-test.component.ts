import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DatabaseService } from '../../services/database.service';
import { SyncService } from '../../services/sync.service';

@Component({
  selector: 'app-db-test',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Database Test</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Database Status</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-text [color]="dbStatus?.success ? 'success' : 'danger'">
            {{ dbStatus?.message }}
          </ion-text>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Sync Status</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-label>Last Sync:</ion-label>
              <ion-note slot="end">
                {{ syncStatus?.lastSyncTime ? (syncStatus.lastSyncTime | date:'medium') : 'Never' }}
              </ion-note>
            </ion-item>
            <ion-item>
              <ion-label>Pending Changes:</ion-label>
              <ion-badge slot="end" [color]="syncStatus?.pendingChanges ? 'warning' : 'success'">
                {{ syncStatus?.pendingChanges || 0 }}
              </ion-badge>
            </ion-item>
            <ion-item *ngIf="syncStatus?.error">
              <ion-label color="danger">Error:</ion-label>
              <ion-text color="danger" slot="end">{{ syncStatus.error }}</ion-text>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <ion-button expand="block" (click)="testDatabase()" [disabled]="testing">
        Test Database Connection
        <ion-spinner name="dots" *ngIf="testing"></ion-spinner>
      </ion-button>

      <ion-button expand="block" (click)="syncNow()" [disabled]="syncing || testing">
        Sync Now
        <ion-spinner name="dots" *ngIf="syncing"></ion-spinner>
      </ion-button>
    </ion-content>
  `,
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DbTestComponent implements OnInit {
  dbStatus: { success: boolean; message: string } | null = null;
  syncStatus: any = null;
  testing = false;
  syncing = false;

  constructor(
    private dbService: DatabaseService,
    private syncService: SyncService
  ) {}

  ngOnInit() {
    // Subscribe to sync status changes
    this.syncService.getSyncStatus().subscribe(status => {
      this.syncStatus = status;
      this.syncing = status.isSyncing;
    });
  }

  async testDatabase() {
    this.testing = true;
    try {
      this.dbStatus = await this.dbService.testDatabaseAccess();
    } catch (error: any) {
      this.dbStatus = {
        success: false,
        message: error.message
      };
    } finally {
      this.testing = false;
    }
  }

  syncNow() {
    this.syncService.sync().subscribe(
      result => {
        if (!result.success) {
          console.error('Sync failed:', result.message);
        }
      },
      error => {
        console.error('Sync error:', error);
      }
    );
  }
} 