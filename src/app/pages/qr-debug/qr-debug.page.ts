import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CapacitorHttp } from '@capacitor/core';

@Component({
  selector: 'app-qr-debug',
  templateUrl: './qr-debug.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class QrDebugPage {
  testUrl = 'http://camp.local:3000';
  syncCode = '';
  campId = 'default-camp';
  results: string[] = [];

  constructor() {}

  addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.results.push(`[${timestamp}] ${message}`);
    console.log(message);
  }

  async testHealthEndpoint() {
    this.results = [];
    this.addLog(`Testing: ${this.testUrl}/api/members/health`);

    try {
      const response = await CapacitorHttp.get({
        url: `${this.testUrl}/api/members/health`,
        headers: { 'Content-Type': 'application/json' },
      });

      this.addLog(`✅ Health check: ${response.status}`);
      this.addLog(`Response: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      this.addLog(`❌ Health check failed: ${error.message}`);
    }
  }

  async testExchangeEndpoint() {
    this.results = [];
    this.addLog(`Testing exchange at: ${this.testUrl}/api/auth/camp/exchange`);
    this.addLog(`Sync Code: ${this.syncCode}`);
    this.addLog(`Camp ID: ${this.campId}`);

    try {
      const response = await CapacitorHttp.post({
        url: `${this.testUrl}/api/auth/camp/exchange`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          syncCode: this.syncCode,
          campId: this.campId,
        },
      });

      this.addLog(`✅ Exchange response: ${response.status}`);
      this.addLog(`Response: ${JSON.stringify(response.data)}`);

      if (response.data && response.data.syncToken) {
        this.addLog(`🎉 Got sync token: ${response.data.syncToken.substring(0, 20)}...`);
      }
    } catch (error: any) {
      this.addLog(`❌ Exchange failed: ${error.message}`);
      this.addLog(`Error details: ${JSON.stringify(error)}`);
    }
  }

  async generateFreshCode() {
    this.results = [];
    this.addLog(`Generating fresh sync code...`);

    try {
      const response = await CapacitorHttp.post({
        url: `${this.testUrl}/api/auth/camp/generate-qr`,
        headers: { 'Content-Type': 'application/json' },
        data: {},
      });

      this.addLog(`✅ QR generated: ${response.status}`);

      // Backend returns: { success: true, payload: { syncCode, campId, ... } }
      if (response.data && response.data.payload && response.data.payload.syncCode) {
        this.syncCode = response.data.payload.syncCode;
        this.campId = response.data.payload.campId;
        this.addLog(`📋 New sync code: ${this.syncCode}`);
        this.addLog(`📋 Camp ID: ${this.campId}`);
        this.addLog(`QR Payload: ${JSON.stringify(response.data.payload, null, 2)}`);
      } else {
        this.addLog(`⚠️ No syncCode in response`);
        this.addLog(`Full response: ${JSON.stringify(response, null, 2)}`);
      }
    } catch (error: any) {
      this.addLog(`❌ Generate failed: ${error.message}`);
    }
  }

  clearResults() {
    this.results = [];
  }
}
