export type Row = Record<string, any>;
export type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "json" | "datetime" | "password";
  required?: boolean;
  max?: number;
  min?: number;
  default?: string | number;
  choices?: Record<string, string>;
};
export type ResourceMeta = {
  key: string;
  title: string;
  section: string;
  description: string;
  id: string;
  columns: { key: string; label: string }[];
  fields: Field[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
};
export type SessionUser = {
  id: number;
  name: string;
  displayName: string;
  group: string;
  superAdmin: boolean;
};
export type Bootstrap = {
  user: SessionUser;
  csrf: string;
  resources: ResourceMeta[];
  servers: {
    id: number;
    name: string;
    area: string;
    serverId: number;
    isClose: number;
  }[];
  permissions: string[];
  playerFields: Field[];
  rechargeProducts: { id: number; name: string; cost: number }[];
};
export type PageData = {
  rows: Row[];
  total: number;
  page: number;
  pageSize: number;
};
