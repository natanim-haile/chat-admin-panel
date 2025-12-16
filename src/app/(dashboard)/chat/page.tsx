"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"

interface Message {
    id: string
    content: string
    sender_id: string
    receiver_id: string | null
    created_at: string
}

interface ChatUser {
    id: string
    name: string
    avatar: string | null
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [hasMore, setHasMore] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [users, setUsers] = useState<ChatUser[]>([])
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)
    const [currentUser, setCurrentUser] = useState<any>(null) // Allow any for now until Auth context is fully typed

    useEffect(() => {
        // Fetch users
        const fetchUsers = async () => {
            const { data } = await supabase.from('users').select('*')
            if (data) {
                const mapped = data.map((u: any) => ({
                    id: u.id,
                    name: (u.first_name && u.last_name) ? `${u.first_name} ${u.last_name}` : (u.first_name || u.last_name || u.email || 'User'),
                    avatar: u.profile_picture || u.avatar || null,
                }))
                setUsers(mapped)
            }

            // Just for demo, try to get current user from session or pick first 'Admin'
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setCurrentUser(user)
            } else {
                // Fallback if no auth: Pick first user as "Me" for demo
                if (data && data.length > 0) setCurrentUser({ id: data[0].id })
            }
        }
        fetchUsers()
    }, [])

    // Load and subscribe to the selected conversation only
    useEffect(() => {
        if (!selectedUser || !currentUser?.id) {
            setMessages([])
            return
        }

        let isActive = true
        const PAGE_SIZE = 30
        const loadConversation = async () => {
            const orExpr = `and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id}),and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id})`
            const { data, error } = await supabase
                .from('messages')
                .select('id, content, sender_id, receiver_id, created_at')
                .or(orExpr)
                .order('created_at', { ascending: false })
                .limit(PAGE_SIZE)
            if (!isActive) return
            if (!error && data) {
                const asc = [...(data as Message[])].reverse()
                setMessages(asc)
                setHasMore((data as Message[]).length === PAGE_SIZE)
            }
        }
        setMessages([])
        loadConversation()

        const chanName = `messages:${currentUser.id}:${selectedUser.id}`
        const channel = supabase
            .channel(chanName)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_id=eq.${selectedUser.id}` },
                (payload) => {
                    const m = payload.new as Message
                    if (m.receiver_id === currentUser.id) {
                        setMessages((prev) => [...prev, m])
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_id=eq.${currentUser.id}` },
                (payload) => {
                    const m = payload.new as Message
                    if (m.receiver_id === selectedUser.id) {
                        setMessages((prev) => [...prev, m])
                    }
                }
            )
            .subscribe()

        return () => {
            isActive = false
            supabase.removeChannel(channel)
        }
    }, [selectedUser?.id, currentUser?.id])

    const loadOlderMessages = async () => {
        if (!selectedUser || !currentUser?.id) return
        if (messages.length === 0) return
        setIsLoadingMore(true)

        try {
            const oldest = messages[0]?.created_at
            const orExpr = `and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id}),and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id})`
            const PAGE_SIZE = 30
            const { data, error } = await supabase
                .from('messages')
                .select('id, content, sender_id, receiver_id, created_at')
                .or(orExpr)
                .lt('created_at', oldest)
                .order('created_at', { ascending: false })
                .limit(PAGE_SIZE)

            if (!error && data) {
                const olderAsc = [...(data as Message[])].reverse()
                setMessages((prev) => [...olderAsc, ...prev])
                setHasMore((data as Message[]).length === PAGE_SIZE)
            }
        } finally {
            setIsLoadingMore(false)
        }
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !currentUser) return

        if (!selectedUser) return

        const { error } = await supabase.from('messages').insert({
            content: newMessage,
            sender_id: currentUser.id,
            receiver_id: selectedUser.id
        })

        if (!error) {
            setNewMessage("")
        }
    }

    return (
        <div className="h-[calc(100vh-100px)] grid grid-cols-4 gap-6">
            {/* User List Sidebar */}
            <Card className="col-span-1 p-4 flex flex-col h-full bg-card">
                <h3 className="font-semibold mb-4 text-lg">Contacts</h3>
                <ScrollArea className="flex-1">
                    <div className="space-y-2">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50 text-foreground'}`}
                            >
                                <Avatar>
                                    <AvatarImage src={user.avatar || undefined} />
                                    <AvatarFallback>{(user.name || 'NA').slice(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{user.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* Chat Area */}
            <Card className="col-span-3 flex flex-col h-full overflow-hidden bg-background border">
                {/* Chat Header */}
                <div className="p-4 border-b bg-card flex items-center gap-3">
                    {selectedUser ? (
                        <>
                            <Avatar>
                                <AvatarImage src={selectedUser.avatar || undefined} />
                                <AvatarFallback>{(selectedUser.name || 'NA').slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-bold">{selectedUser.name}</h3>
                            </div>
                        </>
                    ) : (
                        <h3 className="font-bold text-muted-foreground">Select a user to chat</h3>
                    )}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4 bg-muted/20">
                    <div className="space-y-4">
                        {selectedUser && hasMore ? (
                            <div className="flex justify-center">
                                <Button variant="ghost" size="sm" onClick={loadOlderMessages} disabled={isLoadingMore}>
                                    {isLoadingMore ? 'Loading…' : 'Load older messages'}
                                </Button>
                            </div>
                        ) : null}
                                                { messages.map((msg) => {
                            const isMe = msg.sender_id === currentUser?.id
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-card border text-card-foreground'}`}>
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-card border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    )
}
