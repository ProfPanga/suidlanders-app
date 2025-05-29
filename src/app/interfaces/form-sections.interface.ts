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
  ehboKwalifikasie: boolean;
  ehboVlak?: string;
  ehboVervalDatum?: string;
}

export interface AddressInfo {
  straatAdres: string;
  voorstad: string;
  stad: string;
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
}

export interface VehicleInfo {
  primereVoertuig: {
    fabrikaat: string;
    model: string;
    jaar: number;
    registrasieNommer: string;
    brandstofTipe: string;
    kilometerStand: number;
    bandeToestand: string;
  };
  sekondereVoertuig: {
    fabrikaat: string;
    model: string;
    jaar: number;
    registrasieNommer: string;
    brandstofTipe: string;
    kilometerStand: number;
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

export interface DocumentsInfo {
  idDokument?: File;
  bestuurslisensie?: File;
  vuurwapenlisensie?: File;
  ehboSertifikaat?: File;
  ander: File[];
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
} 