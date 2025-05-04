'use client'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {useRouter} from 'next/navigation'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import api from '../api'
export default function RegisterForm() {
    const router= useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [retryPassword, setRetryPassword] = useState('')
    const [name, setName] = useState('')
    const [photo, setPhoto] = useState<File | null>(null)
    const [telephone, setTelephone] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
      
        if (password !== retryPassword) {
          setError("As senhas não coincidem!")
          return
        }
      
        setLoading(true)
        try {
          const formData = new FormData()
          formData.append("name", name)
          formData.append("email", email)
          formData.append("password", password)
          formData.append("telefone", telephone)
          if (photo) {
            formData.append("foto_perfil", photo)
          }
          console.log("nome", name,email,password,telephone,photo)
          console.log('foto_perfil:', formData.get('foto_perfil'));
          const user = await api.post('/user', formData)
          console.log('Usuário criado com sucesso!', user)
          localStorage.setItem('userId', user.id)
          
          router.push('/home')
        } catch (err: any) {
          console.error('Erro ao criar usuário:', err)
          setError(err.message || 'Erro desconhecido')
        } finally {
          setLoading(false)
        }
      }
      

    return (
        <div className='w-full h-full flex justify-center items-center'>
            <Card className='w-96'>
                <CardHeader className='text-center'>
                    <CardTitle className='text-2xl'>Registrar</CardTitle>
                    <CardDescription>Criar uma nova conta</CardDescription>
                </CardHeader>
                <CardContent className='grid gap-4'>
                    <form onSubmit={handleRegister}>
                        <Label htmlFor='name'>Nome</Label>
                        <Input type='text' id='name' value={name} onChange={e => setName(e.target.value)} required />

                        <Label htmlFor='email'>Email</Label>
                        <Input type='email' id='email' value={email} onChange={e => setEmail(e.target.value)} required />

                        <Label htmlFor='telephone'>Telefone</Label>
                        <Input type='tel' id='telephone' value={telephone} onChange={e => setTelephone(e.target.value)} />

                        <Label htmlFor='password'>Senha</Label>
                        <Input type='password' id='password' value={password} onChange={e => setPassword(e.target.value)} required />

                        <Label htmlFor='retryPassword'>Repetir Senha</Label>
                        <Input type='password' id='retryPassword' value={retryPassword} onChange={e => setRetryPassword(e.target.value)} required />

                        <Label htmlFor='photo'>Foto</Label>
                        <Input type='file' id='photo' accept='image/*' onChange={e => setPhoto(e.target.files?.[0] || null)} />

                        {error && <p className='text-red-500 text-sm'>{error}</p>}

                        <Button type='submit' disabled={loading} className='mt-4 w-full'>
                            {loading ? 'Registrando...' : 'Registrar'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
