import { supabase } from './supabase'

// Load every conversation the signed-in user belongs to, decorated with the
// "other" participant's profile and the most recent message. Returns an array
// sorted by most-recent activity. RLS guarantees we only ever see our own.
export async function loadConversations(myId) {
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  if (!conversations?.length) return []

  const ids = conversations.map((c) => c.id)

  const [{ data: participants }, { data: messages }] = await Promise.all([
    supabase.from('conversation_participants').select('conversation_id, user_id').in('conversation_id', ids),
    supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, created_at')
      .in('conversation_id', ids)
      .order('created_at', { ascending: false }),
  ])

  // Resolve all involved profiles in one query.
  const userIds = [...new Set((participants ?? []).map((p) => p.user_id))]
  const profileMap = await loadProfiles(userIds)

  const lastByConv = {}
  for (const m of messages ?? []) {
    if (!lastByConv[m.conversation_id]) lastByConv[m.conversation_id] = m
  }

  return conversations.map((c) => {
    const members = (participants ?? [])
      .filter((p) => p.conversation_id === c.id)
      .map((p) => profileMap[p.user_id])
      .filter(Boolean)
    const other = members.find((m) => m.id !== myId) || members[0] || null
    return {
      ...c,
      members,
      other,
      title: c.is_group ? c.title || 'گفتگوی گروهی' : other?.display_name || 'کاربر هامیک',
      avatar: c.is_group ? null : other?.avatar_url || null,
      lastMessage: lastByConv[c.id] || null,
    }
  })
}

export async function loadProfiles(userIds) {
  if (!userIds.length) return {}
  const { data } = await supabase.from('profiles').select('*').in('id', userIds)
  const map = {}
  for (const p of data ?? []) map[p.id] = p
  return map
}

export async function searchUsers(term, myId) {
  const q = term.trim()
  if (!q) return []
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`display_name.ilike.%${q}%,username.ilike.%${q}%`)
    .neq('id', myId)
    .limit(20)
  if (error) throw error
  return data ?? []
}

export async function startDirectConversation(otherUserId) {
  const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
    other_user: otherUserId,
  })
  if (error) throw error
  return data // conversation id
}

export async function loadMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(500)
  if (error) throw error
  return data ?? []
}

export async function sendMessage(conversationId, senderId, content) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function loadConversationContext(conversationId, myId) {
  const { data: parts } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId)
  const ids = (parts ?? []).map((p) => p.user_id)
  const profiles = await loadProfiles(ids)
  const other = ids.map((id) => profiles[id]).find((p) => p && p.id !== myId)
  return { profiles, other, memberIds: ids }
}
