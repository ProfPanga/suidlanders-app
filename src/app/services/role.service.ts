import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * User role enumeration for demo role switching
 * Used to toggle between member and staff UI experiences
 */
export enum UserRole {
  MEMBER = 'member',
  RECEPTION_STAFF = 'reception'
}

/**
 * RoleService manages the current user role for demo purposes
 *
 * This is a DEMO FEATURE designed for March 6th presentation.
 * The full production RBAC system will be implemented in Epic 3.
 *
 * Responsibilities:
 * - Manage current role state using reactive BehaviorSubject
 * - Persist role to localStorage for app restart persistence
 * - Provide role checking methods for component conditionals
 *
 * Design Pattern:
 * - Singleton service (providedIn: 'root')
 * - BehaviorSubject for reactive role changes
 * - localStorage for persistence across restarts
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly STORAGE_KEY = 'demo_current_role';
  private currentRoleSubject: BehaviorSubject<UserRole>;
  public currentRole$: Observable<UserRole>;

  constructor() {
    // Load role from localStorage or default to Member
    const savedRole = localStorage.getItem(this.STORAGE_KEY) as UserRole;
    const initialRole = savedRole || UserRole.MEMBER;

    this.currentRoleSubject = new BehaviorSubject<UserRole>(initialRole);
    this.currentRole$ = this.currentRoleSubject.asObservable();
  }

  /**
   * Get current role synchronously
   * @returns Current UserRole
   */
  getCurrentRole(): UserRole {
    return this.currentRoleSubject.value;
  }

  /**
   * Set current role and persist to localStorage
   * Emits new role value to all subscribers
   * @param role - New role to set
   */
  setRole(role: UserRole): void {
    this.currentRoleSubject.next(role);
    localStorage.setItem(this.STORAGE_KEY, role);
  }

  /**
   * Check if current role matches given role
   * @param role - Role to check against
   * @returns True if current role matches
   */
  isRole(role: UserRole): boolean {
    return this.getCurrentRole() === role;
  }

  /**
   * Check if current user is a member
   * Helper method for readable template conditionals
   * @returns True if current role is MEMBER
   */
  isMember(): boolean {
    return this.isRole(UserRole.MEMBER);
  }

  /**
   * Check if current user is reception staff
   * Helper method for readable template conditionals
   * @returns True if current role is RECEPTION_STAFF
   */
  isReceptionStaff(): boolean {
    return this.isRole(UserRole.RECEPTION_STAFF);
  }

  /**
   * Reset to default member role
   * Useful for debugging or demo reset scenarios
   */
  resetToMember(): void {
    this.setRole(UserRole.MEMBER);
  }
}
