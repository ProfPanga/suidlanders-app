import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, peopleOutline, logInOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { RoleService, UserRole } from '../../services/role.service';
import { AuthService, AuthUser } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonButton,
    IonText,
    HeaderComponent,
  ],
})
export class SettingsPage implements OnInit, OnDestroy {
  readonly UserRole = UserRole;
  currentRole: string = UserRole.MEMBER;
  isDemoMode = environment.demoMode;
  provisioning = false;
  deviceMessage = '';
  deviceError = false;
  private roleSubscription?: Subscription;

  constructor(
    private readonly roleService: RoleService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
    addIcons({ personOutline, peopleOutline, logInOutline });
  }

  get isAdmin(): boolean {
    return this.auth.getRole() === UserRole.ADMIN;
  }

  get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  get currentUser(): AuthUser | null {
    return this.auth.getUser();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }

  provisionReceptionDevice() {
    if (this.provisioning) return;
    this.provisioning = true;
    this.deviceMessage = '';
    this.deviceError = false;
    this.auth.provisionReceptionDevice().subscribe({
      next: () => {
        this.provisioning = false;
        this.router.navigate(['/reception']);
      },
      error: () => {
        this.provisioning = false;
        this.deviceError = true;
        this.deviceMessage = 'Kon nie die toestel opstel nie. Probeer weer.';
      },
    });
  }

  ngOnInit() {
    this.roleSubscription = this.roleService.currentRole$.subscribe(role => {
      this.currentRole = role;
    });
  }

  ngOnDestroy() {
    this.roleSubscription?.unsubscribe();
  }

  startJourney(role: UserRole) {
    this.roleService.setRole(role);
    const destinations: Record<UserRole, string> = {
      [UserRole.MEMBER]:          '/home',
      [UserRole.RECEPTION_STAFF]: '/reception',
      [UserRole.MEDICAL_STAFF]:   '/member-form/medicalStaff',
      [UserRole.SECURITY_STAFF]:  '/member-form/securityStaff',
      [UserRole.ADMIN]:           '/reception',
    };
    this.router.navigate([destinations[role]]);
  }
}
