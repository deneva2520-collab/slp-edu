"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import JoinContent from "./JoinContent";

export default function JoinPage() {
  return (
    <Suspense fallback={<div>Зареждане...</div>}>
      <JoinContent />
    </Suspense>
  );
}