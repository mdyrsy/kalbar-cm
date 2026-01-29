export type UserRole =
  | 'super_admin'
  | 'account_manager';

export type UserSegment =
  | 'government_service'
  | 'business_service'
  | 'enterprise_service'
  | 'PRQ';

export type PeriodType =
  | 'weekly'
  | 'monthly'
  | 'yearly';

export type UUID = string;
export type Timestamp = string;

export interface User {
  id: UUID;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  segment: UserSegment;
  last_login: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
}

export interface ServiceType {
  id: UUID;
  name: string;
  created_by: UUID | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
}

export interface Service {
  id: UUID;
  name: string;
  service_type_id: UUID | null;
  created_by: UUID | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
}

export interface ContractProgress {
  id: UUID;
  name: string;
  description: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ContractType {
  id: UUID;
  name: string;
  created_by: UUID | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Contract {
  id: UUID;
  segment: UserSegment;
  pic_user_id: UUID | null;
  service_id: UUID | null;
  contract_type_id: UUID | null;
  contract_progress_id: UUID | null;
  contract_kind: string | null;
  customer_name: string;
  contract_number: string;
  contract_value: number;
  progress_note: string | null;
  payment_note: string | null;
  contract_date: string | null;
  created_by: UUID | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
}

export interface ContractLink {
  id: UUID;
  contract_id: UUID;
  label: string | null;
  url: string;
  is_primary: boolean;
  created_at: Timestamp;
}