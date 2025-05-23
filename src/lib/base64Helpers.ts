/**
 * Funções auxiliares para trabalhar com arquivos em Base64
 * Esta abordagem evita problemas de RLS no Storage do Supabase
 */

import { supabase } from './supabase';

/**
 * Converte um arquivo para string Base64
 * @param file Arquivo a ser convertido
 * @returns Promise com a string Base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Salva um documento no banco de dados usando Base64
 * @param clientId ID do cliente
 * @param file Arquivo a ser salvo
 * @param documentType Tipo do documento
 * @param description Descrição do documento
 * @returns Promise com os dados do documento salvo
 */
export const saveDocumentAsBase64 = async (
  clientId: string,
  file: File,
  documentType: string,
  description: string
): Promise<{ data: any; error: any }> => {
  try {
    console.log('Iniciando conversão do arquivo para Base64...');
    
    // Converter o arquivo para Base64
    const base64String = await fileToBase64(file);
    
    console.log('Arquivo convertido para Base64 com sucesso');
    
    // Gerar um nome único para o arquivo
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 7);
    const fileName = `${timestamp}-${randomId}.pdf`;
    
    // Criar o objeto de documento
    const documentData = {
      client_id: clientId,
      document_type: documentType,
      description: description,
      file_name: file.name,
      file_url: 'base64://' + fileName, // URL fictícia para compatibilidade
      file_path: fileName,
      file_size: file.size, // Adicionar o tamanho do arquivo
      file_type: file.type, // Adicionar o tipo do arquivo
      file_content: base64String, // Armazenar o conteúdo Base64
      created_at: new Date().toISOString()
    };
    
    console.log('Salvando documento no banco de dados...');
    
    // Inserir o documento no banco de dados
    const { data, error } = await supabase
      .from('client_documents')
      .insert(documentData)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao salvar documento:', error);
      return { data: null, error };
    }
    
    console.log('Documento salvo com sucesso:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao processar documento:', error);
    return { 
      data: null, 
      error: { 
        message: 'Erro ao processar documento', 
        details: error 
      } 
    };
  }
};

/**
 * Obtém o conteúdo Base64 de um documento
 * @param documentId ID do documento
 * @returns Promise com o conteúdo Base64
 */
export const getDocumentBase64 = async (documentId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('client_documents')
      .select('file_content')
      .eq('id', documentId)
      .single();
    
    if (error || !data) {
      console.error('Erro ao obter documento:', error);
      return null;
    }
    
    return data.file_content;
  } catch (error) {
    console.error('Erro ao obter documento:', error);
    return null;
  }
};

/**
 * Exclui um documento do banco de dados
 * @param documentId ID do documento
 * @returns Promise com o resultado da exclusão
 */
export const deleteDocumentBase64 = async (documentId: string): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('client_documents')
      .delete()
      .eq('id', documentId);
    
    return { error };
  } catch (error) {
    return { error };
  }
};
