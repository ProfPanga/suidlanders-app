import { Injectable } from '@nestjs/common';
import { Member } from '../entities/member.entity';

/**
 * Triage Service - Implements Story 1.1 triage logic
 *
 * TRIAGE RULE:
 * - Has chronic illness + no medication → Red Camp
 * - Otherwise → Green Camp
 *
 * Red Camp = Needs medical attention/monitoring
 * Green Camp = Standard camp assignment
 */
@Injectable()
export class TriageService {
  /**
   * Perform simple triage on a member
   * Returns camp assignment ('red' or 'green') and reason
   */
  performTriage(member: Member): { campAssignment: string; triageReason: string } {
    // Story 1.1 Triage Logic
    const hasChronicCondition = this.hasChronicCondition(member.chronicConditions);
    const hasMedication = this.hasMedication(member.medication);

    if (hasChronicCondition && !hasMedication) {
      return {
        campAssignment: 'red',
        triageReason: 'Has chronic condition without medication - requires medical oversight',
      };
    }

    // Default: Green Camp
    return {
      campAssignment: 'green',
      triageReason: 'Standard camp assignment - no immediate medical concerns',
    };
  }

  /**
   * Check if member has chronic conditions
   */
  private hasChronicCondition(chronicConditions: string | null | undefined): boolean {
    if (!chronicConditions) {
      return false;
    }

    const normalized = chronicConditions.toLowerCase().trim();

    // Empty or "none" means no conditions
    if (normalized === '' || normalized === 'none' || normalized === 'geen') {
      return false;
    }

    // Any other text means they have conditions
    return true;
  }

  /**
   * Check if member has medication
   */
  private hasMedication(medication: string | null | undefined): boolean {
    if (!medication) {
      return false;
    }

    const normalized = medication.toLowerCase().trim();

    // Empty or "none" means no medication
    if (normalized === '' || normalized === 'none' || normalized === 'geen') {
      return false;
    }

    // Any other text means they have medication
    return true;
  }
}
