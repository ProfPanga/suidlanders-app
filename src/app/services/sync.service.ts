import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { DatabaseService } from './database.service';
import { ApiService } from './api.service';
import { SyncQueueService, SyncQueueItem } from './sync-queue.service';

export interface SyncStatus {
  lastSyncTime: number | null;
  isSyncing: boolean;
  pendingChanges: number;
  error: string | null;
}

export interface SyncResult {
  success: boolean;
  message: string;
  syncedRecords?: number;
  errors?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private syncStatus = new BehaviorSubject<SyncStatus>({
    lastSyncTime: null,
    isSyncing: false,
    pendingChanges: 0,
    error: null
  });

  private readonly SYNC_METADATA_KEY = 'sync_metadata';
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private syncInterval: any;

  constructor(
    private apiService: ApiService,
    private syncQueueService: SyncQueueService
  ) {
    this.loadSyncMetadata();
    this.startAutoSync();
    
    // Subscribe to pending changes
    this.syncQueueService.getPendingChangesCount().subscribe(count => {
      this.updateSyncStatus({ pendingChanges: count });
    });
  }

  // Get current sync status as observable
  getSyncStatus(): Observable<SyncStatus> {
    return this.syncStatus.asObservable();
  }

  // Start automatic sync
  private startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncInterval = setInterval(() => {
      this.sync().subscribe();
    }, this.SYNC_INTERVAL);
  }

  // Stop automatic sync
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Manual sync trigger
  sync(): Observable<SyncResult> {
    if (this.syncStatus.value.isSyncing) {
      return of({
        success: false,
        message: 'Sync already in progress'
      });
    }

    this.updateSyncStatus({ isSyncing: true, error: null });

    return from(this.performSync()).pipe(
      tap(result => {
        if (result.success) {
          this.updateSyncStatus({
            lastSyncTime: Date.now(),
            isSyncing: false,
            error: null
          });
        } else {
          this.updateSyncStatus({
            isSyncing: false,
            error: result.message
          });
        }
      }),
      catchError(error => {
        this.updateSyncStatus({
          isSyncing: false,
          error: error.message
        });
        return of({
          success: false,
          message: error.message
        });
      })
    );
  }

  // Queue changes for sync
  async queueChange(change: SyncQueueItem): Promise<void> {
    await this.syncQueueService.queueChange(change);
  }

  // Perform actual sync
  private async performSync(): Promise<SyncResult> {
    try {
      const queue = await this.syncQueueService.getQueue();
      if (queue.length === 0) {
        return {
          success: true,
          message: 'No changes to sync',
          syncedRecords: 0
        };
      }

      // Send local changes to server
      const pushResult = await this.apiService.syncChanges(queue).toPromise();
      
      // Get server changes
      const lastSync = this.syncStatus.value.lastSyncTime || 0;
      const pullResult = await this.apiService.getServerChanges(lastSync).toPromise();
      
      // Clear sync queue after successful sync
      await this.syncQueueService.clearQueue();
      
      return {
        success: true,
        message: 'Sync completed successfully',
        syncedRecords: queue.length + (pullResult.changes?.length || 0)
      };
    } catch (error: any) {
      // Handle specific error cases
      if (error.status === 409) {
        return {
          success: false,
          message: 'Sync conflict detected. Please resolve conflicts manually.',
          errors: [error]
        };
      }

      return {
        success: false,
        message: `Sync failed: ${error.message}`,
        errors: [error]
      };
    }
  }

  // Update sync status
  private updateSyncStatus(update: Partial<SyncStatus>) {
    const currentStatus = this.syncStatus.value;
    const newStatus = { ...currentStatus, ...update };
    this.syncStatus.next(newStatus);
    this.saveSyncMetadata(newStatus);
  }

  // Load sync metadata from storage
  private loadSyncMetadata() {
    const metadata = localStorage.getItem(this.SYNC_METADATA_KEY);
    if (metadata) {
      try {
        const parsed = JSON.parse(metadata);
        this.syncStatus.next(parsed);
      } catch (error) {
        console.error('Failed to parse sync metadata:', error);
      }
    }
  }

  // Save sync metadata to storage
  private saveSyncMetadata(status: SyncStatus) {
    localStorage.setItem(this.SYNC_METADATA_KEY, JSON.stringify(status));
  }
} 