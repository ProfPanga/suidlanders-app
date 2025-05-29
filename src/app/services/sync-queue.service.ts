import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SyncQueueItem {
  type: 'create' | 'update' | 'delete';
  table: string;
  recordId: string;
  data?: any;
  timestamp?: number;
  retryCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SyncQueueService {
  private readonly SYNC_QUEUE_KEY = 'sync_queue';
  private pendingChanges = new BehaviorSubject<number>(0);

  constructor() {
    this.loadQueue().then(queue => {
      this.pendingChanges.next(queue.length);
    });
  }

  getPendingChangesCount(): Observable<number> {
    return this.pendingChanges.asObservable();
  }

  async queueChange(change: SyncQueueItem): Promise<void> {
    const queue = await this.getQueue();
    queue.push({
      ...change,
      timestamp: Date.now(),
      retryCount: 0
    });
    await this.saveQueue(queue);
    this.pendingChanges.next(queue.length);
  }

  async getQueue(): Promise<SyncQueueItem[]> {
    return this.loadQueue();
  }

  async clearQueue(): Promise<void> {
    await this.saveQueue([]);
    this.pendingChanges.next(0);
  }

  private async loadQueue(): Promise<SyncQueueItem[]> {
    const queueData = localStorage.getItem(this.SYNC_QUEUE_KEY);
    return queueData ? JSON.parse(queueData) : [];
  }

  private async saveQueue(queue: SyncQueueItem[]): Promise<void> {
    localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
  }
} 