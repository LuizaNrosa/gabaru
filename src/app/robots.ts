import type { MetadataRoute } from 'next';
export default function robots():MetadataRoute.Robots {
 return {rules:{userAgent:['*','Googlebot','Bingbot','OAI-SearchBot','ChatGPT-User','GPTBot','ClaudeBot','Claude-SearchBot','Google-Extended','PerplexityBot'],allow:'/',disallow:['/api/','/painel','/perfil/','/login','/cadastro','/checkout/','/busca?','/*?*sort=','/*?*q=','/*?*status=','/*?*habilidade=','/*?*erros=','/*?*page=','/*?*pagina=','/*?*busca=','/*?*ano=','/*?*banca=','/*?*disciplina=','/*?*assunto=']},sitemap:'https://gabaru.com.br/sitemap.xml',host:'https://gabaru.com.br'};
}
