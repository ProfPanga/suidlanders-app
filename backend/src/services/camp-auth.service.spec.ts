import { Test, TestingModule } from '@nestjs/testing';
import { CampAuthService } from './camp-auth.service';

describe('CampAuthService', () => {
  let service: CampAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampAuthService],
    }).compile();

    service = module.get<CampAuthService>(CampAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateQRPayload', () => {
    it('should generate QR payload with WiFi credentials', async () => {
      const campId = 'test-camp';
      const payload = await service.generateQRPayload(campId);

      // Check WiFi configuration
      expect(payload.wifi).toBeDefined();
      expect(payload.wifi.ssid).toBe('SuidlandersKamp');
      expect(payload.wifi.password).toBe('Kamp2026!');
      expect(payload.wifi.security).toBe('WPA2');

      // Check server URLs
      expect(payload.serverUrls).toBeDefined();
      expect(Array.isArray(payload.serverUrls)).toBe(true);
      expect(payload.serverUrls.length).toBeGreaterThan(0);

      // Check sync code
      expect(payload.syncCode).toBeDefined();
      expect(payload.syncCode).toMatch(/^[A-Z0-9]{8}$/); // 8 alphanumeric characters

      // Check camp ID
      expect(payload.campId).toBe(campId);
    });

    it('should not include localhost in serverUrls', async () => {
      const payload = await service.generateQRPayload('test-camp');

      // Filter out localhost URLs (only acceptable in development)
      const localhostUrls = payload.serverUrls.filter((url) =>
        url.includes('localhost') || url.includes('127.0.0.1'),
      );

      // In production, there should be no localhost URLs
      // For this test, we accept them only if no other URLs exist
      if (payload.serverUrls.length > 1) {
        expect(localhostUrls.length).toBe(0);
      }
    });

    it('should include camp.local mDNS URL', async () => {
      const payload = await service.generateQRPayload('test-camp');

      const hasCampLocal = payload.serverUrls.some((url) =>
        url.includes('camp.local'),
      );

      expect(hasCampLocal).toBe(true);
    });

    it('should generate unique sync codes for each request', async () => {
      const payload1 = await service.generateQRPayload('camp-1');
      const payload2 = await service.generateQRPayload('camp-2');

      expect(payload1.syncCode).not.toBe(payload2.syncCode);
    });
  });

  describe('exchangeSyncCode', () => {
    it('should successfully exchange valid sync code', async () => {
      const campId = 'test-camp';

      // Generate QR payload to get a valid sync code
      const payload = await service.generateQRPayload(campId);

      // Exchange the sync code for a token
      const result = await service.exchangeSyncCode(
        payload.syncCode,
        campId,
      );

      expect(result).not.toBeNull();
      expect(result?.syncToken).toBeDefined();
      expect(result?.expiresIn).toBe(3600); // 1 hour
    });

    it('should fail with invalid sync code', async () => {
      const result = await service.exchangeSyncCode(
        'INVALID123',
        'test-camp',
      );

      expect(result).toBeNull();
    });

    it('should fail with mismatched camp ID', async () => {
      const campId = 'test-camp';

      // Generate QR payload
      const payload = await service.generateQRPayload(campId);

      // Try to exchange with different camp ID
      const result = await service.exchangeSyncCode(
        payload.syncCode,
        'different-camp',
      );

      expect(result).toBeNull();
    });

    it('should consume sync code after successful exchange (one-time use)', async () => {
      const campId = 'test-camp';

      // Generate QR payload
      const payload = await service.generateQRPayload(campId);

      // First exchange should succeed
      const result1 = await service.exchangeSyncCode(
        payload.syncCode,
        campId,
      );
      expect(result1).not.toBeNull();

      // Second exchange with same code should fail (one-time use)
      const result2 = await service.exchangeSyncCode(
        payload.syncCode,
        campId,
      );
      expect(result2).toBeNull();
    });

    it('should fail with expired sync code', async () => {
      const campId = 'test-camp';

      // Generate QR payload
      const payload = await service.generateQRPayload(campId);

      // Manually expire the sync code by manipulating service internals
      // In real scenario, wait 15+ minutes or mock Date.now()
      jest.useFakeTimers();
      jest.setSystemTime(Date.now() + 16 * 60 * 1000); // Fast-forward 16 minutes

      const result = await service.exchangeSyncCode(
        payload.syncCode,
        campId,
      );

      expect(result).toBeNull();

      jest.useRealTimers();
    });
  });

  describe('cleanupExpiredCodes', () => {
    it('should remove expired sync codes', async () => {
      const campId = 'test-camp';

      // Generate a sync code
      const payload = await service.generateQRPayload(campId);

      // Fast-forward time to expire the code
      jest.useFakeTimers();
      jest.setSystemTime(Date.now() + 16 * 60 * 1000); // 16 minutes

      // Run cleanup
      service.cleanupExpiredCodes();

      // Try to exchange - should fail because code was cleaned up
      const result = await service.exchangeSyncCode(
        payload.syncCode,
        campId,
      );

      expect(result).toBeNull();

      jest.useRealTimers();
    });
  });
});
