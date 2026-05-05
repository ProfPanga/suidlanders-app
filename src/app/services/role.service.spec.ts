import { TestBed } from '@angular/core/testing';
import { RoleService, UserRole } from './role.service';

describe('RoleService', () => {
  let service: RoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    // Clear localStorage before each test to ensure clean state
    localStorage.clear();
    service = TestBed.inject(RoleService);
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization and Default Role', () => {
    it('should default to Member role on first use', () => {
      expect(service.getCurrentRole()).toBe(UserRole.MEMBER);
    });

    it('should load role from localStorage on init', () => {
      // Setup: Save role to localStorage before service creation
      localStorage.setItem('demo_current_role', 'reception');

      // Create new service instance
      const newService = new RoleService();

      expect(newService.getCurrentRole()).toBe(UserRole.RECEPTION_STAFF);
    });
  });

  describe('Role Management', () => {
    it('should set and get current role', () => {
      service.setRole(UserRole.RECEPTION_STAFF);
      expect(service.getCurrentRole()).toBe(UserRole.RECEPTION_STAFF);
    });

    it('should persist role to localStorage when set', () => {
      service.setRole(UserRole.RECEPTION_STAFF);
      const saved = localStorage.getItem('demo_current_role');
      expect(saved).toBe('reception');
    });

    it('should update role from Member to Reception Staff', () => {
      expect(service.getCurrentRole()).toBe(UserRole.MEMBER);
      service.setRole(UserRole.RECEPTION_STAFF);
      expect(service.getCurrentRole()).toBe(UserRole.RECEPTION_STAFF);
    });

    it('should update role from Reception Staff to Member', () => {
      service.setRole(UserRole.RECEPTION_STAFF);
      service.setRole(UserRole.MEMBER);
      expect(service.getCurrentRole()).toBe(UserRole.MEMBER);
    });
  });

  describe('Role Checking Methods', () => {
    it('should correctly check if user is member', () => {
      service.setRole(UserRole.MEMBER);
      expect(service.isMember()).toBe(true);
      expect(service.isReceptionStaff()).toBe(false);
    });

    it('should correctly check if user is reception staff', () => {
      service.setRole(UserRole.RECEPTION_STAFF);
      expect(service.isReceptionStaff()).toBe(true);
      expect(service.isMember()).toBe(false);
    });

    it('should return correct result from isRole method', () => {
      service.setRole(UserRole.MEMBER);
      expect(service.isRole(UserRole.MEMBER)).toBe(true);
      expect(service.isRole(UserRole.RECEPTION_STAFF)).toBe(false);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to member role', () => {
      service.setRole(UserRole.RECEPTION_STAFF);
      expect(service.getCurrentRole()).toBe(UserRole.RECEPTION_STAFF);

      service.resetToMember();
      expect(service.getCurrentRole()).toBe(UserRole.MEMBER);
    });

    it('should persist reset to localStorage', () => {
      service.setRole(UserRole.RECEPTION_STAFF);
      service.resetToMember();

      const saved = localStorage.getItem('demo_current_role');
      expect(saved).toBe('member');
    });
  });

  describe('Observable Behavior', () => {
    it('should emit role changes via Observable', (done) => {
      // Skip initial emission (default MEMBER role)
      let emissionCount = 0;

      service.currentRole$.subscribe(role => {
        emissionCount++;

        if (emissionCount === 1) {
          // First emission: initial MEMBER role
          expect(role).toBe(UserRole.MEMBER);
        } else if (emissionCount === 2) {
          // Second emission: changed to RECEPTION_STAFF
          expect(role).toBe(UserRole.RECEPTION_STAFF);
          done();
        }
      });

      // Trigger role change
      service.setRole(UserRole.RECEPTION_STAFF);
    });

    it('should emit current role immediately on subscription', (done) => {
      service.setRole(UserRole.RECEPTION_STAFF);

      // New subscription should receive current value immediately
      service.currentRole$.subscribe(role => {
        expect(role).toBe(UserRole.RECEPTION_STAFF);
        done();
      });
    });
  });

  describe('Persistence Across Instances', () => {
    it('should persist role across service instances', () => {
      // Set role in first instance
      service.setRole(UserRole.RECEPTION_STAFF);

      // Create new instance (simulates app restart)
      const newService = new RoleService();

      expect(newService.getCurrentRole()).toBe(UserRole.RECEPTION_STAFF);
    });

    it('should maintain role consistency between localStorage and service state', () => {
      service.setRole(UserRole.RECEPTION_STAFF);

      const localStorageValue = localStorage.getItem('demo_current_role');
      const serviceValue = service.getCurrentRole();

      expect(localStorageValue).toBe(serviceValue);
    });
  });
});
