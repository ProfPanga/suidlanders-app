import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../entities/member.entity';
import { CreateMemberDTO, ReceptionMemberDTO } from '../dto/member.dto';
import { TriageService } from './triage.service';

/**
 * Members Service - Business logic for member management
 * Handles data access, triage, and privacy enforcement
 */
@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
    private triageService: TriageService,
  ) {}

  /**
   * Get all members for Reception Dashboard
   * EXCLUDES medical data for privacy
   */
  async getAllMembersForReception(): Promise<ReceptionMemberDTO[]> {
    const members = await this.membersRepository.find({
      where: { status: 'active' },
      order: { syncedAt: 'DESC' },
    });

    // Map to safe DTO (excludes medical data)
    return members.map((member) => this.mapToReceptionDTO(member));
  }

  /**
   * Get specific member for Reception (safe view)
   */
  async getMemberForReception(id: string): Promise<ReceptionMemberDTO | null> {
    const member = await this.membersRepository.findOne({
      where: { id, status: 'active' },
    });

    if (!member) {
      return null;
    }

    return this.mapToReceptionDTO(member);
  }

  /**
   * Create new member (when mobile app syncs)
   * Automatically performs triage
   */
  async createMember(createMemberDto: CreateMemberDTO): Promise<ReceptionMemberDTO> {
    // Create member entity
    const member = this.membersRepository.create(createMemberDto);

    // Perform triage to assign camp
    const { campAssignment, triageReason } = this.triageService.performTriage(member);
    member.campAssignment = campAssignment;
    member.triageReason = triageReason;

    // Save to database
    const savedMember = await this.membersRepository.save(member);

    console.log(
      `✅ Member created: ${savedMember.firstName} ${savedMember.lastName} → ${campAssignment.toUpperCase()} Camp`,
    );

    // Return safe DTO for Reception
    return this.mapToReceptionDTO(savedMember);
  }

  /**
   * Get member count (for health check)
   */
  async getMemberCount(): Promise<number> {
    return this.membersRepository.count({ where: { status: 'active' } });
  }

  /**
   * Map Member entity to ReceptionMemberDTO
   * PRIVACY ENFORCEMENT: Excludes all medical data
   */
  private mapToReceptionDTO(member: Member): ReceptionMemberDTO {
    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      familySize: member.familySize,
      campAssignment: member.campAssignment,
      syncedAt: member.syncedAt.toISOString(),
    };

    // INTENTIONALLY EXCLUDED:
    // - chronicConditions, medication, bloodType, allergies
    // - triageReason (medical staff only)
    // - idNumber, email, phone
  }
}
