import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReceptionPage } from './reception.page';
import { ApiService } from '../../services/api.service';
import { LoadingController, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('ReceptionPage', () => {
  let component: ReceptionPage;
  let fixture: ComponentFixture<ReceptionPage>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let loadingControllerSpy: jasmine.SpyObj<LoadingController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockMembers = [
    {
      id: '1',
      firstName: 'Pieter',
      lastName: 'van der Merwe',
      familySize: 5,
      campAssignment: 'red',
      syncedAt: '2026-03-01T10:00:00Z',
    },
    {
      id: '2',
      firstName: 'Healthy',
      lastName: 'Family',
      familySize: 3,
      campAssignment: 'green',
      syncedAt: '2026-03-01T10:30:00Z',
    },
    {
      id: '3',
      firstName: 'Not',
      lastName: 'Triaged',
      familySize: 2,
      campAssignment: null,
      syncedAt: '2026-03-01T11:00:00Z',
    },
  ];

  beforeEach(async () => {
    // Create spies for dependencies
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['getAllMembers']);
    loadingControllerSpy = jasmine.createSpyObj('LoadingController', [
      'create',
    ]);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Mock loading controller
    const loadingMock = {
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()),
    };
    loadingControllerSpy.create.and.returnValue(
      Promise.resolve(loadingMock as any)
    );

    // Mock toast controller
    const toastMock = {
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
    };
    toastControllerSpy.create.and.returnValue(
      Promise.resolve(toastMock as any)
    );

    await TestBed.configureTestingModule({
      imports: [ReceptionPage],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: LoadingController, useValue: loadingControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceptionPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load members on initialization', fakeAsync(() => {
      apiServiceSpy.getAllMembers.and.returnValue(of(mockMembers));

      component.ngOnInit();
      tick();

      expect(apiServiceSpy.getAllMembers).toHaveBeenCalled();
      expect(component.members.length).toBe(3);
      expect(component.filteredMembers.length).toBe(3);
    }));

    it('should handle API errors gracefully', fakeAsync(() => {
      apiServiceSpy.getAllMembers.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      component.ngOnInit();
      tick();

      expect(component.members.length).toBe(0);
      expect(toastControllerSpy.create).toHaveBeenCalled();
    }));
  });

  describe('loadMembers', () => {
    it('should map API response to ReceptionMemberView', fakeAsync(() => {
      apiServiceSpy.getAllMembers.and.returnValue(of(mockMembers));

      component.loadMembers();
      tick();

      expect(component.members[0].fullName).toBe('Pieter van der Merwe');
      expect(component.members[0].familySize).toBe(5);
      expect(component.members[0].campAssignment).toBe('red');
    }));

    it('should handle missing first name', fakeAsync(() => {
      const memberWithoutFirstName = {
        ...mockMembers[0],
        firstName: '',
      };
      apiServiceSpy.getAllMembers.and.returnValue(of([memberWithoutFirstName]));

      component.loadMembers();
      tick();

      expect(component.members[0].fullName).toBe('van der Merwe');
    }));

    it('should handle missing last name', fakeAsync(() => {
      const memberWithoutLastName = {
        ...mockMembers[0],
        lastName: '',
      };
      apiServiceSpy.getAllMembers.and.returnValue(of([memberWithoutLastName]));

      component.loadMembers();
      tick();

      expect(component.members[0].fullName).toBe('Pieter');
    }));

    it('should use default name for member with no names', fakeAsync(() => {
      const memberWithoutNames = {
        ...mockMembers[0],
        firstName: '',
        lastName: '',
      };
      apiServiceSpy.getAllMembers.and.returnValue(of([memberWithoutNames]));

      component.loadMembers();
      tick();

      expect(component.members[0].fullName).toBe('Onbekende Lid');
    }));

    it('should default familySize to 1 if not provided', fakeAsync(() => {
      const memberWithoutFamilySize = {
        ...mockMembers[0],
        familySize: undefined,
      };
      apiServiceSpy.getAllMembers.and.returnValue(
        of([memberWithoutFamilySize])
      );

      component.loadMembers();
      tick();

      expect(component.members[0].familySize).toBe(1);
    }));

    it('should handle null campAssignment', fakeAsync(() => {
      apiServiceSpy.getAllMembers.and.returnValue(of([mockMembers[2]]));

      component.loadMembers();
      tick();

      expect(component.members[0].campAssignment).toBe(null);
    }));
  });

  describe('refreshMembers', () => {
    it('should show loading indicator during refresh', fakeAsync(() => {
      apiServiceSpy.getAllMembers.and.returnValue(of(mockMembers));

      component.refreshMembers();
      tick();

      expect(loadingControllerSpy.create).toHaveBeenCalledWith({
        message: 'Herlaai...',
      });
    }));

    it('should show success toast after refresh', fakeAsync(() => {
      apiServiceSpy.getAllMembers.and.returnValue(of(mockMembers));

      component.refreshMembers();
      tick();

      expect(toastControllerSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'Lede is Herlaai',
          color: 'success',
        })
      );
    }));
  });

  describe('filterMembers', () => {
    beforeEach(fakeAsync(() => {
      apiServiceSpy.getAllMembers.and.returnValue(of(mockMembers));
      component.loadMembers();
      tick();
    }));

    it('should show all members when search term is empty', () => {
      component.searchTerm = '';
      component.filterMembers();

      expect(component.filteredMembers.length).toBe(3);
    });

    it('should filter members by search term (case-insensitive)', () => {
      component.searchTerm = 'pieter';
      component.filterMembers();

      expect(component.filteredMembers.length).toBe(1);
      expect(component.filteredMembers[0].fullName).toBe(
        'Pieter van der Merwe'
      );
    });

    it('should filter members by partial name match', () => {
      component.searchTerm = 'van der';
      component.filterMembers();

      expect(component.filteredMembers.length).toBe(1);
      expect(component.filteredMembers[0].fullName).toBe(
        'Pieter van der Merwe'
      );
    });

    it('should trim whitespace from search term', () => {
      component.searchTerm = '  pieter  ';
      component.filterMembers();

      expect(component.filteredMembers.length).toBe(1);
      expect(component.filteredMembers[0].fullName).toBe(
        'Pieter van der Merwe'
      );
    });

    it('should return empty array when no matches found', () => {
      component.searchTerm = 'nonexistent';
      component.filterMembers();

      expect(component.filteredMembers.length).toBe(0);
    });
  });

  describe('getCampBadgeColor', () => {
    it('should return danger color for red camp', () => {
      expect(component.getCampBadgeColor('red')).toBe('danger');
    });

    it('should return success color for green camp', () => {
      expect(component.getCampBadgeColor('green')).toBe('success');
    });

    it('should return medium color for null camp assignment', () => {
      expect(component.getCampBadgeColor(null)).toBe('medium');
    });
  });

  describe('getCampLabel', () => {
    it('should return Afrikaans label for red camp', () => {
      expect(component.getCampLabel('red')).toBe('Rooi Kamp');
    });

    it('should return Afrikaans label for green camp', () => {
      expect(component.getCampLabel('green')).toBe('Groen Kamp');
    });

    it('should return Afrikaans label for null camp assignment', () => {
      expect(component.getCampLabel(null)).toBe('Nog nie toegeken nie');
    });
  });

  describe('Auto-refresh', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should start auto-refresh on ionViewWillEnter', fakeAsync(() => {
      apiServiceSpy.getAllMembers.and.returnValue(of(mockMembers));

      component.ionViewWillEnter();
      tick();

      // Initial call count
      const initialCallCount = apiServiceSpy.getAllMembers.calls.count();

      // Fast-forward 30 seconds
      jasmine.clock().tick(30000);
      tick();

      // Should have called loadMembers again
      expect(apiServiceSpy.getAllMembers.calls.count()).toBeGreaterThan(
        initialCallCount
      );
    }));

    it('should preserve search filter during auto-refresh', fakeAsync(() => {
      apiServiceSpy.getAllMembers.and.returnValue(of(mockMembers));

      // Load members initially
      component.ngOnInit();
      tick();
      expect(component.filteredMembers.length).toBe(3);

      // Apply search filter
      component.searchTerm = 'pieter';
      component.filterMembers();
      expect(component.filteredMembers.length).toBe(1);

      // Trigger auto-refresh
      component.ionViewWillEnter();
      jasmine.clock().tick(30000);
      tick();

      // Search filter should still be applied after auto-refresh
      expect(component.searchTerm).toBe('pieter');
      expect(component.filteredMembers.length).toBe(1);
      expect(component.filteredMembers[0].fullName).toBe('Pieter van der Merwe');
    }));

    it('should clear auto-refresh on ionViewWillLeave', () => {
      component.ionViewWillEnter();
      expect(component['refreshInterval']).toBeDefined();

      component.ionViewWillLeave();
      expect(component['refreshInterval']).toBeUndefined();
    });

    it('should clear auto-refresh on ngOnDestroy', () => {
      component.ionViewWillEnter();
      expect(component['refreshInterval']).toBeDefined();

      component.ngOnDestroy();
      expect(component['refreshInterval']).toBeUndefined();
    });
  });

  describe('Privacy enforcement', () => {
    it('should NOT include medical data in ReceptionMemberView', fakeAsync(() => {
      const memberWithMedicalData = {
        ...mockMembers[0],
        bloodType: 'A+',
        chronicConditions: 'Diabetes',
        medication: 'Insulin',
        idNumber: '123456789',
      };

      apiServiceSpy.getAllMembers.and.returnValue(of([memberWithMedicalData]));

      component.loadMembers();
      tick();

      const mappedMember = component.members[0];

      // Verify medical data is NOT included
      expect((mappedMember as any).bloodType).toBeUndefined();
      expect((mappedMember as any).chronicConditions).toBeUndefined();
      expect((mappedMember as any).medication).toBeUndefined();
      expect((mappedMember as any).idNumber).toBeUndefined();

      // Verify only safe data is included
      expect(mappedMember.id).toBeDefined();
      expect(mappedMember.fullName).toBeDefined();
      expect(mappedMember.familySize).toBeDefined();
      expect(mappedMember.campAssignment).toBeDefined();
    }));
  });
});
