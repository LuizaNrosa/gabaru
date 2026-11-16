import { CatalogHub } from '@/components/catalog-hub';
import { metaPagina } from '@/lib/seo';
export const metadata=metaPagina({titulo:'Vestibulares: provas, questões e gabaritos',descricao:'Estude com provas anteriores, fontes oficiais e resoluções editoriais. Compare as edições e encontre seu próximo caderno.',caminho:'/vestibulares'});
export default function Page(){return <CatalogHub categoria="vestibulares"/>;}
