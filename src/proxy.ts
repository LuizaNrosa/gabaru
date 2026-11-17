import {getServerEnv} from './env.mjs';
import {NextRequest,NextResponse} from 'next/server';
import {createHash} from 'node:crypto';
import {limitar} from '@/lib/seguranca';
import {readLimitedText} from '@/lib/security/input';
import {adminDb} from '@/lib/firebase/admin';
export async function proxy(req:NextRequest){
 const path=req.nextUrl.pathname;if(!path.startsWith('/api/'))return NextResponse.next();
 if(path==='/api/stripe/webhook'&&!req.headers.get('stripe-signature'))return NextResponse.json({error:'Assinatura exigida.'},{status:400});
 const raw=getServerEnv().VERCEL==='1'?req.headers.get('x-vercel-forwarded-for')??'unknown':'shared';
 const ip=createHash('sha256').update(raw.split(',')[0]).digest('hex').slice(0,32),key=ip+':'+path,max=path==='/api/stripe/webhook'?600:120;
 const requested=Number(req.nextUrl.searchParams.get('limit')??30),cost=path==='/api/v1/questions'?(Number.isInteger(requested)&&requested>=1&&requested<=90?requested:1):0;
 if(!limitar(key,max,60000))return NextResponse.json({error:'Limite atingido. Tente novamente em um minuto.'},{status:429,headers:{'Retry-After':'60'}});
 if(getServerEnv().API_RATE_LIMIT_BACKEND==='firestore'){
  try{const db=await adminDb(),now=Date.now(),minute=db.collection('api_rate_limits').doc(createHash('sha256').update('minute:'+key).digest('hex')),daily=db.collection('api_rate_limits').doc(createHash('sha256').update('daily:'+ip).digest('hex'));
   const retry=await db.runTransaction(async tx=>{
    const m=(await tx.get(minute)).data(),d=cost?(await tx.get(daily)).data():undefined;
    const minuteEnd=Number(m?.windowEnd??0),dayEnd=Number(d?.windowEnd??0);
    const minuteCount=minuteEnd>now?Number(m?.count??0):0,dailyCount=dayEnd>now?Number(d?.count??0):0;
    if(minuteCount>=max)return 60;if(cost&&dailyCount+cost>1000)return Math.max(1,Math.ceil((dayEnd-now)/1000));
    const end=minuteEnd>now?minuteEnd:now+60000;tx.set(minute,{count:minuteCount+1,windowEnd:end,expiresAt:new Date(end+60000)});
    if(cost){const endOfDay=dayEnd>now?dayEnd:now+86400000;tx.set(daily,{count:dailyCount+cost,windowEnd:endOfDay,expiresAt:new Date(endOfDay)});}return 0;
   });if(retry)return NextResponse.json({error:'Limite de tráfego atingido. Retome após o intervalo informado.'},{status:429,headers:{'Retry-After':String(retry)}});
  }catch{return NextResponse.json({error:'Proteção de tráfego indisponível.'},{status:503});}
 }else if(cost&&!limitar('download:'+ip,1000,86400000,cost))return NextResponse.json({error:'Cota diária de questões atingida. Retome amanhã.'},{status:429,headers:{'Retry-After':'86400'}});
 if(!['GET','HEAD','OPTIONS'].includes(req.method))try{await readLimitedText(req.clone(),path==='/api/stripe/webhook'?1048576:32768);}catch{return NextResponse.json({error:'Corpo excede o limite.'},{status:413});}
 return NextResponse.next();
}
export const config={matcher:'/api/:path*'};
