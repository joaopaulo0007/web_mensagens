import User from "./user";

export default interface Group{
    id:number,
    name:string,
    description:string,
    photo:File|null,
    members:User[],
    admins:User[],
    created_at:Date,
}