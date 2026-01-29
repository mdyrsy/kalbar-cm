import { Metadata } from 'next'
import ProfileScreen from '@/components/screen/profile/profile-screen'

export const metadata: Metadata = {
  title: 'Profil',
}

export default function ProfilePage() {
  return <ProfileScreen />
}