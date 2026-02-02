"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MobileHeader } from "@/components/MobileHeader";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  PersonIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CameraIcon,
} from "@/components/icons";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

const inputErrorClass = " border-amber-500 focus:border-amber-500 focus:ring-amber-500";

function parseBirthdayToDateValue(value: string): string {
  if (!value || !value.trim()) return "";
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return "";
}

function validatePhone(phone: string): string | null {
  if (!phone || !phone.trim()) return null;
  const trimmed = phone.trim();
  let parsed = parsePhoneNumberFromString(trimmed);
  if (!parsed && !trimmed.startsWith("+")) {
    parsed = parsePhoneNumberFromString(trimmed, "US");
  }
  if (!parsed || !parsed.isValid()) {
    return "Please enter a valid phone number (e.g. +1 555 123 4567 or 555 123 4567).";
  }
  return null;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    image: "",
    phone: "",
    birthday: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status !== "authenticated") return;
    (async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        const nameParts = (data.name || "").trim().split(/\s+/);
        const firstName = data.firstName ?? nameParts[0] ?? "";
        const lastName = data.lastName ?? (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
        setProfile({
          firstName,
          lastName,
          email: data.email ?? "",
          image: data.image ?? "",
          phone: data.phone ?? "",
          birthday: parseBirthdayToDateValue(data.birthday ?? ""),
        });
      } catch {
        setError("Failed to load profile.");
      } finally {
        setFetching(false);
      }
    })();
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPhoneError(null);
    const phoneVal = profile.phone.trim();
    const phoneValidation = validatePhone(phoneVal);
    if (phoneValidation) {
      setPhoneError(phoneValidation);
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, string | null | undefined> = {
        firstName: profile.firstName.trim() || undefined,
        lastName: profile.lastName.trim() || undefined,
        name: [profile.firstName.trim(), profile.lastName.trim()].filter(Boolean).join(" ") || undefined,
        image: profile.image.trim() || null,
        phone: phoneVal ? phoneVal : null,
        birthday: profile.birthday.trim() ? profile.birthday.trim() : null,
      };
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to update profile.");
        return;
      }
      await update({
        name: [profile.firstName.trim(), profile.lastName.trim()].filter(Boolean).join(" ") || null,
        image: profile.image.trim() || null,
      });
      router.push("/chat");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <MobileHeader onMenuClick={() => router.push("/chat")} />
      <div className="mx-auto max-w-md px-4 pb-8 pt-6">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {profile.image ? (
              <img
                src={profile.image}
                alt=""
                className="h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-teal-100 text-4xl font-medium text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                {(profile.firstName || profile.lastName || session?.user?.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                const url = window.prompt("Enter profile image URL:");
                if (url != null) setProfile((p) => ({ ...p, image: url.trim() }));
              }}
              className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500 text-white shadow-md hover:bg-violet-600"
              aria-label="Change profile photo"
            >
              <CameraIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {fetching ? (
          <p className="text-center text-sm text-slate-500">Loading profile…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400">
                <PersonIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <label htmlFor="first-name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  First Name
                </label>
                <input
                  id="first-name"
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                  className={inputClass}
                  placeholder="John"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400">
                <PersonIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <label htmlFor="last-name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Last Name
                </label>
                <input
                  id="last-name"
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                  className={inputClass}
                  placeholder="Collins"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400">
                <EnvelopeIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  readOnly
                  className={inputClass + " cursor-not-allowed bg-slate-100 dark:bg-slate-700"}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400">
                <PhoneIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => {
                    setProfile((p) => ({ ...p, phone: e.target.value }));
                    setPhoneError(null);
                  }}
                  className={inputClass + (phoneError ? inputErrorClass : "")}
                  placeholder="555 245 5035"
                  aria-invalid={!!phoneError}
                  aria-describedby={phoneError ? "phone-error" : undefined}
                />
                {phoneError && (
                  <p id="phone-error" className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                    {phoneError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <label htmlFor="birthday" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Birthday
                </label>
                <input
                  id="birthday"
                  type="date"
                  value={profile.birthday}
                  onChange={(e) => setProfile((p) => ({ ...p, birthday: e.target.value }))}
                  className={inputClass}
                  max={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full py-3.5 text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: "#006C67" }}
              >
                {loading ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center">
          <Link
            href="/chat"
            className="text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Back to Chat
          </Link>
        </p>
      </div>
    </div>
  );
}
