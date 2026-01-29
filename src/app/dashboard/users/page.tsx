import { Metadata } from 'next'
import UsersScreen from '@/components/screen/users/users-screen'

export const metadata: Metadata = {
  title: 'Manajemen Pengguna',
}

export default function UsersPage() {
  return <UsersScreen />
}