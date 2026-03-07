import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QRScannerComponent } from './qr-scanner.component';
import { AlertController, Platform } from '@ionic/angular';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

describe('QRScannerComponent', () => {
  let component: QRScannerComponent;
  let fixture: ComponentFixture<QRScannerComponent>;
  let alertController: jasmine.SpyObj<AlertController>;
  let platform: jasmine.SpyObj<Platform>;

  beforeEach(async () => {
    const alertCtrlSpy = jasmine.createSpyObj('AlertController', ['create']);
    const platformSpy = jasmine.createSpyObj('Platform', ['is']);

    const mockAlert = {
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
    };
    alertCtrlSpy.create.and.returnValue(Promise.resolve(mockAlert as any));

    await TestBed.configureTestingModule({
      imports: [QRScannerComponent],
      providers: [
        { provide: AlertController, useValue: alertCtrlSpy },
        { provide: Platform, useValue: platformSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QRScannerComponent);
    component = fixture.componentInstance;
    alertController = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('scanQRCode', () => {
    it('should emit error if platform is not capacitor', async () => {
      platform.is.and.returnValue(false);
      const errorSpy = jasmine.createSpy('error');
      component.error.subscribe(errorSpy);

      await component.scanQRCode();

      expect(errorSpy).toHaveBeenCalledWith('Platform not supported');
      expect(alertController.create).toHaveBeenCalled();
    });

    it('should emit error if camera permission denied', async () => {
      platform.is.and.returnValue(true);
      spyOn(BarcodeScanner, 'requestPermissions').and.returnValue(
        Promise.resolve({ camera: 'denied' } as any)
      );
      const errorSpy = jasmine.createSpy('error');
      component.error.subscribe(errorSpy);

      await component.scanQRCode();

      expect(errorSpy).toHaveBeenCalledWith('Camera permission denied');
    });

    it('should emit scanned payload on successful scan', async () => {
      platform.is.and.returnValue(true);
      spyOn(BarcodeScanner, 'requestPermissions').and.returnValue(
        Promise.resolve({ camera: 'granted' } as any)
      );

      const mockQRPayload = {
        serverUrls: ['http://test.com'],
        syncCode: 'ABC123',
        campId: 'camp-1',
      };

      spyOn(BarcodeScanner, 'scan').and.returnValue(
        Promise.resolve({
          barcodes: [{ rawValue: JSON.stringify(mockQRPayload) }],
        } as any)
      );

      const scannedSpy = jasmine.createSpy('scanned');
      component.scanned.subscribe(scannedSpy);

      await component.scanQRCode();

      expect(scannedSpy).toHaveBeenCalledWith(mockQRPayload);
    });

    it('should emit cancelled if no barcode found', async () => {
      platform.is.and.returnValue(true);
      spyOn(BarcodeScanner, 'requestPermissions').and.returnValue(
        Promise.resolve({ camera: 'granted' } as any)
      );
      spyOn(BarcodeScanner, 'scan').and.returnValue(
        Promise.resolve({ barcodes: [] } as any)
      );

      const cancelledSpy = jasmine.createSpy('cancelled');
      component.cancelled.subscribe(cancelledSpy);

      await component.scanQRCode();

      expect(cancelledSpy).toHaveBeenCalled();
    });

    it('should emit error for invalid QR payload', async () => {
      platform.is.and.returnValue(true);
      spyOn(BarcodeScanner, 'requestPermissions').and.returnValue(
        Promise.resolve({ camera: 'granted' } as any)
      );
      spyOn(BarcodeScanner, 'scan').and.returnValue(
        Promise.resolve({
          barcodes: [{ rawValue: 'invalid json' }],
        } as any)
      );

      const errorSpy = jasmine.createSpy('error');
      component.error.subscribe(errorSpy);

      await component.scanQRCode();

      expect(errorSpy).toHaveBeenCalledWith('Invalid QR payload');
    });

    it('should emit error for QR payload missing required fields', async () => {
      platform.is.and.returnValue(true);
      spyOn(BarcodeScanner, 'requestPermissions').and.returnValue(
        Promise.resolve({ camera: 'granted' } as any)
      );
      spyOn(BarcodeScanner, 'scan').and.returnValue(
        Promise.resolve({
          barcodes: [{ rawValue: JSON.stringify({ serverUrls: [] }) }],
        } as any)
      );

      const errorSpy = jasmine.createSpy('error');
      component.error.subscribe(errorSpy);

      await component.scanQRCode();

      expect(errorSpy).toHaveBeenCalledWith('Invalid QR payload');
    });

    it('should add and remove scanner-active class', async () => {
      platform.is.and.returnValue(true);
      spyOn(BarcodeScanner, 'requestPermissions').and.returnValue(
        Promise.resolve({ camera: 'granted' } as any)
      );
      spyOn(BarcodeScanner, 'scan').and.returnValue(
        Promise.resolve({ barcodes: [] } as any)
      );

      const bodySpy = spyOn(document.body.classList, 'add');
      const bodyRemoveSpy = spyOn(document.body.classList, 'remove');

      await component.scanQRCode();

      expect(bodySpy).toHaveBeenCalledWith('scanner-active');
      expect(bodyRemoveSpy).toHaveBeenCalledWith('scanner-active');
    });
  });

  describe('stopScanning', () => {
    it('should call BarcodeScanner.stopScan', async () => {
      const stopScanSpy = spyOn(BarcodeScanner, 'stopScan').and.returnValue(Promise.resolve());
      const bodyRemoveSpy = spyOn(document.body.classList, 'remove');

      await component.stopScanning();

      expect(stopScanSpy).toHaveBeenCalled();
      expect(bodyRemoveSpy).toHaveBeenCalledWith('scanner-active');
    });

    it('should handle stopScan errors gracefully', async () => {
      spyOn(BarcodeScanner, 'stopScan').and.returnValue(Promise.reject(new Error('Stop failed')));
      spyOn(console, 'error');

      await component.stopScanning();

      expect(console.error).toHaveBeenCalled();
    });
  });
});
