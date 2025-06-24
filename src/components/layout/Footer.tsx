import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  return (
    <>
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-700 font-semibold mb-2 md:mb-0">
              ImobiFlow — Powered by Vendramini Informática | © {new Date().getFullYear()}
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-500">Versão 1.6.3</span>
              <button 
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                onClick={() => setShowTerms(true)}
              >
                Termos de Uso
              </button>
              <button 
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                onClick={() => setShowPrivacyPolicy(true)}
              >
                Política de Privacidade
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Termos de Uso */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Termos de Uso</h2>
                <button 
                  onClick={() => setShowTerms(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-sm text-gray-700 space-y-4">
                <p className="text-gray-500 mb-6">Última atualização: 23 de maio de 2025</p>
                
                <p className="mb-4">
                  Bem-vindo ao ImobiFlow, um sistema de gerenciamento (CRM) e dashboard desenvolvido para o setor imobiliário, fornecido por Vendramini Informática.
                </p>
                
                <p className="mb-6">
                  Ao acessar ou utilizar este sistema, você concorda com os seguintes termos de uso:
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">1. Acesso ao Sistema</h3>
                    <p>O acesso ao ImobiFlow é restrito a usuários autorizados mediante credenciais fornecidas por administradores. É responsabilidade do usuário manter seus dados de acesso em segurança e não compartilhá-los com terceiros.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">2. Uso Permitido</h3>
                    <p>O sistema deve ser utilizado exclusivamente para fins comerciais relacionados à gestão imobiliária, como cadastro de imóveis, gerenciamento de leads, acompanhamento de negociações e geração de relatórios.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">3. Propriedade Intelectual</h3>
                    <p>Todo o conteúdo, código-fonte, interface e funcionalidades do sistema são de propriedade exclusiva da Vendramini Informática. É proibida a reprodução, modificação ou redistribuição sem autorização prévia por escrito.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">4. Privacidade e Dados</h3>
                    <p>Os dados inseridos no sistema são de responsabilidade do usuário e/ou da empresa contratante. A Vendramini Informática se compromete a manter a confidencialidade das informações, conforme sua Política de Privacidade.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">5. Acesso aos Dados de Clientes</h3>
                    <p>Apenas usuários autorizados pela empresa contratante poderão acessar os dados de clientes cadastrados no sistema. Cada empresa é responsável por definir os níveis de acesso de seus colaboradores, garantindo que apenas pessoas com permissão adequada possam visualizar, editar ou excluir dados sensíveis.</p>
                    <p>A Vendramini Informática não acessa nem utiliza dados de clientes cadastrados, salvo quando expressamente autorizado pela empresa contratante para fins de suporte técnico, correção de erros ou auditoria de segurança.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">6. Responsabilidades</h3>
                    <p className="mb-2">A Vendramini Informática não se responsabiliza por:</p>
                    <ul className="list-disc pl-6 space-y-1 mb-2">
                      <li>Danos causados por mau uso do sistema;</li>
                      <li>Perda de dados devido à negligência do usuário;</li>
                      <li>Falhas temporárias de acesso causadas por manutenção, atualizações ou fatores externos.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">7. Suporte Técnico</h3>
                    <p>O suporte ao sistema está disponível nos canais oficiais da Vendramini Informática, durante o horário comercial, para resolução de problemas, dúvidas e sugestões.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">8. Alterações nos Termos</h3>
                    <p>Estes Termos de Uso podem ser alterados a qualquer momento. As alterações entrarão em vigor assim que publicadas nesta página. É responsabilidade do usuário revisar periodicamente este conteúdo.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">9. Aceitação dos Termos</h3>
                    <p>Ao continuar utilizando o ImobiFlow, você declara estar ciente e de acordo com os termos aqui descritos.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowTerms(false)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Política de Privacidade */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Política de Privacidade</h2>
                <button 
                  onClick={() => setShowPrivacyPolicy(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-sm text-gray-700 space-y-4">
                <p className="text-gray-500 mb-6">Última atualização: 13 de maio de 2025</p>
                
                <p className="mb-6">
                  A presente Política de Privacidade tem como objetivo esclarecer como coletamos, usamos, armazenamos e protegemos as informações fornecidas pelos usuários do sistema ImobiFlow, desenvolvido e mantido por Vendramini Informática.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">1. Coleta de Informações</h3>
                    <p>O sistema pode coletar os seguintes dados:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Informações de identificação (nome, e-mail, telefone);</li>
                      <li>Dados de login (usuário e senha);</li>
                      <li>Dados relacionados à atividade profissional (imóveis cadastrados, clientes, histórico de negociações);</li>
                      <li>Informações de navegação e uso do sistema (logs, tempo de sessão, IP).</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">2. Uso das Informações</h3>
                    <p>As informações coletadas têm como finalidade:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Permitir o funcionamento correto do sistema;</li>
                      <li>Personalizar a experiência do usuário;</li>
                      <li>Gerar relatórios e análises de uso;</li>
                      <li>Oferecer suporte técnico;</li>
                      <li>Cumprir obrigações legais e contratuais.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">3. Compartilhamento de Dados</h3>
                    <p>A Vendramini Informática não compartilha, vende ou aluga dados pessoais a terceiros, exceto quando:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Houver consentimento do usuário;</li>
                      <li>For exigido por autoridade legal ou judicial;</li>
                      <li>Seja necessário para prestação de serviços por parceiros sob cláusula de confidencialidade.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">4. Armazenamento e Segurança</h3>
                    <p>Os dados são armazenados em servidores protegidos, com práticas de segurança adequadas (criptografia, backups regulares, controle de acesso).</p>
                    <p className="mt-2">Embora adotemos medidas de segurança rígidas, nenhum sistema é 100% imune a riscos. O usuário também é responsável por manter suas credenciais seguras.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">5. Retenção de Dados</h3>
                    <p>Os dados serão mantidos enquanto o contrato estiver ativo ou enquanto forem necessários para os fins propostos. Após esse período, serão excluídos de forma segura.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">6. Direitos do Usuário</h3>
                    <p>O usuário pode a qualquer momento:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Solicitar acesso aos seus dados;</li>
                      <li>Solicitar a correção ou exclusão de informações;</li>
                      <li>Revogar o consentimento de uso dos dados;</li>
                      <li>Solicitar portabilidade dos dados, se aplicável.</li>
                    </ul>
                    <p className="mt-2">Para exercer esses direitos, entre em contato pelo e-mail: <a href="mailto:vendraminiinformatica.contato@gmail.com" className="text-blue-600 hover:underline">vendraminiinformatica.contato@gmail.com</a></p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">7. Cookies e Dados de Navegação</h3>
                    <p>O sistema pode utilizar cookies estritamente funcionais para manter a sessão do usuário ativa. Não são utilizados cookies de rastreamento comercial.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">8. Alterações na Política</h3>
                    <p>Esta Política pode ser atualizada a qualquer momento. Recomendamos que o usuário revise este documento periodicamente.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">9. Contato</h3>
                    <p>Dúvidas sobre esta Política de Privacidade podem ser encaminhadas para:</p>
                    <div className="mt-2 space-y-1">
                      <p>📧 <a href="mailto:vendraminiinformatica.contato@gmail.com" className="text-blue-600 hover:underline">vendraminiinformatica.contato@gmail.com</a></p>
                      <p>📍 Vendramini Informática — Piracicaba/SP</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowPrivacyPolicy(false)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
