'use client'
import { Search, Plus, Users, UserPlus } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreateGroupModal from "@/components/create-group-modal"
import AddContactModal from "@/components/addContactModal"
import api from "../api"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { baseURL } from "@/shared/url"

export default function MessagingSystem() {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
  const router = useRouter()

  const [userConversations, setUserConversations] = useState([])
  const [groupConversations, setGroupConversations] = useState([])
  const [allConversations, setAllConversations] = useState([])

  useEffect(() => {
    console.log("userId",userId)
    if (!userId) return;

    async function fetchResumo() {
      try {
        const data  = await api.get(`/resumo-mensagens/${userId}`);
        console.log("conversas",data)
        const users = data.users || []
        const groups = data.groups || []

        const all = [...users, ...groups].sort((a, b) =>
          new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime()
        )
        
        setUserConversations(users)
        setGroupConversations(groups)
        setAllConversations(all)
      } catch (err) {
        console.error("Erro ao carregar conversas:", err)
      }
    }

    fetchResumo()
  }, [userId])

  // Função para lidar com a navegação quando uma conversa é clicada
  const handleConversationClick = (conversation) => {
    console.log("conversa",conversation)
    // Certifique-se de incluir o ID na URL
    router.push(
      `/conversations/?id=${encodeURIComponent(conversation.id)}&name=${encodeURIComponent(conversation.name)}&avatar=${encodeURIComponent(conversation.avatar || '')}&isGroup=${conversation.isGroup}`
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Pesquisar usuários ou grupos..." className="pl-8" />
          </div>
          <div className="flex gap-2">
            <AddContactModal>
              <Button size="sm" variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Contato
              </Button>
            </AddContactModal>
            <CreateGroupModal>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Grupo
              </Button>
            </CreateGroupModal>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto max-w-3xl mx-auto w-full">
        <Tabs defaultValue="all" className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                Todas Conversas
              </TabsTrigger>
              <TabsTrigger value="users" className="flex-1">
                Usuários
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex-1">
                Grupos
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <ConversationList 
              conversations={allConversations} 
              onConversationClick={handleConversationClick} 
            />
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            <ConversationList 
              conversations={userConversations} 
              onConversationClick={handleConversationClick} 
            />
          </TabsContent>

          <TabsContent value="groups" className="mt-0">
            <ConversationList 
              conversations={groupConversations} 
              onConversationClick={handleConversationClick} 
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

type Conversation = {
  id: string;
  name: string;
  avatar?: string;
  isGroup: boolean;
  lastMessageTime: string;
  lastMessage: string;
};

function ConversationList({ 
  conversations, 
  onConversationClick 
}: { 
  conversations: Conversation[], 
  onConversationClick: (conversation: Conversation) => void 
}) {
  return (
    <div className="divide-y">
      {conversations.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          Nenhuma conversa encontrada
        </div>
      ) : (
        conversations.map((conversation) => (
          <div
            key={`${conversation.isGroup ? 'grupo' : 'user'}-${conversation.id}`}
            onClick={() => onConversationClick(conversation)}
            className="flex items-center gap-3 p-4 hover:bg-muted transition-colors cursor-pointer"
          >
            <Avatar>
              <AvatarImage src={conversation.avatar ? `${baseURL}/${conversation.avatar}` : "/placeholder.svg"} alt={conversation.name} />
              <AvatarFallback>
                {conversation.isGroup ? <Users className="h-5 w-5" /> : conversation.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium truncate">{conversation.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}