export enum UserRole {
  ADMIN = 'admin',
  SECRETARY = 'secretaria',
  FINANCE = 'financeiro',
  COORDINATOR = 'coordenacao'
}


export type JWTPayload = {
  sub: string, 
  role: UserRole,
}
