import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CampAuthService } from '../services/camp-auth.service';

/**
 * Camp Auth Controller - QR provisioning endpoints
 *
 * Story 1.3: QR Code Provisioning Flow
 * - POST /api/auth/camp/generate-qr - Generate QR code with sync token
 * - POST /api/auth/camp/exchange - Exchange sync code for temporary token
 */
@Controller('api/auth/camp')
export class CampAuthController {
  constructor(private readonly campAuthService: CampAuthService) {}

  /**
   * POST /api/auth/camp/generate-qr
   *
   * Generate a QR code for camp provisioning
   * Returns QR payload with server URLs, sync code, and camp ID
   *
   * Used by Reception Dashboard "Genereer QR Kode" button
   */
  @Post('generate-qr')
  async generateQR(@Body() body: { campId?: string }) {
    try {
      const campId = body.campId || 'default-camp';
      const qrPayload = await this.campAuthService.generateQRPayload(campId);

      return {
        success: true,
        payload: qrPayload,
        message: 'QR code generated successfully',
      };
    } catch (error) {
      console.error('QR generation failed:', error);
      throw new HttpException(
        'Failed to generate QR code',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * POST /api/auth/camp/exchange
   *
   * Exchange a short-lived sync code for a temporary sync token
   *
   * Request body: { syncCode: string, campId: string }
   * Response: { syncToken: string, expiresIn: number }
   *
   * Used by mobile app after scanning QR code
   */
  @Post('exchange')
  async exchangeSyncCode(
    @Body() body: { syncCode: string; campId: string }
  ) {
    const { syncCode, campId } = body;

    if (!syncCode || !campId) {
      throw new HttpException(
        'syncCode and campId are required',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const result = await this.campAuthService.exchangeSyncCode(
        syncCode,
        campId
      );

      if (!result) {
        throw new HttpException(
          'Invalid or expired sync code',
          HttpStatus.UNAUTHORIZED
        );
      }

      return {
        success: true,
        syncToken: result.syncToken,
        expiresIn: result.expiresIn,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Sync code exchange failed:', error);
      throw new HttpException(
        'Failed to exchange sync code',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
