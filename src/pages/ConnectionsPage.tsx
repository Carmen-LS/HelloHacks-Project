import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Layout } from '../components/Layout'
import { useProfile } from '../lib/profile-context'
import { useQuests } from '../lib/quest-context'

type Message = { id: string; senderId: string; text: string; sentAt: string }
type MessageStore = { direct: Record<string, Message[]>; groups: Record<string, Message[]> }
type Contact = { id: string; name: string; questIds: string[] }
type Room = { id: string; title: string; subtitle: string; icon: string; messages: Message[]; sortAt: number }
type View = 'direct' | 'groups'

const STORAGE_KEY = 'wellquest-messages'
const contacts: Contact[] = [
  { id: 'sarah-chen', name: 'Sarah Chen', questIds: ['starter-tennis', 'starter-pickleball'] },
  { id: 'james-park', name: 'James Park', questIds: ['starter-walk', 'starter-tennis'] },
  { id: 'linda-garcia', name: 'Linda Garcia', questIds: ['starter-pickleball', 'starter-stretch'] },
  { id: 'amir-patel', name: 'Amir Patel', questIds: ['starter-walk', 'starter-stretch'] },
  { id: 'maya-singh', name: 'Maya Singh', questIds: ['starter-pickleball', 'preview-k-mobility'] },
]

function ago(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

function message(id: string, senderId: string, text: string, minutesAgo: number): Message {
  return { id, senderId, text, sentAt: ago(minutesAgo) }
}

function starterStore(): MessageStore {
  return {
    direct: {
      'sarah-chen': [message('sarah-1', 'sarah-chen', 'Are you still up for doubles this week?', 42), message('sarah-2', 'me', 'Absolutely! Looking forward to it.', 36)],
      'james-park': [message('james-1', 'james-park', 'The seawall should be lovely tomorrow.', 180)],
      'linda-garcia': [message('linda-1', 'linda-garcia', 'I can bring an extra set of pickleball paddles.', 1440)],
    },
    groups: {},
  }
}

function loadStore(): MessageStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return starterStore()
    const parsed = JSON.parse(raw) as Partial<MessageStore>
    return { direct: parsed.direct ?? {}, groups: parsed.groups ?? {} }
  } catch {
    return starterStore()
  }
}

function relativeTime(value?: string) {
  if (!value) return 'No messages yet'
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000))
  if (minutes < 1) return 'Now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days < 7 ? `${days}d ago` : new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

export function ConnectionsPage() {
  const { profile } = useProfile()
  const { quests, joinedQuestIds } = useQuests()
  const [view, setView] = useState<View>('direct')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [store, setStore] = useState(loadStore)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)) } catch { /* Keep this session usable without storage. */ }
  }, [store])

  useEffect(() => {
    setStore((current) => {
      const groups = { ...current.groups }
      for (const questId of joinedQuestIds) {
        if (groups[questId]?.length) continue
        const attendee = contacts.find((contact) => contact.questIds.includes(questId))
        const quest = quests.find((item) => item.id === questId)
        groups[questId] = [message(`welcome-${questId}`, attendee?.id ?? 'member', `Looking forward to ${quest?.name.toLowerCase() ?? 'the quest'}!`, 0)]
      }
      return { ...current, groups }
    })
  }, [joinedQuestIds, quests])

  const questNames = useMemo(() => new Map(quests.map((quest) => [quest.id, quest.name])), [quests])
  const activeContacts = useMemo(() => {
    const commonQuestIds = new Set(joinedQuestIds)
    const discovered = contacts.filter((contact) => contact.questIds.some((id) => commonQuestIds.has(id)))
    const visible = new Map(contacts.slice(0, 3).map((contact) => [contact.id, contact]))
    discovered.forEach((contact) => visible.set(contact.id, contact))
    return [...visible.values()]
  }, [joinedQuestIds])

  const directRooms = useMemo<Room[]>(() => activeContacts.map((contact) => {
    const messages = store.direct[contact.id] ?? []
    const last = messages.at(-1)
    const metQuest = contact.questIds.find((id) => questNames.has(id))
    return {
      id: contact.id,
      title: contact.name,
      subtitle: metQuest ? `Met through ${questNames.get(metQuest)}` : 'WellQuest connection',
      icon: initials(contact.name),
      messages,
      sortAt: last ? new Date(last.sentAt).getTime() : 0,
    }
  }).sort((a, b) => b.sortAt - a.sortAt), [activeContacts, questNames, store.direct])

  const groupRooms = useMemo<Room[]>(() => joinedQuestIds.map((id) => {
    const quest = quests.find((item) => item.id === id)
    const messages = store.groups[id] ?? []
    const last = messages.at(-1)
    return {
      id,
      title: quest?.name ?? 'Quest chat',
      subtitle: `${quest?.participants ?? 1} ${quest?.participants === 1 ? 'member' : 'members'}${last ? ` · ${relativeTime(last.sentAt)}` : ' · New group chat'}`,
      icon: '♧',
      messages,
      sortAt: last ? new Date(last.sentAt).getTime() : 0,
    }
  }).sort((a, b) => b.sortAt - a.sortAt), [joinedQuestIds, quests, store.groups])

  const rooms = view === 'direct' ? directRooms : groupRooms
  const selectedRoom = rooms.find((room) => room.id === selectedId) ?? null

  function sendMessage(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !selectedRoom) return
    const entry = message(`msg-${crypto.randomUUID?.() ?? Date.now()}`, 'me', text, 0)
    setStore((current) => view === 'direct'
      ? { ...current, direct: { ...current.direct, [selectedRoom.id]: [...(current.direct[selectedRoom.id] ?? []), entry] } }
      : joinedQuestIds.includes(selectedRoom.id)
        ? { ...current, groups: { ...current.groups, [selectedRoom.id]: [...(current.groups[selectedRoom.id] ?? []), entry] } }
        : current)
    setDraft('')
  }

  return (
    <Layout>
      <section className="messages-page" aria-label="Messages">
        <header className="messages-heading"><div><p className="eyebrow">Connections</p><h1>Messages</h1></div></header>
        <div className="messages-tabs" role="tablist" aria-label="Message type">
          <button type="button" role="tab" aria-selected={view === 'direct'} className={view === 'direct' ? 'active' : ''} onClick={() => { setView('direct'); setSelectedId(null) }}>Direct messages <span>{directRooms.length}</span></button>
          <button type="button" role="tab" aria-selected={view === 'groups'} className={view === 'groups' ? 'active' : ''} onClick={() => { setView('groups'); setSelectedId(null) }}>Quest chats <span>{groupRooms.length}</span></button>
        </div>

        <div className="messages-layout">
          <section className="messages-inbox" aria-label={view === 'direct' ? 'Direct messages' : 'Quest group chats'}>
            <div className="messages-inbox-heading"><h2>{view === 'direct' ? 'Your connections' : 'Joined quest chats'}</h2><span>{rooms.length}</span></div>
            {rooms.length ? <div className="message-room-list">{rooms.map((room) => {
              const last = room.messages.at(-1)
              const sender = last?.senderId === 'me' ? 'You: ' : ''
              return <button key={room.id} type="button" className={`message-room${selectedId === room.id ? ' selected' : ''}`} onClick={() => setSelectedId(room.id)}>
                <span className={`message-avatar${view === 'groups' ? ' group' : ''}`}>{room.icon}</span>
                <span className="message-room-copy"><strong>{room.title}</strong><small>{view === 'direct' ? room.subtitle : room.subtitle}</small><span>{last ? `${sender}${last.text}` : 'Start a conversation'}</span></span>
                <time>{relativeTime(last?.sentAt)}</time>
              </button>
            })}</div> : <div className="messages-empty"><span aria-hidden="true">{view === 'direct' ? '♡' : '♧'}</span><p>{view === 'direct' ? 'Join a quest to meet people and start a conversation.' : 'Join a quest to get access to its group chat.'}</p></div>}
          </section>

          <section className={`conversation-panel${selectedRoom ? ' open' : ''}`} aria-label="Conversation">
            {selectedRoom ? <>
              <header className="conversation-header"><button className="conversation-back" type="button" onClick={() => setSelectedId(null)}>‹ Messages</button><span className={`message-avatar${view === 'groups' ? ' group' : ''}`}>{selectedRoom.icon}</span><div><h2>{selectedRoom.title}</h2><p>{selectedRoom.subtitle}</p></div></header>
              <div className="conversation-messages" aria-live="polite">
                {selectedRoom.messages.length ? selectedRoom.messages.map((entry) => {
                  const contact = contacts.find((item) => item.id === entry.senderId)
                  const senderName = entry.senderId === 'me' ? profile?.firstName || 'You' : contact?.name ?? 'Quest member'
                  return <article key={entry.id} className={`chat-message${entry.senderId === 'me' ? ' mine' : ''}`}>
                    {view === 'groups' && entry.senderId !== 'me' && <small>{senderName}</small>}
                    <p>{entry.text}</p><time>{new Date(entry.sentAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</time>
                  </article>
                }) : <div className="conversation-prompt"><p>{view === 'groups' ? 'Coordinate the details for your quest.' : `Send ${selectedRoom.title.split(' ')[0]} a message.`}</p></div>}
              </div>
              <form className="message-composer" onSubmit={sendMessage}><label className="sr-only" htmlFor="message-draft">Write a message</label><input id="message-draft" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message..." maxLength={1000} /><button type="submit" disabled={!draft.trim()} aria-label="Send message">➤</button></form>
            </> : <div className="conversation-placeholder"><span aria-hidden="true">✉</span><h2>Your messages</h2><p>Select a conversation to read and send messages.</p></div>}
          </section>
        </div>
      </section>
    </Layout>
  )
}
