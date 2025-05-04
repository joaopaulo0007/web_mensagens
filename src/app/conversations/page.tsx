'use client'

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, MoreVertical, Send, Paperclip, Smile } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ConversationDetailsModal } from "@/components/conversationDetailsModal"
import api from "../api"
import { baseURL } from "@/shared/url"

interface Message {
  id: number;
  id_conversa: number;
  id_remetente: number;
  id_grupo: number | null;
  conteudo: string;
  arquivo: string | null;
  data_envio: string;
}

interface Conversation {
  id: string | number;
  name: string;
  avatar: string;
  isGroup: boolean;
}

export default function ConversationPage() {
  const searchParams = useSearchParams()

  // Obter os parâmetros da URL usando searchParams
  const id = searchParams.get('id')
  const name = searchParams.get('name')
  const avatar = searchParams.get('avatar')
  const isGroup = searchParams.get('isGroup')

  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const userId = typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : null

  // Usar os parâmetros da URL para definir a conversa atual
  useEffect(() => {
    if (id && name) {
      setConversation({
        id: id,
        name: name,
        avatar: avatar || "/placeholder.svg",
        isGroup: isGroup === 'true'
      })
    }
  }, [id, name, avatar, isGroup])

  // Função para buscar as mensagens da conversa
  const fetchMessages = async () => {
    try {
      setLoading(true)
      if (!conversation) return

      const isGroupParam = conversation.isGroup
      const response = await api.get(`/allmensagens?id=${conversation.id}&group=${isGroupParam}`)
      
      // Garantir que data seja um array
      const data = response.data || response
      const messagesArray = Array.isArray(data) ? data : []
      console.log("Mensagens carregadas:", messagesArray)

      setMessages(messagesArray)
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error)
      // Se houver erro, definir mensagens como array vazio
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  // Função para enviar uma nova mensagem
  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId || !conversation) return

    try {
      const isGroupParam = conversation.isGroup
      const messageData = {
        id_conversa: isGroupParam ? null : Number(conversation.id),
        id_remetente: userId,
        id_grupo: isGroupParam ? Number(conversation.id) : null,
        conteudo: newMessage,
        arquivo: null
      };

      const response = await api.post('/mensagem', messageData)
      const data = response.data || response
      
      // Adiciona a mensagem enviada à lista de mensagens
      setMessages(prevMessages => [...prevMessages, data])
      setNewMessage("")
      
      // Scroll para a última mensagem
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
    }
  }

  // Configurar polling para buscar novas mensagens a cada 5 segundos
  useEffect(() => {
    if (!conversation || !conversation.id) return

    // Buscar mensagens imediatamente
    fetchMessages()

    // Configurar intervalo para buscar mensagens
    const interval = setInterval(fetchMessages, 5000)

    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(interval)
  }, [conversation])

  // Scroll para a última mensagem quando novas mensagens chegarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!conversation) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-3 flex items-center gap-3">
        <Link href="/home" className="mr-1">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <Button variant="ghost" className="flex items-center gap-3 flex-1 text-left" onClick={() => setModalOpen(true)}>
          <Avatar>
            <AvatarImage
              src={conversation.avatar?.startsWith("uploads") ? `${baseURL}/${conversation.avatar}` : conversation.avatar}
              alt={conversation.name}
            />
            <AvatarFallback>{conversation.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-medium">{conversation.name}</h2>
            {conversation.isGroup && <p className="text-xs text-muted-foreground">Grupo</p>}
          </div>
        </Button>

        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 overflow-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">Carregando mensagens...</div>
        ) : messages && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Nenhuma mensagem encontrada. Comece uma conversa!
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((message) => {
            if (!message || typeof message.id_remetente === 'undefined') return null
            const isMine = message.id_remetente === userId
            const messageDate = new Date(message.data_envio)
            const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

            return (
              <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className="flex gap-2 max-w-[80%]">
                  {!isMine && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{conversation.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`rounded-2xl px-3 py-2 ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                    >
                      <p>{message.conteudo}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formattedTime}</p>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Erro ao carregar mensagens. Tente novamente.
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="border-t p-3">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="rounded-full">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Digite uma mensagem..."
            className="rounded-full"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="button" variant="ghost" size="icon" className="rounded-full">
            <Smile className="h-5 w-5" />
          </Button>
          <Button type="submit" size="icon" className="rounded-full" disabled={!newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>

      {/* Modal de detalhes da conversa */}
      {conversation && (
        <ConversationDetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          isGroup={!!conversation.isGroup}
          conversationName={conversation.name}
          avatar={conversation.avatar}
          id={Number(conversation.id)}
        />
      )}
    </div>
  )
}