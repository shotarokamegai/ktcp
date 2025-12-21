"use client";

import SplittingSpan from "@/components/SplittingSpan";
import Arrow from "@/components/svg/Arrow";
import clsx from "clsx";

type ButtonSubmitProps = {
  href?: string;
  text: string;
  icon?: React.ReactNode;
  className?: string;
};

export default function ButtonSubmit({
  href = "#",
  text,
  icon,
  className,
}: ButtonSubmitProps) {
  return (
    <a
      href={href}
      className={clsx(
        "btn-submit splitting-hover icon-hover",
        className
      )}
    >
      {/* テキスト */}
      <span className="splitting-hover__inner">
        <SplittingSpan text={text} />
        <SplittingSpan text={text} />
      </span>

      {/* アイコン */}
      <span className="btn-submit__icon">
        <span className="icon-content__inner">
          <span className="icon">{icon ?? <Arrow />}</span>
          <span className="icon">{icon ?? <Arrow />}</span>
        </span>
      </span>
    </a>
  );
}
