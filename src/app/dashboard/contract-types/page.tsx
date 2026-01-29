import { Metadata } from 'next'
import ContractTypesScreen from '@/components/screen/contract-types/contract-types-screen'

export const metadata: Metadata = {
  title: 'Tipe Kontrak',
}

export default function ContractTypesPage() {
  return <ContractTypesScreen />
}