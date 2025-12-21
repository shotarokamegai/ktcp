"use client";

import React from "react";
import SplittingSpan from "@/components/SplittingSpan";

type Props = {
  text: string;
  href?: string;
  icon?: React.ReactNode;
  as?: "a" | "button";
  onClick?: () => void;
  className?: string;
};

export default function InteractiveButton({
  text,
  href,
  icon,
  as = "a",
  onClick,
  className = "",
}: Props) {
  const Tag = as;

  return (
    <Tag
      href={as === "a" ? href : undefined}
      onClick={onClick}
      className={[
        "c-button splitting-hover icon-hover",
        className,
      ].join(" ")}
    >
      {/* ===== Label ===== */}
      <span className="c-button__label splitting-hover__inner">
        <SplittingSpan text={text} />
        <SplittingSpan text={text} />
      </span>

      {/* ===== Icon ===== */}
      {icon && (
        <span className="c-button__icon">
          <span className="c-button__icon-inner">
            <span className="icon">{icon}</span>
            <span className="icon">{icon}</span>
          </span>
        </span>
      )}
    </Tag>
  );
}
