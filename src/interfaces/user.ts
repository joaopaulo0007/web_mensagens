export default interface User{
    id:number,
    name:string,
    email:string,
    password:string,
    phone:string,
    foto_perfil:File|null
}