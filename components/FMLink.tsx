"use client";

import Link from "next/link";
import React, { forwardRef } from "react";

type Props = React.ComponentProps<typeof Link>;

const FMLink = forwardRef<HTMLAnchorElement, Props>(
  ({ href, onClick, ...rest }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      onClick?.(e as any);

      window.dispatchEvent(
        new CustomEvent("fm:start", {
          detail: { href },
        })
      );
    };

    return (
      <Link
        href={href}
        onClick={handleClick}
        ref={ref}
        {...rest}
      />
    );
  }
);

FMLink.displayName = "FMLink";

export default FMLink;
