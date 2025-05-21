export type DocumentType = 
  | 'CERTIDAO_ESTADO_CIVIL'
  | 'COMPROVANTE_RESIDENCIA'
  | 'CARTEIRA_TRABALHO'
  | 'EXTRATO_BANCARIO'
  | 'EXTRATO_FGTS'
  | 'SIMULACAO'
  | 'FICHA_CAIXA'
  | 'CONTRATO'
  | 'IDENTIFICACAO'
  | 'COMPROVANTE_RENDA'
  | 'OUTROS';

export interface ClientDocument {
  id: string;
  client_id: string;
  document_type: DocumentType;
  file_name: string;
  file_url: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
  description?: string;
}
