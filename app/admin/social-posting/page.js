import { headers } from 'next/headers'
import { getServerSession } from '@/lib/auth-service'
import SocialPostingManager from '@/components/admin/SocialPostingManager'

export default async function AdminSocialPostingPage() {
  const headersList = await headers()
  const barId = headersList.get('x-tenant-id')

  // Get session to extract adminId and adminName
  const session = await getServerSession()
  const adminId = session?.user?.id || null
  const adminName = session?.user?.name || null

  return <SocialPostingManager barId={barId} adminId={adminId} adminName={adminName} />
}
