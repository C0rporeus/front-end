import { HTMLAttributes, PropsWithChildren } from "react";

const BASE_STYLE =
  "rounded-lg border border-slate-600/80 bg-surface-900/80 p-3 text-text-secondary";

type ToolOutputProps = PropsWithChildren<HTMLAttributes<HTMLElement>> & {
  as?: "pre" | "div" | "ul" | "p";
};

const ToolOutput = ({
  as: Tag = "pre",
  className = "",
  children,
  ...rest
}: ToolOutputProps) => (
  <Tag className={`${BASE_STYLE} ${className}`} {...rest}>
    {children}
  </Tag>
);

export default ToolOutput;
