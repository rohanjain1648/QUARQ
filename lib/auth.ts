import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function getAuthUser() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createClient()

  // Try to find existing profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (profile) return { clerkId: userId, profileId: profile.id as string, supabase }

  // No profile yet (webhook hasn't fired / local dev) — create it now
  const user = await currentUser()
  if (!user) return null

  const email = user.emailAddresses[0]?.emailAddress ?? ''
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || null

  const { data: created } = await supabase
    .from('profiles')
    .insert({
      clerk_id: userId,
      email,
      display_name: fullName,
      username: user.username ?? null,
      first_name: user.firstName ?? null,
      last_name: user.lastName ?? null,
      agent_personality: 'friendly',
    })
    .select('id')
    .single()

  if (!created) return null
  return { clerkId: userId, profileId: created.id as string, supabase }
}
