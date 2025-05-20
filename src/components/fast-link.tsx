"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

type FastLinkProps = LinkProps & {
  children: React.ReactNode;
  className?: string;
};

/**
 * This component is a wrapper around the Next.js Link component.
 *
 * It achieves seemingly faster navigation by navigating on the mouse down event
 * instead of the click event.
 */
export const FastLink = React.forwardRef<HTMLAnchorElement, FastLinkProps>(
  ({ className, children, ...props }, ref) => {
    const router = useRouter();

    function handleMouseDown(e: React.MouseEvent<HTMLAnchorElement>) {
      e.preventDefault();
      router.push(props.href.toString());
    }

    function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
      e.preventDefault();
      props.onClick?.(e);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLAnchorElement>) {
      if (e.key === "Enter") {
        router.push(props.href.toString());
      }
    }

    return (
      <Link
        ref={ref}
        {...props}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={className}
      >
        {children}
      </Link>
    );
  }
);

FastLink.displayName = "FastLink";
