export interface Role {
  id: number;
  name: string;
}

export interface Client {
  // Nota: en frontend usamos `string` para IDs (incluye UUID).
  // Beneficio: evita depender de `crypto.UUID` (tipo de Node) en archivos cliente.
  // Si tu tabla usa UUID en Supabase, seguirá llegando como string y no rompe.
  id: string;
  name: string;
}

export type UserCategory = 'employee' | 'external';

export interface CreateUserFormData {
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  cliente: string;
  clienteNombre: string;
  contraseña: string;
}

export const INITIAL_FORM_DATA: CreateUserFormData = {
  nombre: '',
  apellido: '',
  email: '',
  rol: '',
  cliente: '',
  clienteNombre: '',
  contraseña: '',
};

export const NEW_CLIENT_SENTINEL = '__new__';
