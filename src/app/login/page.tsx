'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import ApiClient from '../api/index'
export default  function Login({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()
    async function confirmAuth(e: React.FormEvent) {
        e.preventDefault()

        try {
            const userCredential = await ApiClient.post<{ data: any }>('/login', { email, password })
            localStorage.setItem('userId', userCredential.id);
            console.log('Usuário autenticado:', userCredential)
            console.log("user credential id", userCredential.id)
            router.push('/home')
        } catch (error: any) {
            setError('Erro ao autenticar usuário: ' + error.message)
        }
    }

    return (
        <div className={cn('flex flex-col items-center justify-center h-screen', className)} {...props}>
            <Card className='w-96'>
                <CardHeader className='text-center'>
                    <CardTitle className='text-2xl'>Login</CardTitle>
                    <CardDescription className='text-sm'>Entre com seu email e senha</CardDescription>
                </CardHeader>
                <CardContent className='grid gap-4'>
                    <form onSubmit={confirmAuth} className='grid gap-4'>
                        <div className='grid gap-1'>
                            <label htmlFor='email' className='text-sm font-medium'>Email</label>
                            <Input type='email' id='email' value={email} onChange={e => setEmail(e.target.value)} placeholder='Email' className='w-full' required/>
                        </div>
                        <div className='grid gap-1'>
                            <label htmlFor='password' className='text-sm font-medium'>Senha</label>
                            <Input type='password' id='password' value={password} onChange={e => setPassword(e.target.value)} placeholder='Senha' className='w-full' required/>
                            <a href='#' className='text-sm text-blue-500 hover:underline'>Esqueci minha senha</a>
                        </div>
                        {error && <p className='text-red-500 text-sm'>{error}</p>}
                        <Button type='submit' className='w-full bg-blue-500 hover:bg-blue-600 text-white'>
                            Entrar
                        </Button>
                    </form>
                    <div className='flex items-center justify-center gap-2'>
                        <span className='text-sm'>Não tem uma conta?</span>
                        <a href='../register' className='text-sm text-blue-500 hover:underline'>Crie uma conta</a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
