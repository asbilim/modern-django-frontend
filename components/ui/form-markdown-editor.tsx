"use client";

import "easymde/dist/easymde.min.css";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Controller } from "react-hook-form";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

interface FormMarkdownEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export function FormMarkdownEditor({
  label,
  value,
  onChange,
  required,
  disabled,
}: FormMarkdownEditorProps) {
  const options = useMemo(() => {
    return {
      autofocus: false,
      spellChecker: false,
      // You can add more options here
    };
  }, []);

  return (
    <div>
      <label className="form-label">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
        <SimpleMDE value={value} onChange={onChange} options={options} />
      </div>
    </div>
  );
}
