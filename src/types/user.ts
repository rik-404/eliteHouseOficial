export interface User {
  auth_id: string;
  id: string;
  broker_id: string | null;
  username: string;
  password: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: string;
  birth: string;
  emergency_contact: string;
  emergency_phone: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}
