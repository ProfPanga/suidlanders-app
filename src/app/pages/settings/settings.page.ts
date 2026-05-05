import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonNote,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { RoleService, UserRole } from '../../services/role.service';
import { HeaderComponent } from '../../components/header/header.component';
import { environment } from '../../../environments/environment';

/**
 * Settings Page
 *
 * Provides app configuration options including:
 * - Demo role switcher (demo mode only)
 * - Theme preferences (future)
 * - Other app settings (future)
 */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonNote,
    HeaderComponent,
  ],
})
export class SettingsPage implements OnInit, OnDestroy {
  currentRole: string = UserRole.MEMBER;
  isDemoMode = environment.demoMode; // Enable role switcher only in demo mode
  private roleSubscription?: Subscription;

  constructor(
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to role changes to keep UI in sync
    this.roleSubscription = this.roleService.currentRole$.subscribe(role => {
      this.currentRole = role;
    });
  }

  ngOnDestroy() {
    this.roleSubscription?.unsubscribe();
  }

  /**
   * Handle role change from ion-segment
   * Switches role and navigates to appropriate view
   */
  onRoleChange(event: any) {
    const newRole = event.detail.value as UserRole;
    this.roleService.setRole(newRole);

    // Navigate to appropriate home view based on role
    if (newRole === UserRole.MEMBER) {
      this.router.navigate(['/home']); // Member registration page
    } else if (newRole === UserRole.RECEPTION_STAFF) {
      this.router.navigate(['/reception']); // Reception dashboard
    }
  }

  /**
   * Get friendly Afrikaans label for role
   */
  getRoleLabel(role: string): string {
    switch (role) {
      case UserRole.MEMBER:
        return 'Lid';
      case UserRole.RECEPTION_STAFF:
        return 'Ontvangs Personeel';
      default:
        return role;
    }
  }
}
