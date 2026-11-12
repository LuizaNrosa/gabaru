import Lista, { generateMetadata as meta } from "@/components/exames-lote/lista";
export async function generateMetadata(){ return meta({ params: Promise.resolve({banca:"uerj"}) }); }
export default function Page(){return Lista({params:Promise.resolve({banca:"uerj"})});}
