export default interface Mensagem{
    id:number,
    id_group:number|null,
    id_user:number,
    id_reply:number|null,
    mensagem:string|File,
    
}