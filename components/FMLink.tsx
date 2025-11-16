// components/FMLink.tsx
"use client";

import Link from "next/link";

type Props = React.ComponentProps<typeof Link>;

export default function FMLink({ href, onClick, ...rest }: Props) {
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
    <Link href={href} onClick={handleClick} {...rest} />
  );
}
