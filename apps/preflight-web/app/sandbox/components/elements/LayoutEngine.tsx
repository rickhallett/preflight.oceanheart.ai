"use client";

import type React from "react";
import type { LayoutConfig } from "../../types";

interface LayoutEngineProps {
  layout: LayoutConfig;
  children: React.ReactNode;
  className?: string;
}

export const LayoutEngine: React.FC<LayoutEngineProps> = ({
  layout,
  children,
  className = "",
}) => {
  const getLayoutStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      display: "flex",
      flexDirection: layout.direction || "column",
    };

    if (layout.gap !== undefined) {
      styles.gap = `${layout.gap}px`;
    }

    if (layout.padding) {
      styles.padding = layout.padding;
    }

    if (layout.flex) {
      styles.flex = layout.flex;
    }

    return styles;
  };

  return (
    <div className={`${className}`} style={getLayoutStyles()}>
      {children}
    </div>
  );
};
