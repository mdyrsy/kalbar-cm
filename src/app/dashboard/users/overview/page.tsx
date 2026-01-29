import { Metadata } from 'next'
import StatisticsScreen from '@/components/screen/users/overview-screen'

export const metadata: Metadata = {
  title: 'Statistika Pengguna',
}

export default function StatisticsPage() {
  return <StatisticsScreen />
}