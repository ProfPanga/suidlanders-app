import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CapacitorHttp } from '@capacitor/core';
import { QRPayload, ProvisioningResult } from '../models/qr-payload.model';
import { AuthService } from './auth.service';
import { SyncService } from './sync.service';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class QRProvisioningService {
  private readonly URL_TEST_TIMEOUT = 10000; // 10 seconds per URL

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private syncService: SyncService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  /**
   * Main orchestration method for QR provisioning
   * 1. Tests server URLs sequentially
   * 2. Exchanges sync code for token
   * 3. Saves credentials to AuthService
   * 4. Triggers sync
   * 5. Clears credentials after sync
   *
   * @param payload QR code payload
   * @returns Provisioning result
   */
  async scanAndProvision(payload: QRPayload): Promise<ProvisioningResult> {
    console.log('🚀 scanAndProvision called with payload:', payload);
    alert('Starting provisioning...'); // DEBUG

    let loading: HTMLIonLoadingElement | null = null;

    try {
      // Show loading indicator (optional - don't block if it fails)
      alert('About to create loading indicator...'); // DEBUG
      console.log('⏳ Creating loading indicator...');
      try {
        loading = await Promise.race([
          this.loadingController.create({
            message: 'Verbind met kamp bediener...',
          }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
        ]);
        if (loading) {
          await loading.present();
          alert('Loading indicator shown!'); // DEBUG
        } else {
          alert('Loading indicator timed out, continuing...'); // DEBUG
        }
      } catch (loadingError) {
        console.warn('Loading indicator failed, continuing without it:', loadingError);
        alert('Loading indicator failed, continuing...'); // DEBUG
      }

      // Step 1: Test server URLs to find working one
      console.log('🔍 Testing server URLs:', payload.serverUrls);
      alert(`Testing URLs: ${payload.serverUrls.join(', ')}`); // DEBUG
      const workingUrl = await this.testServerURLs(payload.serverUrls);
      console.log('📡 Working URL:', workingUrl);

      if (!workingUrl) {
        console.log('❌ No working URL found');
        alert('No server URLs reachable!'); // DEBUG
        if (loading) await loading.dismiss();
        await this.showError(
          'Kon nie kamp bediener bereik nie. Maak seker jy is gekoppel aan kamp WiFi.'
        );
        return {
          success: false,
          error: 'All server URLs unreachable',
        };
      }

      console.log('✅ Found working URL:', workingUrl);
      alert(`Connected to: ${workingUrl}`); // DEBUG

      // Update loading message (skip if loading controller not available)
      if (loading) {
        await loading.dismiss();
        try {
          loading = await this.loadingController.create({
            message: 'Ruil sinkronisasie kode...',
          });
          await loading.present();
        } catch {
          loading = null; // Continue without loading indicator
        }
      }

      // Step 2: Exchange sync code for token
      const syncToken = await this.exchangeSyncCode(
        workingUrl,
        payload.syncCode,
        payload.campId
      );

      if (!syncToken) {
        if (loading) await loading.dismiss();
        await this.showError(
          'Sinkronisasie kode is ongeldig of verval. Vra kamp personeel vir nuwe QR.'
        );
        return {
          success: false,
          error: 'Sync code exchange failed',
        };
      }

      // Step 3: Save credentials to AuthService
      this.authService.setCampBaseUrl(workingUrl);
      this.authService.setSyncToken(syncToken);

      // Update loading message (skip if loading controller not available)
      if (loading) {
        await loading.dismiss();
        try {
          loading = await this.loadingController.create({
            message: 'Sinkroniseer data...',
          });
          await loading.present();
        } catch {
          loading = null; // Continue without loading indicator
        }
      }

      // Step 4: Trigger sync
      const syncResult = await firstValueFrom(this.syncService.sync());

      if (loading) await loading.dismiss();

      if (syncResult.success) {
        // Step 5: Clear credentials after successful sync
        this.authService.setSyncToken(null);
        // Note: Keep base URL for subsequent syncs

        await this.showSuccess('Sinkronisasie suksesvol voltooi');

        return {
          success: true,
          baseUrl: workingUrl,
          campId: payload.campId,
        };
      } else {
        await this.showError(
          'Sinkronisasie het misluk. Probeer asseblief weer.'
        );
        return {
          success: false,
          error: syncResult.message,
        };
      }
    } catch (error: any) {
      alert(`ERROR CAUGHT: ${error.message || error}`); // DEBUG
      console.error('Provisioning failed:', error);
      if (loading) {
        try {
          await loading.dismiss();
        } catch (dismissError) {
          console.error('Error dismissing loading:', dismissError);
        }
      }
      await this.showError(
        'Iets het verkeerd gegaan. Probeer asseblief weer.'
      );
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Test server URLs sequentially until one succeeds
   * Each URL is tested with a timeout to avoid long waits
   *
   * @param urls Array of server URLs to test
   * @returns First working URL or null if all fail
   */
  async testServerURLs(urls: string[]): Promise<string | null> {
    for (const url of urls) {
      console.log(`Testing server URL: ${url}`);

      const isReachable = await this.pingServer(url);

      if (isReachable) {
        console.log(`Connected to: ${url}`);
        return url;
      }

      console.log(`Failed to reach ${url}, trying next...`);
    }

    console.error('All server URLs failed');
    return null;
  }

  /**
   * Ping a server URL to check if it's reachable
   * Uses /api/members/health endpoint with timeout
   *
   * @param url Server base URL
   * @returns True if server responds successfully
   */
  private async pingServer(url: string): Promise<boolean> {
    const startTime = Date.now(); // Declare outside try-catch for access in both blocks

    try {
      alert(`Pinging: ${url}/api/members/health`); // DEBUG

      // Use Capacitor's native HTTP to bypass WebView network security restrictions
      const response = await CapacitorHttp.get({
        url: `${url}/api/members/health`,
        headers: {
          'Content-Type': 'application/json',
        },
        connectTimeout: 30000, // Increased to 30s for debugging
        readTimeout: 30000,
      });

      const duration = Date.now() - startTime;
      alert(`Ping response: ${response.status} in ${duration}ms - ${response.status === 200 ? 'OK' : 'FAILED'}`); // DEBUG
      console.log('Ping response data:', response.data);
      return response.status === 200;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`Request to ${url} failed after ${duration}ms:`, error);
      alert(`Ping ERROR after ${duration}ms: ${JSON.stringify(error)}`); // DEBUG - show full error
      return false;
    }
  }

  /**
   * Exchange sync code for temporary sync token
   * Calls backend POST /api/auth/camp/exchange endpoint
   *
   * @param baseUrl Server base URL
   * @param syncCode Short-lived sync code from QR
   * @param campId Camp identifier
   * @returns Sync token or null if exchange fails
   */
  private async exchangeSyncCode(
    baseUrl: string,
    syncCode: string,
    campId: string
  ): Promise<string | null> {
    try {
      const response = await firstValueFrom(
        this.authService.exchangeCampCodeAt(baseUrl, syncCode, campId)
      );

      if (response && response.syncToken) {
        return response.syncToken;
      }

      console.error('No sync token in response:', response);
      return null;
    } catch (error: any) {
      console.error('Sync code exchange failed:', error);
      return null;
    }
  }

  /**
   * Show success toast notification
   * @param message Success message in Afrikaans
   */
  private async showSuccess(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
  }

  /**
   * Show error toast notification with retry option
   * @param message Error message in Afrikaans
   */
  private async showError(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      color: 'danger',
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
        },
      ],
    });
    await toast.present();
  }
}
