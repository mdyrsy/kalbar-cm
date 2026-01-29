import { Metadata } from 'next'
import ServicesScreen from '@/components/screen/services/services-screen'

export const metadata: Metadata = {
  title: 'Daftar Layanan'
}

export default function ServicesPage() {
  return <ServicesScreen />
}