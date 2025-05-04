# Web Mensagens - Frontend

Este é o repositório do frontend do projeto **Web Mensagens**, uma aplicação de mensagens em tempo real desenvolvida com **Next.js** e **TypeScript**.

## Tecnologias Utilizadas

- **Next.js**: Framework React para renderização do lado do servidor.
- **TypeScript**: Superset do JavaScript para tipagem estática.
- **Tailwind CSS**: Framework CSS para estilização.
- **Axios**: Cliente HTTP para comunicação com a API backend.

## Estrutura do Projeto

- `src/app`: Contém as páginas e rotas do Next.js.
- `src/components`: Componentes reutilizáveis da interface do usuário.
- `src/interfaces`: Interfaces TypeScript para tipagem.
- `src/lib`: Funções utilitárias e configuração do Firebase.
- `src/shared`: Configurações compartilhadas, como URLs base.

## Configuração do Ambiente

1. Clone o repositório:
   ```bash
   git clone https://github.com/joaopaulo0007/web_mensagens
   cd web_mensages
2. Instale dependencias:
   ```bash
  npm install --force
3. Inicie o servidor de desenvolvimento:
  ```bash
  npm run dev
4. Acesse a aplicação em http://localhost:3000.

5. Funcionalidades:
   
    Registro e login de usuários.
    Criação de grupos de conversa.
    Envio de mensagens de texto e arquivos.
    Gerenciamento de participantes em grupos.