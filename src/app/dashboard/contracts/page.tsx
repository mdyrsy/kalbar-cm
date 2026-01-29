import { Metadata } from 'next'
import ContractsScreen from '@/components/screen/contracts/contracts-screen'

export const metadata: Metadata = {
  title: 'Daftar Kontrak',
}

export default function ContractsPage() {
  return <ContractsScreen />
}