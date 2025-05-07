import React from 'react';

interface WhiteContainerProps {
  children: React.ReactNode;
}

export function WhiteContainer({ children }: WhiteContainerProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      {children}
    </div>
  );
}
