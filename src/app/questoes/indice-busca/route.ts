import {NextResponse} from 'next/server';
import {searchItems} from '@/lib/catalogo/search-items';
// Gerado no build e servido pela CDN. Não é página: fica fora do índice do Google.
export const dynamic='force-static';
export function GET(){return NextResponse.json(searchItems,{headers:{'Cache-Control':'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800','X-Robots-Tag':'noindex'}});}
