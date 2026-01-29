import type { Metadata } from "next";
import LoginScreen from "@/components/screen/auth/login-screen";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Halaman login sistem manajemen Kalbar.",
};

export default function Page() {
  return <LoginScreen />;
}