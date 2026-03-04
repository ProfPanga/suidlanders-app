export interface BasicInfo {
  entryId: string;
  van: string;
  noemNaam: string;
  tweedeNaam?: string;
  huistaal: string;
  geslag: string;
  ouderdom: number;
  geboorteDatum: string;
  idNommer: string;
  cellNommer: string;
  email: string;
  huwelikStatus: string;
}

export interface MemberInfo {
  lidNommer?: string;
  reddingsVerwysing?: string;
  bevelstruktuur?: string;
  radioRoepsein?: string;
  noodKontakNaam: string;
  noodKontakNommer: string;
  noodKontakVerwantskap: string;
  wapenlisensie: boolean;
  skietervaring?: string;
}

export interface AddressInfo {
  straatAdres: string;
  voorstad: string;
  provinsie: string;
  posKode: string;
  woonagtig: string;
  gpsKoordinate: {
    lat: string;
    lng: string;
  };
  naaste: {
    hospitaal: string;
    hospitaalAfstand: number;
    polisie: string;
    polisieAfstand: number;
    winkel: string;
    winkelAfstand: number;
  };
}

export interface MedicalInfo {
  bloedGroep: string;
  chroniesesiektes?: string;
  medikasie?: string;
  allergies?: string;
  medieseFonds?: string;
  medieseFondsNommer?: string;
  huisDokter?: string;
  huisDokterNommer?: string;
  medieseNotas?: string;
  opChronieseMedikasie?: boolean;
  hetMedikasieBy?: boolean;
  entstowweSedert2020?: boolean;
  covidEntstof?: 'Pfizer' | 'J&J' | '';
  griepEntstof?: boolean;
  loopStyl?: string;
  nekVorentoe?: boolean;
  nekBuigbaar?: boolean;
  koorsig?: boolean;
  koorsDuur?: string;
  nekOfHoofpyn?: boolean;
  hoofpynDuur?: string;
  vorigeBeroertes?: boolean;
  beroerteTekens?: string[];
  oeVoorkoms?: string;
  tongVoorkoms?: string;
  tongDuur?: string;
  respiratorieseSimptome?: string[];
  respiratorieseDuur?: string;
  hartLongProbleme?: string[];
  vandagMedikasieGeneem?: boolean;
  hetEkstraMedikasie?: boolean;
  hoes?: boolean;
  hoesTye?: string[];
  giSimptome?: boolean;
  giDuur?: string;
  stoelVoorkoms?: string;
  buikpynLigging?: string;
  buikpynDuur?: string;
  rugpynLigging?: string;
  rugpynDuur?: string;
  angstig?: boolean;
  borsOfHoofpyn?: boolean;
  anderPyn?: string;
  velVoorkoms?: string;
  velLigging?: string;
  diabeet?: boolean;
  diabetesBehandeling?: 'Insulien' | 'Oraal';
  vandagDiabetesMedikasie?: boolean;
  hetEkstraDiabetesMedikasie?: boolean;
  laasGeet?: string;
  laasKos?: string;
  laasGedrink?: string;
  laasDrink?: string;
  waterBron?: 'Dam' | 'Rivier' | '';
  waterVloei?: 'Vloeiend' | 'Stil' | '';
  waterVoorkoms?: string;
  stapReisDuur?: string;
  beserings?: boolean;
  beseringLigging?: string;
}

export interface VehicleInfo {
  primereVoertuig: {
    model: string;
    registrasieNommer: string;
    brandstofTipe: string;
    bandeToestand: string;
  };
  sekondereVoertuig: {
    model: string;
    registrasieNommer: string;
    brandstofTipe: string;
    bandeToestand: string;
  };
  sleepwa: boolean;
  sleepwaKapasiteit: number;
}

export interface SkillsInfo {
  beroep: string;
  kwalifikasies?: string;
  spesialisVaardighede?: string;
  taleKennis?: string;
  rekenaarVaardig: boolean;
  bestuurslisensie: {
    kode: string;
    pdp: boolean;
    vervalDatum: string;
  };
  noodhulp?: {
    vlak?: string;
    vervalDatum?: string;
  };
  radio?: {
    amateurRadioLisensie: boolean;
    roepsein?: string;
    toerusting?: string;
  };
}

export interface EquipmentInfo {
  kommunikasie: {
    radio: boolean;
    satellietFoon: boolean;
    tweerigtingRadio: boolean;
  };
  kragOpwekking: {
    kragOpwekker: boolean;
    sonkragStelsel: boolean;
    omvormer: boolean;
  };
  waterBronne: {
    boorgat: boolean;
    waterTenk: boolean;
    waterFiltrasieStelsel: boolean;
  };
  verdediging: {
    vuurwapens: boolean;
    lisensies: boolean;
    opleiding: boolean;
  };
  kampering: {
    tent: boolean;
    slaapsak: boolean;
    kampToerusting: boolean;
  };
  noodvoorraad: {
    kos: number;
    water: number;
    brandstof: number;
    medies: boolean;
  };
}

export interface DependentInfo {
  id?: string;
  fullName: string;
  idNommer?: string;
  geboorteDatum?: string;
  ouderdom?: number;
  geslag?: string;
  verhouding: string; // Seun/Dogter/Maat/Ander
  allergies?: string;
  chronies?: string;
  medikasie?: string;
  notas?: string;
}

export interface CampInfo {
  kampProvinsie: string;
  kampNaam: string;
  datumInKamp: string;
}

export interface OtherInfo {
  addisioneleNotas?: string;
  spesialeVaardighede?: string;
  belangstellings?: string;
  beskikbaarheid?: string;
  vrywilligerWerk?: string;
}

export interface StoredFileMeta {
  name: string;
  size: number;
  type: string;
  path: string;
}

export interface DocumentsInfo {
  idDokument: StoredFileMeta[];
  bestuurslisensie: StoredFileMeta[];
  vuurwapenlisensie: StoredFileMeta[];
  ehboSertifikaat: StoredFileMeta[];
  ander: StoredFileMeta[];
}

export interface CompleteFormData {
  basicInfo: BasicInfo;
  memberInfo: MemberInfo;
  addressInfo: AddressInfo;
  medicalInfo: MedicalInfo;
  vehicleInfo: VehicleInfo;
  skillsInfo: SkillsInfo;
  equipmentInfo: EquipmentInfo;
  campInfo: CampInfo;
  otherInfo: OtherInfo;
  documentsInfo: DocumentsInfo;
  dependents?: DependentInfo[];
}
