'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { RegisterRestriction } from '@/components/ui/register-restriction'
import { useToast } from '@/components/ui/toast-provider'

export default function RegisterScreen() {
  const router = useRouter()
  const { showToast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})

  const isRegisterEnabled = process.env.NEXT_PUBLIC_ENABLE_REGISTER === 'true'

  if (!isRegisterEnabled) return <RegisterRestriction />

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setFieldErrors({})

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const errors: { [key: string]: string } = {}
    if (!name) errors.name = "Nama wajib diisi"
    if (!email) errors.email = "Email wajib diisi"
    if (!password) errors.password = "Password wajib diisi"
    else if (password.length < 8) errors.password = "Min. 8 karakter"

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      showToast('Mohon lengkapi data registrasi', 'error')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.error || 'Gagal mendaftar', 'error')
        setIsLoading(false)
      } else {
        showToast('Akun berhasil dibuat! Silakan login.', 'success')
        router.push('/auth/login')
      }
    } catch (error) {
      showToast('Terjadi kesalahan jaringan', 'error')
      setIsLoading(false)
    }
  }

  const inputClass = (error?: string) => `
    mt-1.5 block w-full rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200
    placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1
    ${error 
      ? 'border-[#F4050D] bg-[#F4050D]/5 text-[#F4050D] focus:border-[#DA061A] focus:ring-[#F4050D]/20' 
      : 'border-gray-200 bg-white hover:border-gray-300 focus:border-[#1C2A55] focus:ring-[#1C2A55]/10 text-[#363636]'}
  `

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-4 font-sans relative overflow-hidden">
      
      {/* --- UPDATE: BACKGROUND SHADOWS --- */}
      {/* Shadow Atas: #1D2A55 */}
      <div className="absolute top-[-10%] left-[-5%] h-[600px] w-[600px] rounded-full bg-[#1D2A55]/15 blur-[120px] pointer-events-none" />
      
      {/* Shadow Bawah: #F4060E */}
      <div className="absolute bottom-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-[#F4060E]/15 blur-[120px] pointer-events-none" />
      {/* ---------------------------------- */}

      <div className="w-full max-w-[480px] animate-in fade-in zoom-in duration-500 relative z-10">
        
        <div className="relative overflow-hidden rounded-3xl bg-white px-10 py-12 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] ring-1 ring-gray-100">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1C2A55] via-[#DA061A] to-[#F4050D]" />

          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black tracking-tight text-[#1C2A55]">Buat Akun</h2>
            <p className="mt-2 text-sm text-gray-500">Mulai manajemen layanan Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="ml-1 text-xs font-bold uppercase tracking-wider text-[#1C2A55]/70">Nama Lengkap</label>
              <input
                name="name"
                type="text"
                className={inputClass(fieldErrors.name)}
                placeholder="John Doe"
              />
              {fieldErrors.name && <p className="mt-1 ml-1 text-xs font-bold text-[#F4050D] animate-pulse">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="ml-1 text-xs font-bold uppercase tracking-wider text-[#1C2A55]/70">Email</label>
              <input
                name="email"
                type="email"
                className={inputClass(fieldErrors.email)}
                placeholder="nama@perusahaan.com"
              />
              {fieldErrors.email && <p className="mt-1 ml-1 text-xs font-bold text-[#F4050D] animate-pulse">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="ml-1 text-xs font-bold uppercase tracking-wider text-[#1C2A55]/70">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={inputClass(fieldErrors.password) + " pr-10"}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-[#1C2A55]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 ml-1 text-xs font-bold text-[#F4050D] animate-pulse">{fieldErrors.password}</p>}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full overflow-hidden rounded-xl bg-[#1C2A55] py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#0F172A] hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
              >
                <div className="flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <span>Daftar Sekarang</span>}
                </div>
              </button>
            </div>

            <p className="text-center text-xs font-medium text-gray-500">
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="font-bold text-[#DA061A] transition-colors hover:text-[#F4050D] hover:underline">
                Masuk disini
              </Link>
            </p>
          </form>
        </div>
        
        <p className="mt-8 text-center text-xs font-medium text-gray-400">
          &copy; {new Date().getFullYear()} Kalbar Management System
        </p>
      </div>
    </div>
  )
}