import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center bg-[var(--jade-bg)] text-[var(--jade-text)]">
          Loading...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
