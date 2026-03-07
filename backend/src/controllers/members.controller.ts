import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { MembersService } from '../services/members.service';
import { CreateMemberDTO, ReceptionMemberDTO } from '../dto/member.dto';

/**
 * Members Controller - API endpoints for member management
 *
 * Story 1.2 Required Endpoint:
 * - GET /api/members - Returns all members (medical data excluded for Reception)
 */
@Controller('api/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  /**
   * GET /api/members/health
   *
   * Health check endpoint
   * IMPORTANT: Must be defined BEFORE :id route to avoid "health" being matched as an ID
   */
  @Get('health')
  async health() {
    const count = await this.membersService.getMemberCount();
    return {
      status: 'ok',
      service: 'suidlanders-backend',
      members: count,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /api/members
   *
   * Returns all members with camp assignments
   * EXCLUDES medical data for privacy (Reception staff endpoint)
   *
   * Story 1.2 Requirement:
   * - Used by Reception Dashboard
   * - Shows: name, family size, camp assignment
   * - Hides: medical data, ID numbers, contact info
   */
  @Get()
  async getAllMembers(): Promise<ReceptionMemberDTO[]> {
    return this.membersService.getAllMembersForReception();
  }

  /**
   * GET /api/members/:id
   *
   * Returns specific member (Reception-safe view)
   */
  @Get(':id')
  async getMember(@Param('id') id: string): Promise<ReceptionMemberDTO> {
    const member = await this.membersService.getMemberForReception(id);

    if (!member) {
      throw new HttpException('Member not found', HttpStatus.NOT_FOUND);
    }

    return member;
  }

  /**
   * POST /api/members
   *
   * Create new member (used when mobile app syncs)
   * Automatically performs triage and assigns camp
   */
  @Post()
  async createMember(@Body() createMemberDto: CreateMemberDTO): Promise<ReceptionMemberDTO> {
    return this.membersService.createMember(createMemberDto);
  }
}
