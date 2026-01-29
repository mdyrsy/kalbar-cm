import type { Metadata } from "next";
import RegisterScreen from "@/components/screen/auth/register-screen";

export const metadata: Metadata = {
  title: "Daftar Akun",
  description: "Pendaftaran akun baru sistem manajemen.",
};

export default function Page() {
  return <RegisterScreen />;
}