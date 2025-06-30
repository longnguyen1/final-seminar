import React from "react";

export function ScrollArea({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ overflowY: "auto", maxHeight: 400, ...style }}>
      {children}
    </div>
  );
}