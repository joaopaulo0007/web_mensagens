'use client'
import { useState } from "react"
import { Search, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { baseURL } from "@/shared/url"
import api from '../app/api'
import User from "@/interfaces/user"
import { ReactNode } from "react";
import { useRouter } from "next/navigation"

export default function AddContactModal({ children }: { children: ReactNode }) {
  const router=useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [open, setOpen] = useState(false)
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    try {
      const  data  = await api.get(`/user-name?nome=${encodeURIComponent(searchTerm)}`)
      console.log(data)
      const filteredResults = data.filter((user: User) => user.id.toString() !== userId)
      setSearchResults(filteredResults)
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
      
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddContact = async (contactId:number) => {
    try {
        console.log("user Id: ",userId)
    let convers;
     if(userId){
      const conversa=await api.post('/conversa', {
        id_usuario_1: parseInt(userId),
        id_usuario_2: contactId
      })
      convers=conversa;
      console.log(convers)
    }
      
     const user2= await api.get(`/user/${contactId}`)
      
      console.log(user2)
      // Opcional: redirecionar para a conversa
      router.push(
        `/conversations/?id=${encodeURIComponent(convers.id)}&name=${encodeURIComponent(user2.name)}&avatar=${encodeURIComponent(user2.avatar || '')}&isGroup=${convers.isGroup}`
      )
      setOpen(false)
    } catch (error) {
      console.error("Erro ao adicionar contato:", error)
    
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar novo contato</DialogTitle>
          <DialogDescription>
            Busque por usuários pelo nome para iniciar uma conversa
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Buscar por nome..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "Buscando..." : "Buscar"}
          </Button>
        </div>

        <div className="mt-4 max-h-60 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-2 hover:bg-muted rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.foto_perfil?`${baseURL}/${user.foto_perfil}` : "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleAddContact(user.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Iniciar conversa
                  </Button>
                </div>
              ))}
            </div>
          ) : searchTerm && !isSearching ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhum usuário encontrado
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}