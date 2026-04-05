"use client";

import { useCallback, useEffect, useState } from "react";

export default function AdminAccessPage() {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [adminActionMessage, setAdminActionMessage] = useState("");
  const [adminUsers, setAdminUsers] = useState<
    { email: string; name?: string }[]
  >([]);
  const [superuserEmail, setSuperuserEmail] = useState("");
  const [adminListLoading, setAdminListLoading] = useState(true);
  const [isSuperuser, setIsSuperuser] = useState(false);

  const loadAdminAccess = useCallback(async () => {
    setAdminListLoading(true);
    try {
      const res = await fetch("/api/admin/access", { cache: "no-store" });
      const data = await res.json();
      const isSuper = Boolean(data?.isSuperuser);

      setIsSuperuser(isSuper);
      if (isSuper) {
        setAdminUsers(Array.isArray(data?.adminUsers) ? data.adminUsers : []);
        setSuperuserEmail(
          typeof data?.superuserEmail === "string" ? data.superuserEmail : "",
        );
      } else {
        setAdminUsers([]);
        setSuperuserEmail("");
      }
    } catch {
      setIsSuperuser(false);
      setAdminUsers([]);
      setSuperuserEmail("");
    }
    setAdminListLoading(false);
  }, []);

  useEffect(() => {
    loadAdminAccess();
  }, [loadAdminAccess]);

  const handleAdminAccess = async (
    action: "grant" | "revoke",
    targetEmail?: string,
  ) => {
    const email = targetEmail?.trim() || adminEmail.trim();
    if (!email) {
      setAdminActionMessage("Please enter an email address.");
      return;
    }

    setAdminActionLoading(true);
    setAdminActionMessage("");
    try {
      const res = await fetch("/api/admin/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAdminActionMessage(data?.error || "Unable to update access.");
      } else {
        setAdminActionMessage(
          action === "grant"
            ? "Admin access granted."
            : "Admin access revoked.",
        );
        if (!targetEmail) {
          setAdminEmail("");
        }
        await loadAdminAccess();
      }
    } catch (err) {
      console.error(err);
      setAdminActionMessage("Unable to update access.");
    }
    setAdminActionLoading(false);
  };

  if (adminListLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-[var(--jade-card)] p-8 rounded-2xl border border-[var(--jade-border)] shadow-sm">
          <p className="text-sm text-[var(--jade-muted)]">Loading access...</p>
        </div>
      </div>
    );
  }

  if (!isSuperuser) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-[var(--jade-card)] p-8 rounded-2xl border border-[var(--jade-border)] shadow-sm">
          <p className="text-sm text-[var(--jade-muted)]">
            You do not have permission to manage admin access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--jade-muted)] font-semibold">
          Admin Access
        </p>
        <h2 className="text-3xl font-serif text-[var(--jade-text)] mt-2">
          Manage Admin Permissions
        </h2>
        <p className="text-[var(--jade-muted)] font-medium tracking-tight mt-2">
          Grant or revoke admin panel access by email.
        </p>
      </div>

      <div className="bg-[var(--jade-card)] p-8 rounded-2xl border border-[var(--jade-border)] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="user@example.com"
            className="flex-1 px-4 py-2 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
          />
          <button
            onClick={() => handleAdminAccess("grant")}
            disabled={adminActionLoading}
            className="px-4 py-2 rounded-xl bg-[var(--color-jade-pink)] text-white font-semibold disabled:bg-[var(--jade-border)]"
          >
            Grant Access
          </button>
          <button
            onClick={() => handleAdminAccess("revoke")}
            disabled={adminActionLoading}
            className="px-4 py-2 rounded-xl border border-[var(--jade-border)] text-[var(--jade-text)] font-semibold disabled:text-[var(--jade-muted)]"
          >
            Revoke Access
          </button>
        </div>

        {adminActionMessage && (
          <p className="text-sm text-[var(--jade-muted)]">
            {adminActionMessage}
          </p>
        )}

        <div className="pt-4 border-t border-[var(--jade-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--jade-text)]">
              Admin Users
            </h3>
          </div>
          <div className="space-y-3">
            {superuserEmail && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--jade-border)] bg-[var(--jade-bg)]">
                <div>
                  <p className="text-sm font-semibold text-[var(--jade-text)]">
                    {superuserEmail}
                  </p>
                  <p className="text-xs text-[var(--jade-muted)]">Superuser</p>
                </div>
              </div>
            )}

            {adminUsers.length === 0 && (
              <p className="text-sm text-[var(--jade-muted)]">
                No additional admins yet.
              </p>
            )}

            {adminUsers.map((admin) => (
              <div
                key={admin.email}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 rounded-xl border border-[var(--jade-border)] bg-[var(--jade-bg)]"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--jade-text)]">
                    {admin.name || admin.email}
                  </p>
                  <p className="text-xs text-[var(--jade-muted)]">
                    {admin.email}
                  </p>
                </div>
                <button
                  onClick={() => handleAdminAccess("revoke", admin.email)}
                  disabled={adminActionLoading}
                  className="px-4 py-2 rounded-xl border border-[var(--jade-border)] text-[var(--jade-text)] font-semibold disabled:text-[var(--jade-muted)]"
                >
                  Revoke Access
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
