"use client";

import { Suspense } from "react";
import { UserAuthForm } from "@/components/user-auth-form";
import { SearchParamsFallback } from "@/components/search-params-fallback";

export function SuspenseUserAuthForm(props: React.ComponentProps<typeof UserAuthForm>) {
  return (
    <Suspense fallback={<SearchParamsFallback />}>
      <UserAuthForm {...props} />
    </Suspense>
  );
}
