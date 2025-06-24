import React, { FormHTMLAttributes } from 'react';
import { usePreventFormSubmitOnEnter } from '@/hooks/usePreventFormSubmitOnEnter';

interface CustomFormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  preventSubmitOnEnter?: boolean;
}

const CustomForm: React.FC<CustomFormProps> = ({
  children,
  onSubmit,
  preventSubmitOnEnter = true,
  ...props
}) => {
  const { onKeyDown } = usePreventFormSubmitOnEnter({
    preventSubmitOnEnter,
    allowNewLineInTextarea: true,
    focusNextOnEnter: true
  });

  return (
    <form 
      onSubmit={onSubmit} 
      onKeyDown={onKeyDown}
      {...props}
    >
      {children}
    </form>
  );
};

export default CustomForm;
