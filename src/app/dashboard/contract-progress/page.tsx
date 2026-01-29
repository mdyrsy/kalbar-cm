import { Metadata } from 'next'
import ContractProgressScreen from '@/components/screen/contract-progress/contract-progress-screen'

export const metadata: Metadata = {
  title: 'Progress Kontrak',
}

export default function ContractProgressPage() {
  return <ContractProgressScreen />
}