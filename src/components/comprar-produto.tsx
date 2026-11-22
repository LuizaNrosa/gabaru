'use client';
// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {useAuth} from '@/context/auth-context';
import type {CheckoutResult,ProdutoId} from '@/lib/billing/types';

type Props={produto:ProdutoId;preco:string;vendaAberta:boolean;destino:string};

/** Pix de compra única. O preço exibido vem do servidor; a liberação só acontece pelo webhook confirmado. */
export function ComprarProduto({produto,preco,vendaAberta,destino}:Props){
 const {user,loading}=useAuth();
 const [pix,setPix]=useState<CheckoutResult|null>(null),[erro,setErro]=useState(''),[pendente,setPendente]=useState(false),[comprado,setComprado]=useState(false),[copiado,setCopiado]=useState(false);
 const pedido=useRef('');

 useEffect(()=>{if(!user)return;let vivo=true;
  const checar=async()=>{try{const r=await fetch(`/api/loja/status?produto=${produto}`,{headers:{Authorization:`Bearer ${await user.getIdToken()}`},cache:'no-store'});const d=await r.json();if(vivo&&d.comprado)setComprado(true);}catch{/* tenta de novo no próximo ciclo */}};
  checar();
  if(!pix||comprado)return()=>{vivo=false;};
  const t=setInterval(checar,5000);return()=>{vivo=false;clearInterval(t);};
 },[user,pix,comprado,produto]);

 async function comprar(){
  if(!user){setErro('Entre na sua conta para comprar.');return;}
  setPendente(true);setErro('');pedido.current||=crypto.randomUUID();
  try{const r=await fetch('/api/loja/checkout',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${await user.getIdToken()}`},body:JSON.stringify({produto,requestId:pedido.current})});
   const d=await r.json();if(!r.ok)throw Error(d.error);if(d.comprado){setComprado(true);return;}setPix(d);}
  catch(e){setErro(e instanceof Error&&e.message?e.message:'Não foi possível iniciar o pagamento.');}
  finally{setPendente(false);}
 }

 if(comprado)return <div className="gb-compra" role="status"><p className="gb-compra-ok">Compra confirmada. A apostila inteira está liberada na sua conta.</p><Link className="gb-button gb-button-primary" href={destino}>Começar a estudar</Link></div>;
 return <div className="gb-compra">
  <p className="gb-compra-preco"><strong>{preco}</strong> <span>pagamento único no Pix · acesso sem prazo de validade</span></p>
  {!vendaAberta?<p>A venda abre em breve. Crie sua conta e leia o Capítulo 1 grátis enquanto isso.</p>
  :loading?null:!user?<p><Link className="gb-button gb-button-primary" href="/cadastro">Criar conta para comprar</Link> <Link className="gb-text-link" href="/login">Já tenho conta</Link></p>
  :!pix&&<button type="button" className="gb-button gb-button-primary" disabled={pendente} onClick={comprar}>{pendente?'Gerando Pix…':`Comprar por ${preco} no Pix`}</button>}
  {pix?.kind==='pix'&&<div className="gb-compra-pix">
   <p>Pague com o app do seu banco. Assim que o Mercado Pago confirmar, esta página libera a apostila sozinha.</p>
   {pix.qrCodeBase64&&(
    // eslint-disable-next-line @next/next/no-img-element -- QR Code Pix em data URI
    <img width={232} height={232} src={`data:image/png;base64,${pix.qrCodeBase64}`} alt="QR Code Pix. O código Copia e Cola está no campo abaixo."/>)}
   <label>Pix Copia e Cola<textarea readOnly rows={3} value={pix.qrCode??''}/></label>
   <button type="button" className="gb-button" onClick={()=>navigator.clipboard.writeText(pix.qrCode??'').then(()=>setCopiado(true)).catch(()=>setErro('Selecione e copie o código no campo acima.'))}>{copiado?'Código copiado':'Copiar código Pix'}</button>
   <p className="gb-book-meta" aria-live="polite">Aguardando a confirmação do pagamento…</p>
  </div>}
  {erro&&<p role="alert">{erro}</p>}
 </div>;
}
