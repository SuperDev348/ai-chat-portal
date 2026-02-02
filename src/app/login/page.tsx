"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { WarpSpeedLogo } from "@/components/WarpSpeedLogo";
import { MobileHeader } from "@/components/MobileHeader";
import {
  CalendarIcon,
  PencilIcon,
  ClockIcon,
  CheckIcon,
  PaperclipIcon,
  MicIcon,
  SendIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  AppleIcon,
} from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/chat";
  const errorParam = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "CredentialsSignin"
      ? "Invalid email or password."
      : errorParam === "SessionRequired"
        ? "Please sign in to continue."
        : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    setError(null);
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <MobileHeader showMenu={true} />
      <div
          className="relative hidden min-h-[50vh] w-full flex-col justify-center p-12 lg:flex lg:min-h-screen lg:w-1/2"
          style={{
            background: "transparent linear-gradient(144deg, #531CB3 0%, #006C67 100%) 0% 0% no-repeat padding-box",
          }}
        >
        <div className="relative mx-auto w-full max-w-md">
          <div
            className="absolute -left-[35px] -top-[35px] flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-white shadow-md dark:from-slate-700 dark:to-slate-800"
            style={{ border: "1px solid #2F2F4B", zIndex: 1 }}
            aria-hidden
          >
            <CalendarIcon className="h-7 w-7 text-slate-700 dark:text-slate-300" />
          </div>
          <div
            className="absolute flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-white shadow-md dark:from-slate-700 dark:to-slate-800"
            style={{ border: "1px solid #2F2F4B", zIndex: 1, top: 35, right: -35 }}
            aria-hidden
          >
            <PencilIcon className="h-7 w-7 text-slate-700 dark:text-slate-300" />
          </div>
          <div
            className="absolute flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-white shadow-md dark:from-slate-700 dark:to-slate-800"
            style={{ border: "1px solid #2F2F4B", zIndex: 1, left: -35, bottom: 35 }}
            aria-hidden
          >
            <ClockIcon className="h-7 w-7 text-slate-700 dark:text-slate-300" />
          </div>
          <div
            className="absolute -bottom-[35px] -right-[35px] flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-white shadow-md dark:from-slate-700 dark:to-slate-800"
            style={{ border: "1px solid #2F2F4B", zIndex: 1 }}
            aria-hidden
          >
            <CheckIcon className="h-7 w-7 text-slate-700 dark:text-slate-300" />
          </div>
          <div className="relative rounded-2xl bg-white/95 p-12 shadow-xl">
            <div className="px-6 pb-4">
              <p className="mb-1 text-lg text-center font-bold text-slate-900">
                AI Powered by <span className="italic text-violet-600">your life</span> to help your daily routine.
              </p>
              <p className="mb-4 text-sm text-center text-slate-600">
                warpSpeed is the most personal AI partner, designed to improve your productivity
              </p>
            </div>
            <div className="pt-4">
              <p className="text-center text-2xl text-slate-700">Hello there!</p>
            </div>
            <div className="flex items-center justify-center my-4">
              <div className="w-40 h-3 rounded-full bg-slate-200"></div>
            </div>
            <div>
              <div className="h-3 rounded-full bg-slate-200"></div>
            </div>
            <div className="flex items-center justify-center my-4">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" style={{ width: 'calc(100% - 60px)'}}>
                <span className="text-slate-400">Ask me Anything</span>
                <div className="ml-auto flex items-center gap-1">
                  <button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-200" aria-label="Attachment">
                    <PaperclipIcon className="h-5 w-5" />
                  </button>
                  <button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-200" aria-label="Microphone">
                    <MicIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <button type="button" className="rounded-full p-1.5 text-white mx-2" style={{ backgroundColor: '#006C67' }} aria-label="Send">
                <SendIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 w-full flex-col items-center justify-center bg-white px-4 py-8 sm:px-6 sm:py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center lg:mb-8">
            <div className="hidden lg:block">
              <WarpSpeedLogo className="h-10 w-10" />
            </div>
            <div className="lg:hidden">
              <WarpSpeedLogo className="h-20 w-20 sm:h-24 sm:w-24" />
            </div>
          </div>
          <h1 className="mb-2 text-center text-xl font-bold text-slate-900 sm:text-2xl">
            <span className="hidden lg:inline">Let&apos;s get you started</span>
            <span className="lg:hidden">Sign in to access your AI partner</span>
          </h1>
          <p className="mb-6 hidden text-center text-sm text-slate-500 lg:mb-8 lg:block">
            Sign up to experience AI that actually understands your workflow
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="Enter Email ID"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter Password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-10 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-medium text-white disabled:opacity-50 cursor-pointer"
              style={{background: '#006C67 0% 0% no-repeat padding-box', borderRadius: '50px'}}
            >
              {loading ? "Signing in…" : "Login"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">Or</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <GoogleIcon className="h-5 w-5" /> Continue With Google
            </button>
            <button
              type="button"
              onClick={() => signIn("apple", { callbackUrl }).catch(() => {})}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <AppleIcon className="h-5 w-5" /> Continue With Apple
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            We respect your privacy. You can unlink your account anytime.
          </p>

          <p className="mt-4 text-center text-sm text-slate-600">
            <span className="hidden lg:inline">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-violet-600 underline hover:text-violet-700">
                Find out more
              </Link>
            </span>
            <span className="lg:hidden">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-teal-600 underline hover:text-teal-700">
                Download our app
              </Link>
              {" "}
              to create an account and join the productivity revolution.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
