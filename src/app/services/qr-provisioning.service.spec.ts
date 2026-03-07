import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { QRProvisioningService } from './qr-provisioning.service';
import { AuthService } from './auth.service';
import { SyncService } from './sync.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { of, throwError } from 'rxjs';

describe('QRProvisioningService', () => {
  let service: QRProvisioningService;
  let authService: jasmine.SpyObj<AuthService>;
  let syncService: jasmine.SpyObj<SyncService>;
  let loadingController: jasmine.SpyObj<LoadingController>;
  let toastController: jasmine.SpyObj<ToastController>;

  const mockLoadingElement = {
    present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()),
  };

  const mockToastElement = {
    present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
  };

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'setCampBaseUrl',
      'setSyncToken',
      'exchangeCampCodeAt',
    ]);
    const syncServiceSpy = jasmine.createSpyObj('SyncService', ['sync']);
    const loadingCtrlSpy = jasmine.createSpyObj('LoadingController', ['create']);
    const toastCtrlSpy = jasmine.createSpyObj('ToastController', ['create']);

    loadingCtrlSpy.create.and.returnValue(Promise.resolve(mockLoadingElement as any));
    toastCtrlSpy.create.and.returnValue(Promise.resolve(mockToastElement as any));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        QRProvisioningService,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: SyncService, useValue: syncServiceSpy },
        { provide: LoadingController, useValue: loadingCtrlSpy },
        { provide: ToastController, useValue: toastCtrlSpy },
      ],
    });

    service = TestBed.inject(QRProvisioningService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    syncService = TestBed.inject(SyncService) as jasmine.SpyObj<SyncService>;
    loadingController = TestBed.inject(LoadingController) as jasmine.SpyObj<LoadingController>;
    toastController = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('testServerURLs', () => {
    it('should return first working URL', async () => {
      spyOn<any>(service, 'pingServer').and.returnValues(
        Promise.resolve(false), // First URL fails
        Promise.resolve(true)    // Second URL succeeds
      );

      const urls = ['http://fail.com', 'http://success.com'];
      const result = await service.testServerURLs(urls);

      expect(result).toBe('http://success.com');
    });

    it('should return null if all URLs fail', async () => {
      spyOn<any>(service, 'pingServer').and.returnValue(Promise.resolve(false));

      const urls = ['http://fail1.com', 'http://fail2.com'];
      const result = await service.testServerURLs(urls);

      expect(result).toBeNull();
    });

    it('should test URLs sequentially', async () => {
      const pingServerSpy = spyOn<any>(service, 'pingServer').and.returnValues(
        Promise.resolve(false),
        Promise.resolve(false),
        Promise.resolve(true)
      );

      const urls = ['http://url1.com', 'http://url2.com', 'http://url3.com'];
      await service.testServerURLs(urls);

      expect(pingServerSpy).toHaveBeenCalledTimes(3);
      expect(pingServerSpy).toHaveBeenCalledWith('http://url1.com');
      expect(pingServerSpy).toHaveBeenCalledWith('http://url2.com');
      expect(pingServerSpy).toHaveBeenCalledWith('http://url3.com');
    });
  });

  describe('scanAndProvision', () => {
    const mockPayload = {
      serverUrls: ['http://test.com'],
      syncCode: 'TEST123',
      campId: 'camp-1',
    };

    beforeEach(() => {
      // Reset spies
      mockLoadingElement.present.calls.reset();
      mockLoadingElement.dismiss.calls.reset();
      mockToastElement.present.calls.reset();
    });

    it('should successfully provision and sync', async () => {
      spyOn(service, 'testServerURLs').and.returnValue(Promise.resolve('http://test.com'));
      spyOn<any>(service, 'exchangeSyncCode').and.returnValue(Promise.resolve('test-token'));
      syncService.sync.and.returnValue(of({ success: true, message: 'Success', syncedRecords: 5 }));

      const result = await service.scanAndProvision(mockPayload);

      expect(result.success).toBe(true);
      expect(result.baseUrl).toBe('http://test.com');
      expect(result.campId).toBe('camp-1');
      expect(authService.setCampBaseUrl).toHaveBeenCalledWith('http://test.com');
      expect(authService.setSyncToken).toHaveBeenCalledWith('test-token');
      expect(authService.setSyncToken).toHaveBeenCalledWith(null); // Cleared after sync
    });

    it('should fail if all server URLs unreachable', async () => {
      spyOn(service, 'testServerURLs').and.returnValue(Promise.resolve(null));

      const result = await service.scanAndProvision(mockPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('All server URLs unreachable');
      expect(toastController.create).toHaveBeenCalled();
    });

    it('should fail if sync code exchange fails', async () => {
      spyOn(service, 'testServerURLs').and.returnValue(Promise.resolve('http://test.com'));
      spyOn<any>(service, 'exchangeSyncCode').and.returnValue(Promise.resolve(null));

      const result = await service.scanAndProvision(mockPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync code exchange failed');
    });

    it('should fail if sync fails', async () => {
      spyOn(service, 'testServerURLs').and.returnValue(Promise.resolve('http://test.com'));
      spyOn<any>(service, 'exchangeSyncCode').and.returnValue(Promise.resolve('test-token'));
      syncService.sync.and.returnValue(of({ success: false, message: 'Sync failed' }));

      const result = await service.scanAndProvision(mockPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync failed');
    });

    it('should show loading indicators during provisioning', async () => {
      spyOn(service, 'testServerURLs').and.returnValue(Promise.resolve('http://test.com'));
      spyOn<any>(service, 'exchangeSyncCode').and.returnValue(Promise.resolve('test-token'));
      syncService.sync.and.returnValue(of({ success: true, message: 'Success', syncedRecords: 5 }));

      await service.scanAndProvision(mockPayload);

      // Should create loading indicator at least 3 times (connect, exchange, sync)
      expect(loadingController.create).toHaveBeenCalledTimes(3);
      expect(mockLoadingElement.present).toHaveBeenCalledTimes(3);
      expect(mockLoadingElement.dismiss).toHaveBeenCalledTimes(3);
    });
  });
});
