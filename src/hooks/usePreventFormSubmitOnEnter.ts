import { KeyboardEvent, useCallback } from 'react';

interface UsePreventFormSubmitOnEnterProps {
  /**
   * Se true, impede o envio do formulário ao pressionar Enter
   * @default true
   */
  preventSubmitOnEnter?: boolean;
  
  /**
   * Se true, permite que o Enter em textareas crie uma nova linha
   * @default true
   */
  allowNewLineInTextarea?: boolean;
  
  /**
   * Se true, move o foco para o próximo campo ao pressionar Enter
   * @default true
   */
  focusNextOnEnter?: boolean;
}

/**
 * Hook para evitar o envio do formulário ao pressionar Enter
 * e fornecer outras funcionalidades úteis para formulários
 */
export const usePreventFormSubmitOnEnter = ({
  preventSubmitOnEnter = true,
  allowNewLineInTextarea = true,
  focusNextOnEnter = true,
}: UsePreventFormSubmitOnEnterProps = {}) => {
  /**
   * Manipulador de evento para onKeyDown que previne o envio do formulário
   * ao pressionar Enter, a menos que seja em um textarea ou botão
   */
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLElement>) => {
    if (!preventSubmitOnEnter || e.key !== 'Enter') {
      return;
    }

    const target = e.target as HTMLElement;
    
    // Permite Enter em textareas (para quebra de linha)
    if (allowNewLineInTextarea && target.tagName === 'TEXTAREA') {
      return;
    }
    
    // Permite Enter em botões e inputs do tipo submit/button
    if (['BUTTON', 'INPUT'].includes(target.tagName)) {
      const inputTarget = target as HTMLInputElement;
      if (['submit', 'button', 'reset'].includes(inputTarget.type)) {
        return;
      }
    }
    
    // Previne o comportamento padrão do Enter
    e.preventDefault();
    
    // Se habilitado, move o foco para o próximo elemento
    if (focusNextOnEnter && 'form' in target && target.form) {
      const form = target.form as HTMLFormElement;
      const formElements = Array.from(form.elements).filter(
        (el): el is HTMLElement => 
          el instanceof HTMLElement && 
          !el.hasAttribute('disabled') &&
          !el.getAttribute('readonly') &&
          (el.tagName === 'INPUT' || 
           el.tagName === 'TEXTAREA' || 
           el.tagName === 'SELECT' ||
           'isContentEditable' in el) // Verificação segura para isContentEditable
      );
      
      const currentIndex = formElements.indexOf(target);
      if (currentIndex < formElements.length - 1) {
        formElements[currentIndex + 1].focus();
      } else if (currentIndex === formElements.length - 1) {
        // Se for o último campo, não faz nada
        // Ou você pode adicionar um comportamento personalizado aqui
      }
    }
  }, [preventSubmitOnEnter, allowNewLineInTextarea, focusNextOnEnter]);
  
  return {
    onKeyDown: handleKeyDown,
    preventSubmitOnEnterProps: {
      onKeyDown: handleKeyDown,
    },
  };
};

export default usePreventFormSubmitOnEnter;
