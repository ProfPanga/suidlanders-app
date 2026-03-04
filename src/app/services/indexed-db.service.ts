import Dexie, { Table } from 'dexie';

// Define interfaces for our tables
interface Member {
  id: string;
  created_at: number;
  updated_at: number;
  status: string;
  version: number;
  household_id?: string;
  relationship_to_head?: string;
  camp_assignment?: 'red' | 'green' | null;
}

interface BasicInfo {
  member_id: string;
  van: string;
  noem_naam: string;
  tweede_naam?: string;
  huistaal: string;
  geslag: string;
  ouderdom: number;
  geboorte_datum: string;
  id_nommer: string;
  cell_nommer: string;
  email: string;
  huwelik_status: string;
}

interface MemberInfo {
  member_id: string;
  lid_nommer?: string;
  reddings_verwysing?: string;
  bevelstruktuur?: string;
  radio_roepsein?: string;
  nood_kontak_naam: string;
  nood_kontak_nommer: string;
  nood_kontak_verwantskap: string;
  wapenlisensie: boolean;
  skiet_ervaring?: string;
  ehbo_kwalifikasie: boolean;
  ehbo_vlak?: string;
  ehbo_verval_datum?: string;
}

interface AddressInfo {
  member_id: string;
  straat_adres: string;
  voorstad: string;
  stad: string;
  provinsie: string;
  pos_kode: string;
  gps_lat?: number;
  gps_lng?: number;
  naaste_hospitaal?: string;
  naaste_polisie?: string;
}

interface MedicalInfo {
  member_id: string;
  bloed_groep: string;
  chroniese_siektes?: string;
  medikasie?: string;
  allergies?: string;
  mediese_fonds?: string;
  mediese_fonds_nommer?: string;
  huis_dokter?: string;
  huis_dokter_nommer?: string;
  mediese_notas?: string;
  // Note: These are stored as camelCase from the form
  opChronieseMedikasie?: boolean;
  hetMedikasieBy?: boolean;
}

interface VehicleInfo {
  id: string;
  member_id: string;
  is_primary: boolean;
  model: string;
  jaar: number;
  registrasie_nommer: string;
  brandstof_tipe: string;
  kilometer_stand: number;
  bande_toestand?: string;
}

interface SkillsInfo {
  member_id: string;
  beroep: string;
  kwalifikasies?: string;
  spesialis_vaardighede?: string;
  tale_kennis?: string;
  rekenaar_vaardig: boolean;
  bestuurslisensie_kode?: string;
  bestuurslisensie_pdp: boolean;
  bestuurslisensie_verval?: string;
  amateur_radio_lisensie: boolean;
  radio_roepsein?: string;
  radio_toerusting?: string;
}

interface EquipmentInfo {
  member_id: string;
  kommunikasie_radio: boolean;
  kommunikasie_satelliet: boolean;
  kommunikasie_tweerigtingradio: boolean;
  krag_generator: boolean;
  krag_sonkrag: boolean;
  krag_omvormer: boolean;
  water_boorgat: boolean;
  water_tenk: boolean;
  water_filtrasie: boolean;
  verdediging_vuurwapens: boolean;
  verdediging_lisensies: boolean;
  verdediging_opleiding: boolean;
  kampering_tent: boolean;
  kampering_slaapsak: boolean;
  kampering_toerusting: boolean;
  noodvoorraad_kos?: number;
  noodvoorraad_water?: number;
  noodvoorraad_brandstof?: number;
  noodvoorraad_medies: boolean;
}

interface CampInfo {
  member_id: string;
  kamp_provinsie: string;
  kamp_naam: string;
  datum_in_kamp: string;
}

interface OtherInfo {
  member_id: string;
  addisionele_notas?: string;
  spesiale_vaardighede?: string;
  belangstellings?: string;
  beskikbaarheid?: string;
  vrywilliger_werk?: string;
}

interface Document {
  id: string;
  member_id: string;
  type: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  size: number;
  uploaded_at: number;
}

interface DependentRow {
  id: string;
  parent_member_id: string;
  full_name: string;
  id_nommer?: string;
  geboorte_datum?: string;
  ouderdom?: number;
  geslag?: string;
  verhouding: string;
  allergies?: string;
  chronies?: string;
  medikasie?: string;
  notas?: string;
  created_at: number;
  updated_at: number;
}

export class SuidlandersDB extends Dexie {
  members!: Table<Member, string>;
  basic_info!: Table<BasicInfo, string>;
  member_info!: Table<MemberInfo, string>;
  address_info!: Table<AddressInfo, string>;
  medical_info!: Table<MedicalInfo, string>;
  vehicle_info!: Table<VehicleInfo, string>;
  skills_info!: Table<SkillsInfo, string>;
  equipment_info!: Table<EquipmentInfo, string>;
  camp_info!: Table<CampInfo, string>;
  other_info!: Table<OtherInfo, string>;
  documents!: Table<Document, string>;
  dependents!: Table<DependentRow, string>;

  constructor() {
    super('suidlanders_db');

    this.version(1).stores({
      members: 'id, status, created_at, updated_at',
      basic_info: 'member_id, id_nommer',
      member_info: 'member_id, lid_nommer',
      address_info: 'member_id',
      medical_info: 'member_id',
      vehicle_info: 'id, member_id',
      skills_info: 'member_id',
      equipment_info: 'member_id',
      camp_info: 'member_id',
      other_info: 'member_id',
      documents: 'id, member_id, type',
    });

    this.version(2).stores({
      dependents: 'id, parent_member_id',
    });

    // Version 3: Add camp_assignment field to members table
    this.version(3).stores({
      members: 'id, status, created_at, updated_at, camp_assignment',
    });
  }

  async createMember(memberData: any): Promise<string> {
    const memberId = memberData.entryId || this.generateId();
    const now = Date.now();

    // Start transaction
    try {
      await this.transaction(
        'rw',
        [
          this.members,
          this.basic_info,
          this.member_info,
          this.address_info,
          this.medical_info,
          this.vehicle_info,
          this.skills_info,
          this.equipment_info,
          this.camp_info,
          this.other_info,
        ],
        async () => {
          // Create member record
          await this.members.put({
            id: memberId,
            created_at: now,
            updated_at: now,
            status: 'active',
            version: 1,
          });

          // Insert each section if it exists
          if (memberData.basicInfo) {
            await this.basic_info.put({
              member_id: memberId,
              ...memberData.basicInfo,
            });
          }

          if (memberData.memberInfo) {
            await this.member_info.put({
              member_id: memberId,
              ...memberData.memberInfo,
            });
          }

          if (memberData.medicalInfo) {
            await this.medical_info.put({
              member_id: memberId,
              ...memberData.medicalInfo,
            });
          }

          // Dependents
          if (Array.isArray(memberData.dependents)) {
            const now = Date.now();
            const rows: DependentRow[] = memberData.dependents.map(
              (d: any) => ({
                id: d.id || this.generateId() + ':dep',
                parent_member_id: memberId,
                full_name: d.fullName || '',
                id_nommer: d.idNommer || undefined,
                geboorte_datum: d.geboorteDatum || undefined,
                ouderdom: d.ouderdom ?? undefined,
                geslag: d.geslag || undefined,
                verhouding: d.verhouding || 'Ander',
                allergies: d.allergies || undefined,
                chronies: d.chronies || undefined,
                medikasie: d.medikasie || undefined,
                notas: d.notas || undefined,
                created_at: now,
                updated_at: now,
              })
            );
            if (rows.length) await this.dependents.bulkPut(rows);
          }
        }
      );

      return memberId;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  }

  async getMember(memberId: string): Promise<any> {
    try {
      const member = await this.members.get(memberId);
      if (!member || member.status === 'deleted') {
        return null;
      }

      // Gather all member data
      const [
        basicInfo,
        memberInfo,
        addressInfo,
        medicalInfo,
        vehicleInfo,
        skillsInfo,
        equipmentInfo,
        campInfo,
        otherInfo,
        documents,
        dependents,
      ] = await Promise.all([
        this.basic_info.get(memberId),
        this.member_info.get(memberId),
        this.address_info.get(memberId),
        this.medical_info.get(memberId),
        this.vehicle_info.where('member_id').equals(memberId).toArray(),
        this.skills_info.get(memberId),
        this.equipment_info.get(memberId),
        this.camp_info.get(memberId),
        this.other_info.get(memberId),
        this.documents.where('member_id').equals(memberId).toArray(),
        this.dependents.where('parent_member_id').equals(memberId).toArray(),
      ]);

      return {
        entryId: memberId,
        campAssignment: member.camp_assignment,
        basicInfo,
        memberInfo,
        addressInfo,
        medicalInfo,
        vehicleInfo: vehicleInfo[0], // Assuming primary vehicle
        skillsInfo,
        equipmentInfo,
        campInfo,
        otherInfo,
        documents,
        dependents: dependents.map((r) => ({
          id: r.id,
          fullName: r.full_name,
          idNommer: r.id_nommer,
          geboorteDatum: r.geboorte_datum,
          ouderdom: r.ouderdom,
          geslag: r.geslag,
          verhouding: r.verhouding,
          allergies: r.allergies,
          chronies: r.chronies,
          medikasie: r.medikasie,
          notas: r.notas,
        })),
      };
    } catch (error) {
      console.error('Error getting member:', error);
      throw error;
    }
  }

  async getAllMembers(): Promise<any[]> {
    try {
      const members = await this.members
        .where('status')
        .equals('active')
        .reverse()
        .sortBy('created_at');

      return Promise.all(members.map((member) => this.getMember(member.id)));
    } catch (error) {
      console.error('Error getting all members:', error);
      throw error;
    }
  }

  async updateMember(memberId: string, memberData: any): Promise<void> {
    try {
      await this.transaction(
        'rw',
        [
          this.members,
          this.basic_info,
          this.member_info,
          this.address_info,
          this.medical_info,
          this.vehicle_info,
          this.skills_info,
          this.equipment_info,
          this.camp_info,
          this.other_info,
        ],
        async () => {
          // Update member record
          await this.members.update(memberId, {
            updated_at: Date.now(),
          });

          // Update each section if it exists
          if (memberData.basicInfo) {
            await this.basic_info.put({
              member_id: memberId,
              ...memberData.basicInfo,
            });
          }

          if (memberData.medicalInfo) {
            await this.medical_info.put({
              member_id: memberId,
              ...memberData.medicalInfo,
            });
          }

          // Dependents: replace for now
          if (Array.isArray(memberData.dependents)) {
            await this.dependents
              .where('parent_member_id')
              .equals(memberId)
              .delete();
            const now = Date.now();
            const rows: DependentRow[] = memberData.dependents.map(
              (d: any) => ({
                id: d.id || this.generateId() + ':dep',
                parent_member_id: memberId,
                full_name: d.fullName || '',
                id_nommer: d.idNommer || undefined,
                geboorte_datum: d.geboorteDatum || undefined,
                ouderdom: d.ouderdom ?? undefined,
                geslag: d.geslag || undefined,
                verhouding: d.verhouding || 'Ander',
                allergies: d.allergies || undefined,
                chronies: d.chronies || undefined,
                medikasie: d.medikasie || undefined,
                notas: d.notas || undefined,
                created_at: now,
                updated_at: now,
              })
            );
            if (rows.length) await this.dependents.bulkPut(rows);
          }
        }
      );
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  }

  async deleteMember(memberId: string): Promise<void> {
    try {
      await this.members.update(memberId, {
        status: 'deleted',
        updated_at: Date.now(),
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  }

  private generateId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `ID${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}
