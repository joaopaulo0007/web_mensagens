import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import api from "@/app/api"
import { baseURL } from "@/shared/url"
import ContatosModal from "./contatosModal"
import User from "@/interfaces/user"

interface GrupoInfo {
  id: number,
  descricao: string,
  nome: string,
  imagem_perfil: string,
  data_criacao: Date,
  UsuarioGrupos: [{
    id: number,
    id_usuario: number,
    id_grupo: number,
    data_entrada: Date,
    User: User & { Administradors: [] }
  }]
}

interface Props {
  open: boolean
  onClose: () => void
  isGroup: boolean
  conversationName: string
  avatar: string
  id: number
}

// [importações anteriores]

export function ConversationDetailsModal({
  open, onClose, isGroup, conversationName, avatar, id
}: Props) {
  const [grupoInfo, setGrupoInfo] = useState<GrupoInfo | null>(null)
  const [isAdm, setIsAdm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showContactsModal, setShowContactsModal] = useState(false)
  const userId = typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : null

  useEffect(() => {
    if (!isGroup || !open) return
    async function getGrupoInfo() {
      setLoading(true)
      try {
        const response = await api.get(`/grupo/info/${id}`)
        setGrupoInfo(response.data || response)
        const admResponse = await api.get(`/administrador/check/${id}/${userId}`)
        if (admResponse) setIsAdm(true)
      } catch (error) {
        console.error("Erro ao buscar informações do grupo:", error)
      } finally {
        setLoading(false)
      }
    }
    getGrupoInfo()
  }, [id, isGroup, open, userId])

  const handlePromoteUser = async (participanteId: number) => {
    try {
      await api.post(`/administrador`, { id_grupo: id, id_usuario: participanteId })
      const response = await api.get(`/grupo/info/${id}`)
      setGrupoInfo(response.data || response)
    } catch (error) {
      console.error("Erro ao promover usuário:", error)
    }
  }

  const handleRemoveUser = async (participanteId: number) => {
    try {
      await api.delete(`/grupo/remover-participante/${id}/${participanteId}`)
      const response = await api.get(`/grupo/info/${id}`)
      setGrupoInfo(response.data || response)
    } catch (error) {
      console.error("Erro ao remover usuário:", error)
    }
  }

  const handleUserAdd = async (user: User) => {
    try {
      await api.post(`/usuarioGrupo`, {
        id_grupo: id,
        id_usuario: user.id
      })
      const response = await api.get(`/grupo/info/${id}`)
      setGrupoInfo(response.data || response)
      setShowContactsModal(false)
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error)
    }
  }

  const handleLeaveGroup = async () => {
    try {
      await api.delete(`/grupo/remover-participante/${id}/${userId}`)
      onClose()
      window.location.href = '/home'
    } catch (error) {
      console.error("Erro ao sair do grupo:", error)
    }
  }

  const handleDeleteConversation = async () => {
    try {
      await api.delete(`/conversa/${id}`)
      onClose()
      window.location.href = '/home'
    } catch (error) {
      console.error("Erro ao apagar conversa:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{showContactsModal ? "Adicionar Participante" : `Detalhes da ${isGroup ? "conversa em grupo" : "conversa"}`}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">Carregando informações...</div>
        ) : showContactsModal ? (
          <ContatosModal
            onClose={() => setShowContactsModal(false)}
            onAdd={handleUserAdd}
            existingUsers={grupoInfo?.UsuarioGrupos.map(p => p.User) || []}
          />
        ) : (
          <>
            <div className="flex flex-col items-center text-center space-y-2">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatar?.startsWith("uploads") ? `${baseURL}/${avatar}` : avatar} />
                <AvatarFallback>{conversationName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold">{conversationName}</h2>
              {isGroup && grupoInfo && <p className="text-sm text-muted-foreground">{grupoInfo.descricao}</p>}
            </div>

            {isGroup && grupoInfo && (
              <>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Participantes ({grupoInfo.UsuarioGrupos.length})</h3>
                  <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {grupoInfo.UsuarioGrupos.map(p => (
                      <li key={p.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`${baseURL}/${p.User.foto_perfil}`} />
                          <AvatarFallback>{p.User.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="flex-1">{p.User.name}</span>
                        {p.User.id === userId && <span className="text-xs text-blue-500">Você</span>}
                        {isAdm && (
                          <div className="flex gap-1">
                            {p.User.Administradors.length === 0 && (
                              <Button size="sm" variant="ghost" onClick={() => handlePromoteUser(p.User.id)}>
                                Promover
                              </Button>
                            )}
                            {p.User.id !== userId && (
                              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleRemoveUser(p.User.id)}>
                                Remover
                              </Button>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                {isAdm && (
                  <Button variant="outline" className="w-full mt-4" onClick={() => setShowContactsModal(true)}>
                    Adicionar novo membro
                  </Button>
                )}
              </>
            )}

            <div className="mt-4 space-y-2">
              <Button variant="secondary" className="w-full">Ver arquivos</Button>
              {isGroup ? (
                <Button variant="destructive" className="w-full" onClick={handleLeaveGroup}>Sair do grupo</Button>
              ) : (
                <Button variant="destructive" className="w-full" onClick={handleDeleteConversation}>Apagar conversa</Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

