'use client'
import User from "@/interfaces/user"
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { baseURL } from "@/shared/url"
import api from "@/app/api"
import { useEffect, useState } from "react"

interface Props {
  onClose: () => void
  onAdd: (user: User) => void
  existingUsers: User[]
}

export default function ContatosModal({ onClose, onAdd, existingUsers }: Props) {
  const userId = localStorage.getItem('userId')
  const [users, setUsers] = useState<Array<User>>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    if (!userId) return
    const fetchUsers = async () => {
      try {
        const response = await api.get(`/conversas/${userId}`)
        const filteredUsers = response.filter((u: User) => !existingUsers.some(e => e.id === u.id))
        setUsers(filteredUsers)
        console.log("usuarios existentes",existingUsers)
        console.log("novos usuarios", filteredUsers)
      } catch (err) {
        console.error("Erro ao buscar usuários:", err)
      }
    }

    fetchUsers()
  }, [userId, existingUsers])

  const handleUserSelect = (user: User) => setSelectedUser(user)
  const handleAdd = () => selectedUser && onAdd(selectedUser)

  return (
    <div className="space-y-4">
      <Label>Selecione o novo Participante</Label>
      <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center space-x-3 p-2 hover:bg-muted rounded-md ${selectedUser?.id === user.id ? 'bg-gray-200' : ''}`}
            onClick={() => handleUserSelect(user)}
          >
            <Checkbox
              id={`user-${user.id}`}
              checked={selectedUser?.id === user.id}
              onChange={() => handleUserSelect(user)}
            />
            <Label htmlFor={`user-${user.id}`} className="flex items-center space-x-3 cursor-pointer flex-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.foto_perfil ? `${baseURL}/${user.foto_perfil}` : "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{user.name}</span>
            </Label>
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-2">
        <button className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400" onClick={onClose}>
          Cancelar
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={handleAdd}
          disabled={!selectedUser}
        >
          Adicionar
        </button>
      </div>
    </div>
  )
}
