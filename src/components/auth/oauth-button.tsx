"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import LastUsedIndicator from "./last-used-indicator";

export default function OAuthButton({
  provider,
  title,
}: {
  provider: string;
  title: string;
}) {
  return (
    <Button
      type="submit"
      className="relative flex gap-2 w-full bg-white text-black hover:bg-gray-100 border"
      onClick={() => {
        localStorage.setItem("fyzz-auth-method", provider);
      }}
    >
      <Image
        src={`/${provider}.svg`}
        width="20"
        height="20"
        alt={title}
        className="pointer-events-none"
      />
      <span className="pointer-events-none">{title}</span>
      <LastUsedIndicator provider={provider} className="text-black sm:text-foreground" />
    </Button>
  );
}
