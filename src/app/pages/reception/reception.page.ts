import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonNote,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { refreshOutline, peopleOutline, searchOutline, qrCodeOutline } from 'ionicons/icons';
import { ApiService } from '../../services/api.service';
import { QRService } from '../../services/qr.service';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

/**
 * Safe data transfer object for Reception view
 * Contains only information Reception staff should see
 * Medical data is intentionally excluded for privacy
 */
interface ReceptionMemberView {
  id: string;
  fullName: string;
  familySize: number; // 1 + number of dependents
  campAssignment: 'red' | 'green' | null;
  syncTimestamp?: string; // Last sync time
  // EXCLUDED: All medical data, ID numbers, address, etc.
}

@Component({
  selector: 'app-reception',
  templateUrl: './reception.page.html',
  styleUrls: ['./reception.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonNote,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    CommonModule,
    FormsModule,
  ],
})
export class ReceptionPage implements OnInit, OnDestroy {
  searchTerm: string = '';
  members: ReceptionMemberView[] = [];
  filteredMembers: ReceptionMemberView[] = [];
  campQRCode: string | null = null; // Data URL of generated QR code
  qrPayload: any = null; // QR payload with syncCode, serverUrls, campId
  private refreshInterval: any;
  private persistentErrorToast: HTMLIonToastElement | null = null;

  constructor(
    private apiService: ApiService,
    private qrService: QRService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router,
    private authService: AuthService
  ) {
    // Register icons for use in template
    addIcons({ refreshOutline, peopleOutline, searchOutline, qrCodeOutline });
  }

  async ngOnInit() {
    // Reception dashboard should always use default API URL (localhost in dev)
    // Clear any saved camp base URL from previous QR scans
    this.authService.setCampBaseUrl(null);

    await this.loadMembers();
  }

  /**
   * Start auto-refresh when view is entered
   * Auto-refresh every 30 seconds when dashboard is active
   */
  ionViewWillEnter() {
    this.refreshInterval = setInterval(() => {
      this.loadMembers(); // Silent refresh (no loading indicator)
    }, 30000); // 30 seconds
  }

  /**
   * Clear interval when leaving dashboard to prevent memory leaks
   * Also dismiss persistent error toast
   */
  ionViewWillLeave() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    // Clean up persistent error toast when navigating away
    this.dismissPersistentErrorToast();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    // Clean up persistent error toast on component destruction
    this.dismissPersistentErrorToast();
  }

  /**
   * Load all members from backend API
   * Backend API excludes medical data for privacy
   * @returns Promise<boolean> - true if successful, false if failed
   */
  async loadMembers(): Promise<boolean> {
    try {
      // Fetch all members from backend API using ApiService
      const response = await firstValueFrom(this.apiService.getAllMembers());

      // Backend already excludes medical data, but map to safe DTO for consistency
      this.members = response.map((member: any) =>
        this.mapToReceptionView(member)
      );

      // Reapply current filter (important for auto-refresh with active search)
      this.filterMembers();

      // Dismiss persistent error toast on successful reconnection
      await this.dismissPersistentErrorToast();

      return true; // Success
    } catch (error) {
      console.error('Failed to load members from API:', error);
      await this.showPersistentErrorToast(
        'Kon nie lede laai nie. Geen backend konneksie na.'
      );
      return false; // Failure
    }
  }

  /**
   * Manual refresh with loading indicator
   */
  async refreshMembers() {
    const loading = await this.loadingController.create({
      message: 'Herlaai...',
    });
    await loading.present();

    const success = await this.loadMembers();

    await loading.dismiss();

    // Only show success toast if load succeeded
    if (success) {
      await this.showSuccessToast('Lede is herlaai');
    }
  }

  /**
   * Filter members by search term
   * Case-insensitive search on full name
   */
  filterMembers(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredMembers = [...this.members];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase().trim();
    this.filteredMembers = this.members.filter((member) =>
      member.fullName.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Map backend API response to safe ReceptionMemberView
   * This provides additional safety layer even though backend excludes medical data
   */
  private mapToReceptionView(member: any): ReceptionMemberView {
    return {
      id: member.id,
      fullName: this.getFullName(member),
      familySize: member.familySize || 1,
      campAssignment: member.campAssignment || null,
      syncTimestamp: member.syncedAt,
    };

    // Medical data intentionally NOT included:
    // - Backend excludes entire medicalInfo object
    // - No chronic_conditions, medication, blood_type
    // - No id_number, address, contact details
  }

  /**
   * Get full name from member object
   * Handles missing names gracefully
   */
  private getFullName(member: any): string {
    const firstName = member.firstName || '';
    const lastName = member.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Onbekende Lid';
  }

  /**
   * Get badge color based on camp assignment
   */
  getCampBadgeColor(assignment: 'red' | 'green' | null): string {
    switch (assignment) {
      case 'red':
        return 'danger';
      case 'green':
        return 'success';
      default:
        return 'medium'; // Not yet triaged
    }
  }

  /**
   * Get camp label in Afrikaans
   */
  getCampLabel(assignment: 'red' | 'green' | null): string {
    switch (assignment) {
      case 'red':
        return 'Rooi Kamp';
      case 'green':
        return 'Groen Kamp';
      default:
        return 'Nog nie toegeken nie'; // Not yet assigned
    }
  }

  /**
   * Navigate to member detail view (future enhancement)
   */
  viewMemberDetails(memberId: string): void {
    // Future enhancement: Navigate to member detail page
    // this.router.navigate(['/member-detail', memberId]);
  }

  /**
   * Show success toast message
   */
  private async showSuccessToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
  }

  /**
   * Show persistent error toast message that stays until manually dismissed or backend reconnects
   */
  private async showPersistentErrorToast(message: string): Promise<void> {
    // Dismiss any existing persistent error toast first
    await this.dismissPersistentErrorToast();

    // Create persistent toast (no duration = stays until dismissed)
    this.persistentErrorToast = await this.toastController.create({
      message,
      color: 'danger',
      position: 'bottom',
      buttons: [
        {
          text: 'Probeer weer',
          role: 'cancel',
          handler: () => {
            this.refreshMembers();
          },
        },
      ],
    });
    await this.persistentErrorToast.present();
  }

  /**
   * Dismiss persistent error toast if it exists
   */
  private async dismissPersistentErrorToast(): Promise<void> {
    if (this.persistentErrorToast) {
      await this.persistentErrorToast.dismiss();
      this.persistentErrorToast = null;
    }
  }

  /**
   * Generate camp provisioning QR code
   * Calls backend to generate QR payload, then displays QR code
   */
  async generateQRCode(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Genereer QR kode...',
    });
    await loading.present();

    try {
      // Call backend to generate QR payload
      const response = await firstValueFrom(this.apiService.generateCampQR());

      if (response.success && response.payload) {
        this.qrPayload = response.payload;

        // Generate QR code image from payload
        this.campQRCode = await this.qrService.generateCampProvisioningQR(
          response.payload
        );

        await loading.dismiss();
        await this.showSuccessToast('QR kode gegenereer');
      } else {
        throw new Error('Failed to generate QR payload');
      }
    } catch (error) {
      console.error('QR generation failed:', error);
      await loading.dismiss();
      await this.showErrorToast('Kon nie QR kode genereer nie');
    }
  }

  /**
   * Close QR code display
   */
  closeQRCode(): void {
    this.campQRCode = null;
    this.qrPayload = null;
  }

  /**
   * Show error toast message
   */
  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'bottom',
    });
    await toast.present();
  }
}
