'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldBan, ArrowRight } from "lucide-react";

export function RegisterRestriction() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  useEffect(() => {
    if (seconds === 0) {
      router.push('/auth/login');
    }
  }, [seconds, router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#FAFAFA] p-4 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-[#1C2A55]/5 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-[#DA061A]/5 blur-[100px]" />

      <div className="w-full max-w-[480px] animate-in fade-in zoom-in duration-500 relative z-10">
        <div className="relative overflow-hidden rounded-3xl bg-white px-10 py-12 text-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] ring-1 ring-gray-100">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1C2A55] via-[#DA061A] to-[#F4050D]" />

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4050D]/10">
            <ShieldBan className="h-8 w-8 text-[#F4050D]" />
          </div>

          <h2 className="text-2xl font-black text-[#1C2A55]">
            Pendaftaran Ditutup
          </h2>
          
          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            Mohon maaf, pendaftaran akun baru sedang dinonaktifkan oleh administrator. Anda akan dialihkan otomatis.
          </p>

          <div className="my-8 rounded-xl bg-gray-50 py-6 border border-gray-100">
            <span className="text-5xl font-black text-[#DA061A] tabular-nums">
              {seconds}
            </span>
            <span className="block mt-1 text-xs font-bold text-gray-400 uppercase tracking-widest">
              Detik
            </span>
          </div>

          <Link
            href="/auth/login"
            className="group flex w-full items-center justify-center rounded-xl bg-[#1C2A55] py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#0F172A] hover:shadow-xl active:scale-[0.98]"
          >
            Ke Halaman Login <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}