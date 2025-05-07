import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface CodeEditorProps {
  id: string;
  language: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CodeEditor = ({
  id,
  language,
  value,
  onChange,
  placeholder = '',
  className = ''
}: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [monacoEditor, setMonacoEditor] = useState<any>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const initMonaco = async () => {
      const monaco = await import('monaco-editor');
      const editor = monaco.editor.create(editorRef.current!, {
        value,
        language,
        theme: theme === 'dark' ? 'vs-dark' : 'vs',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        lineHeight: 22,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        tabSize: 2,
        insertSpaces: true,
        lineNumbers: 'on',
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 3,
        renderLineHighlight: 'all',
        renderWhitespace: 'selection',
        formatOnPaste: true,
        formatOnType: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: {
          other: true,
          comments: true,
          strings: true,
        },
        placeholder,
      });

      setMonacoEditor(editor);

      editor.onDidChangeModelContent(() => {
        onChange(editor.getValue());
      });

      return editor;
    };

    initMonaco();

    return () => {
      if (monacoEditor) {
        monacoEditor.dispose();
      }
    };
  }, [value, language, theme, placeholder]);

  useEffect(() => {
    if (monacoEditor) {
      monacoEditor.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (monacoEditor) {
      monacoEditor.updateOptions({
        theme: theme === 'dark' ? 'vs-dark' : 'vs',
      });
    }
  }, [theme]);

  return (
    <div
      id={id}
      ref={editorRef}
      className={`min-h-[300px] ${className}`}
    />
  );
};

export { CodeEditor };
