/**
 * Data Transfer Objects for Member API
 * Separate DTOs ensure privacy - different roles see different data
 */

/**
 * ReceptionMemberDTO - Safe data for Reception Staff
 * EXCLUDES all medical information for privacy
 */
export class ReceptionMemberDTO {
  id: string;
  firstName: string;
  lastName: string;
  familySize: number;
  campAssignment: string | null;
  syncedAt: string;

  // EXCLUDED: medical info, ID number, contact details, triage reason
}

/**
 * CreateMemberDTO - Data received when member syncs from mobile app
 */
export class CreateMemberDTO {
  firstName: string;
  lastName: string;
  idNumber?: string;
  email?: string;
  phone?: string;
  familySize: number;
  bloodType?: string;
  chronicConditions?: string;
  medication?: string;
  allergies?: string;
}
