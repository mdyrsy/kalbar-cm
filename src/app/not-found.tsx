import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-4 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-[#1C2A55]/5 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-[#DA061A]/5 blur-[100px]" />
      <div className="w-full max-w-[480px] animate-in fade-in zoom-in duration-500 relative z-10">
        <div className="relative overflow-hidden rounded-3xl bg-white px-10 py-12 text-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] ring-1 ring-gray-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1C2A55] via-[#DA061A] to-[#F4050D]" />
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#1C2A55]/5 text-[#1C2A55]">
            <FileQuestion size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-[#1C2A55] mb-2">404</h1>
          <h2 className="text-xl font-bold text-[#363636]">Halaman Tidak Ditemukan</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            Maaf, halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau link yang Anda tuju salah.
          </p>
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="group flex w-full items-center justify-center rounded-xl bg-[#1C2A55] py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#0F172A] hover:shadow-xl active:scale-[0.98]"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
        <p className="mt-8 text-center text-xs font-medium text-gray-400">
          &copy; {new Date().getFullYear()} Kalbar Management System
        </p>
      </div>
    </div>
  );
}