import { Metadata } from 'next'
import ServiceTypesScreen from '@/components/screen/services-type/service-types-screen'

export const metadata: Metadata = {
  title: 'Tipe Layanan',
  description: 'Manajemen kategori dan tipe layanan sistem.',
}

export default function ServiceTypesPage() {
  return <ServiceTypesScreen />
}