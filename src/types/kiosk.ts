export interface Organization {
  name: string;
}

export interface PatientCredentials {
  encounter_id: string;
  birth_year?: string;
  phone_number?: string;
}

export interface Patient {
  id: string;
  name: string;
  gender: string;
  phone_number: string;
  date_of_birth: string;
  blood_group: string;
  year_of_birth: number;
}

export interface Facility {
  id: string;
  name: string;
}

export interface Encounter {
  id: string;
  status: string;
  encounter_class: string;
  period: { start: string };
  priority: string;
  external_identifier: string | null;
  discharge_summary_advice: string | null;
  patient: Patient;
  facility: Facility;
  created_date: string;
  modified_date: string;
  tags: string[];
  current_location: string | null;
  care_team: unknown[];
  organizations?: Organization[];
  feedback_given?: boolean;
}
