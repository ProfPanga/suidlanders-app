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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, peopleOutline, medkitOutline, shieldOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { RoleService, UserRole } from '../../services/role.service';
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
    HeaderComponent,
  ],
})
export class SettingsPage implements OnInit, OnDestroy {
  readonly UserRole = UserRole;
  currentRole: string = UserRole.MEMBER;
  isDemoMode = environment.demoMode;
  private roleSubscription?: Subscription;

  constructor(
    private readonly roleService: RoleService,
    private readonly router: Router
  ) {
    addIcons({ personOutline, peopleOutline, medkitOutline, shieldOutline });
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
    };
    this.router.navigate([destinations[role]]);
  }
}
