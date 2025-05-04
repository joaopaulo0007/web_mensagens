"use client"
import { useRouter } from "next/navigation"
import { useState,useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import api from "@/app/api"

import { ReactNode } from "react";
import { baseURL } from "@/shared/url"
interface User{
 id: string;
  name: string;
  email: string;
  password: string;
  foto_perfil?: string;
  telefone?: string;
}
export default function CreateGroupModal({ children }: { children: ReactNode }) {
  const userId= localStorage.getItem('userId')
  const router=useRouter()
  const [open, setOpen] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupDescricao,setGroupDescricao]=useState("")
  const [groupAvatar,setGroupAvatar]=useState<File|null>()
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [users,setUsers]=useState<User[]>([])
  useEffect(() => {
    if (!userId) return

    const fetchUsers = async () => {
      try {
        const response = await api.get(`/conversas/${userId}`)
        setUsers(response)
      } catch (err) {
        console.error("Erro ao buscar usuários:", err)
      }
    }

    fetchUsers()
  }, [userId])
  const handleUserToggle = (userId: string) => {
    if (selectedUsers.some((user) => user.id === userId)) {
      setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
    } else {
      const userToAdd = users.find((user) => user.id === userId)
      if (userToAdd) {
        setSelectedUsers([...selectedUsers, userToAdd])
      }
    }
  }

  const handleCreateGroup = async () => {
    if (!userId) return;
  
    const formData = new FormData();
    formData.append("adm", userId);
    formData.append("nome", groupName);
    formData.append("descricao", groupDescricao);
    if (groupAvatar) {
      formData.append("avatar", groupAvatar);
    }
  
    formData.append("users", JSON.stringify(selectedUsers))

    
    try {
      const response=await api.post("/grupo", 
        formData,
        
      );
      const group = response; 
      console.log("grupo criado",group)
    router.push(
      `/conversations/?id=${encodeURIComponent(group.grupo.id)}&name=${encodeURIComponent(group.grupo.nome)}&avatar=${encodeURIComponent(group.grupo.avatar || '')}&isGroup=true`
    );
      setOpen(false);
      setGroupName("");
      setGroupDescricao("");
      setGroupAvatar(null);
      setSelectedUsers([]);
    } catch (err) {
      console.error("Erro ao criar grupo:", err);
    }
  };
  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Grupo</DialogTitle>
          <DialogDescription>Crie um grupo para conversar com várias pessoas ao mesmo tempo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="group-name">Nome do Grupo</Label>
            <Input
              id="group-name"
              placeholder="Digite o nome do grupo"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-descricao">Descricao do grupo</Label>
            <Input id="group-descricao"
                   placeholder="Digite a descrição do grupo"
                   value={groupDescricao}
                   onChange={(e)=>setGroupDescricao(e.target.value)}></Input>
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-avatar">imagem do grupo</Label>
            <Input type="file" id="group-avatar" accept="image/*" onChange={(e)=>setGroupAvatar(e.target.files?.[0]||null)}/>
          </div>
          <div className="space-y-2">
            <Label>Selecione os Participantes</Label>
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedUsers.some((selectedUser) => selectedUser.id === user.id)}
                    onCheckedChange={() => handleUserToggle(user.id)}
                  />
                  <Label htmlFor={`user-${user.id}`} className="flex items-center space-x-3 cursor-pointer flex-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.foto_perfil? `${baseURL}/${user.foto_perfil}`:"/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreateGroup} disabled={!groupName || selectedUsers.length < 2}>
            Criar Grupo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


