import {GET as redirectPart} from '../../sitemaps/[tipo]/[parte]/route';
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const m=/^(hubs|provas|disciplinas|questoes|livros)-([1-9]\d*)\.xml$/.exec(id);if(!m)return new Response('Não encontrado',{status:404});return redirectPart(req,{params:Promise.resolve({tipo:m[1],parte:m[2]+'.xml'})});}
