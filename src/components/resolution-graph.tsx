'use client';
import {useEffect,useRef} from 'react';
export function ResolutionGraph({funcao,pontos}:{funcao:string;pontos:[number,number][]}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{let cancelled=false;const target=ref.current;if(!target)return;import('function-plot').then(({default:plot})=>{if(cancelled)return;target.replaceChildren();plot({target,width:Math.min(target.clientWidth||320,600),height:280,grid:true,xAxis:{domain:[Math.min(...pontos.map(p=>p[0])),Math.max(...pontos.map(p=>p[0]))]},data:[{fn:funcao}]});}).catch(()=>target.replaceChildren());return()=>{cancelled=true;};},[funcao,pontos]);
 return <div ref={ref} aria-hidden="true" className="v2-graph"/>;
}
