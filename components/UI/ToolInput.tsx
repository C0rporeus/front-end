import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

const BASE_STYLE = "rounded-lg border border-slate-600 bg-surface-900/80 text-text-primary";

type ToolInputProps = InputHTMLAttributes<HTMLInputElement> & {
  wrapperClassName?: string;
};

type ToolTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

type ToolSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const ToolInput = ({ className = "", ...rest }: ToolInputProps) => (
  <input className={`${BASE_STYLE} p-2 ${className}`} {...rest} />
);

export const ToolTextarea = ({ className = "", ...rest }: ToolTextareaProps) => (
  <textarea className={`${BASE_STYLE} p-3 ${className}`} {...rest} />
);

export const ToolSelect = ({ className = "", children, ...rest }: ToolSelectProps) => (
  <select className={`${BASE_STYLE} px-3 py-2 ${className}`} {...rest}>
    {children}
  </select>
);
