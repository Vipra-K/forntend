"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/eziyo/login");
  }, [router]);

  return null;
}
