import { headers } from 'next/headers'
import { getSession } from '@/lib/auth-service'
import SocialPostingManager from '@/components/admin/SocialPostingManager'

export default async function AdminSocialPostingPage() {
  const headersList = await headers()
  const barId = headersList.get('x-tenant-id')

  // Get session to extract adminId and adminName
  const session = await getSession()
  // auth-service/getSession returns the token payload (not a next-auth session)
  const adminId = session?.userId || session?.user?.id || null
  const adminName = session?.name || session?.user?.name || null

  return <SocialPostingManager barId={barId} adminId={adminId} adminName={adminName} />
}
