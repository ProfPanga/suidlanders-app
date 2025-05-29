import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-data-viewer',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Database Viewer</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-list>
        <ion-item *ngFor="let entry of entries">
          <ion-label>
            <h2>{{ entry.basicInfo?.van }}, {{ entry.basicInfo?.noemNaam }}</h2>
            <p>ID: {{ entry.entryId }}</p>
            <ion-button fill="clear" (click)="toggleDetails(entry)">
              {{ entry.showDetails ? 'Hide Details' : 'Show Details' }}
            </ion-button>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="selectedEntry?.showDetails">
          <ion-label class="ion-text-wrap">
            <pre>{{ selectedEntry | json }}</pre>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="refresh()">
          <ion-icon name="refresh"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DataViewerComponent implements OnInit {
  entries: any[] = [];
  selectedEntry: any = null;

  constructor(private dbService: DatabaseService) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      this.entries = await this.dbService.getAllEntries();
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  }

  toggleDetails(entry: any) {
    if (this.selectedEntry === entry) {
      this.selectedEntry = null;
    } else {
      this.selectedEntry = entry;
    }
    entry.showDetails = !entry.showDetails;
  }

  async refresh(event?: any) {
    await this.loadData();
    if (event) {
      event.target.complete();
    }
  }
} 