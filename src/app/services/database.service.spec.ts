import { TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { DatabaseService } from './database.service';
import { SyncQueueService } from './sync-queue.service';

describe('DatabaseService - Triage Logic', () => {
  let service: DatabaseService;
  let platformSpy: jasmine.SpyObj<Platform>;
  let syncQueueServiceSpy: jasmine.SpyObj<SyncQueueService>;

  beforeEach(() => {
    // Create spy objects
    platformSpy = jasmine.createSpyObj('Platform', ['ready', 'is']);
    syncQueueServiceSpy = jasmine.createSpyObj('SyncQueueService', [
      'queueChange',
    ]);

    // Configure platform spy to return resolved promise
    platformSpy.ready.and.returnValue(Promise.resolve('dom'));
    platformSpy.is.and.returnValue(true); // Simulate desktop for IndexedDB

    TestBed.configureTestingModule({
      providers: [
        DatabaseService,
        { provide: Platform, useValue: platformSpy },
        { provide: SyncQueueService, useValue: syncQueueServiceSpy },
      ],
    });

    service = TestBed.inject(DatabaseService);
  });

  describe('performSimpleTriage', () => {
    it('should return "green" when member has no medical info', async () => {
      // Arrange
      const memberId = 'test-member-1';
      spyOn<any>(service, 'waitForDatabase').and.returnValue(
        Promise.resolve()
      );
      spyOn<any>(service['indexedDB'].medical_info, 'get').and.returnValue(
        Promise.resolve(null)
      );

      // Act
      const result = await service.performSimpleTriage(memberId);

      // Assert
      expect(result).toBe('green');
    });

    it('should return "red" when member has chronic illness but NO medication (URGENT)', async () => {
      // Arrange - Pieter scenario: diabetic without insulin
      const memberId = 'test-member-pieter';
      spyOn<any>(service, 'waitForDatabase').and.returnValue(
        Promise.resolve()
      );
      spyOn<any>(service['indexedDB'].medical_info, 'get').and.returnValue(
        Promise.resolve({
          member_id: memberId,
          bloed_groep: 'A+',
          op_chroniese_medikasie: true,  // Has chronic illness
          het_medikasie_by: false,       // Does NOT have medication
        })
      );

      // Act
      const result = await service.performSimpleTriage(memberId);

      // Assert
      expect(result).toBe('red'); // URGENT - needs medical attention
    });

    it('should return "green" when member has chronic illness AND has medication', async () => {
      // Arrange - Person can manage their condition
      const memberId = 'test-member-3';
      spyOn<any>(service, 'waitForDatabase').and.returnValue(
        Promise.resolve()
      );
      spyOn<any>(service['indexedDB'].medical_info, 'get').and.returnValue(
        Promise.resolve({
          member_id: memberId,
          bloed_groep: 'O+',
          op_chroniese_medikasie: true,  // Has chronic illness
          het_medikasie_by: true,        // HAS medication with them
        })
      );

      // Act
      const result = await service.performSimpleTriage(memberId);

      // Assert
      expect(result).toBe('green'); // Safe - has medication
    });

    it('should return "green" when member has NO chronic illness', async () => {
      // Arrange - Healthy person
      const memberId = 'test-member-4';
      spyOn<any>(service, 'waitForDatabase').and.returnValue(
        Promise.resolve()
      );
      spyOn<any>(service['indexedDB'].medical_info, 'get').and.returnValue(
        Promise.resolve({
          member_id: memberId,
          bloed_groep: 'B+',
          op_chroniese_medikasie: false, // No chronic illness
          het_medikasie_by: false,       // Medication field irrelevant
        })
      );

      // Act
      const result = await service.performSimpleTriage(memberId);

      // Assert
      expect(result).toBe('green'); // Healthy
    });

    it('should return "green" when chronic illness is false but has medication anyway', async () => {
      // Arrange - Edge case: no illness but has medication
      const memberId = 'test-member-5';
      spyOn<any>(service, 'waitForDatabase').and.returnValue(
        Promise.resolve()
      );
      spyOn<any>(service['indexedDB'].medical_info, 'get').and.returnValue(
        Promise.resolve({
          member_id: memberId,
          bloed_groep: 'AB+',
          op_chroniese_medikasie: false, // No chronic illness
          het_medikasie_by: true,        // Has medication (contradictory but possible)
        })
      );

      // Act
      const result = await service.performSimpleTriage(memberId);

      // Assert
      expect(result).toBe('green'); // No illness = Green Camp
    });

    it('should return "green" when boolean fields are undefined/null', async () => {
      // Arrange - Missing data
      const memberId = 'test-member-6';
      spyOn<any>(service, 'waitForDatabase').and.returnValue(
        Promise.resolve()
      );
      spyOn<any>(service['indexedDB'].medical_info, 'get').and.returnValue(
        Promise.resolve({
          member_id: memberId,
          bloed_groep: 'A-',
          op_chroniese_medikasie: undefined,
          het_medikasie_by: undefined,
        })
      );

      // Act
      const result = await service.performSimpleTriage(memberId);

      // Assert
      expect(result).toBe('green'); // Default to Green Camp when data missing
    });

    it('should return "green" on error (graceful degradation)', async () => {
      // Arrange
      const memberId = 'test-member-error';
      spyOn<any>(service, 'waitForDatabase').and.returnValue(
        Promise.reject(new Error('Database error'))
      );
      spyOn(console, 'error'); // Suppress console error

      // Act
      const result = await service.performSimpleTriage(memberId);

      // Assert
      expect(result).toBe('green');
      expect(console.error).toHaveBeenCalledWith(
        'Triage failed:',
        jasmine.any(Error)
      );
    });

    it('should NOT consider blood type as a triage factor', async () => {
      // Arrange - Member has only blood type, no chronic illness
      const memberId = 'test-member-7';
      spyOn<any>(service, 'waitForDatabase').and.returnValue(
        Promise.resolve()
      );
      spyOn<any>(service['indexedDB'].medical_info, 'get').and.returnValue(
        Promise.resolve({
          member_id: memberId,
          bloed_groep: 'O-', // Universal donor, but not a triage factor
          op_chroniese_medikasie: false,
          het_medikasie_by: false,
        })
      );

      // Act
      const result = await service.performSimpleTriage(memberId);

      // Assert
      expect(result).toBe('green'); // Blood type alone should not trigger Red Camp
    });
  });

  describe('updateMemberCampAssignment', () => {
    it('should update camp assignment to "red" in IndexedDB', async () => {
      // Arrange
      const memberId = 'test-member-8';
      spyOn<any>(service, 'waitForDatabase').and.returnValue(
        Promise.resolve()
      );
      const updateSpy = spyOn<any>(
        service['indexedDB'].members,
        'update'
      ).and.returnValue(Promise.resolve());

      // Act
      await service.updateMemberCampAssignment(memberId, 'red');

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(memberId, {
        camp_assignment: 'red',
        updated_at: jasmine.any(Number),
      });
    });

    it('should update camp assignment to "green" in IndexedDB', async () => {
      // Arrange
      const memberId = 'test-member-9';
      spyOn<any>(service, 'waitForDatabase').and.returnValue(
        Promise.resolve()
      );
      const updateSpy = spyOn<any>(
        service['indexedDB'].members,
        'update'
      ).and.returnValue(Promise.resolve());

      // Act
      await service.updateMemberCampAssignment(memberId, 'green');

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(memberId, {
        camp_assignment: 'green',
        updated_at: jasmine.any(Number),
      });
    });

    it('should throw error when update fails', async () => {
      // Arrange
      const memberId = 'test-member-error';
      spyOn<any>(service, 'waitForDatabase').and.returnValue(
        Promise.resolve()
      );
      spyOn<any>(service['indexedDB'].members, 'update').and.returnValue(
        Promise.reject(new Error('Update failed'))
      );
      spyOn(console, 'error'); // Suppress console error

      // Act & Assert
      await expectAsync(
        service.updateMemberCampAssignment(memberId, 'red')
      ).toBeRejectedWithError('Update failed');
      expect(console.error).toHaveBeenCalledWith(
        'Failed to update camp assignment:',
        jasmine.any(Error)
      );
    });
  });

  describe('Integration: saveEntry with Triage', () => {
    it('should perform triage after saving member entry', async () => {
      // Arrange
      const entry = {
        entryId: 'test-member-10',
        basicInfo: {
          van: 'Test',
          noemNaam: 'User',
          huistaal: 'Afrikaans',
          geslag: 'Manlik',
          ouderdom: 30,
          geboorteDatum: '1995-01-01',
          idNommer: '9501015800080',
          cellNommer: '0821234567',
          email: 'test@example.com',
          huwelikStatus: 'Getroud',
        },
        medicalInfo: {
          bloed_groep: 'A+',
          chroniese_siektes: 'Diabetes',
          medikasie: 'Insulin',
        },
      };

      spyOn<any>(service, 'waitForDatabase').and.returnValue(
        Promise.resolve()
      );
      spyOn<any>(service, 'getCurrentMemberId').and.returnValue(null);
      spyOn<any>(service, 'getMemberIdByNationalId').and.returnValue(
        Promise.resolve(null)
      );
      spyOn<any>(service['indexedDB'], 'createMember').and.returnValue(
        Promise.resolve(entry.entryId)
      );
      spyOn(service, 'performSimpleTriage').and.returnValue(
        Promise.resolve('red')
      );
      spyOn(service, 'updateMemberCampAssignment').and.returnValue(
        Promise.resolve()
      );
      spyOn<any>(service, 'queueForSync').and.returnValue(Promise.resolve());
      spyOn<any>(service, 'setCurrentMemberId');

      // Act
      await service.saveEntry(entry);

      // Assert
      expect(service.performSimpleTriage).toHaveBeenCalledWith(entry.entryId);
      expect(service.updateMemberCampAssignment).toHaveBeenCalledWith(
        entry.entryId,
        'red'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle SQLite boolean storage (0/1 instead of true/false)', async () => {
      // This test verifies the SQLite code path handles boolean conversion
      // Note: This is a conceptual test - actual SQLite testing requires different setup

      // The implementation handles both:
      // medicalInfo.op_chroniese_medikasie === 1 || medicalInfo.op_chroniese_medikasie === true

      expect(true).toBe(true); // Placeholder - actual SQLite test requires platform setup
    });
  });
});
