import {z} from 'zod';
export const checkoutInput=z.object({plan:z.literal('premium'),requestId:z.uuid()}).strict();
export const sessionInput=z.object({idToken:z.string().min(20).max(10000)}).strict();
export const uidInput=z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/);
export async function readLimitedText(req:Request,max=32768){const reader=req.body?.getReader();if(!reader)return '';const decoder=new TextDecoder();let size=0,text='';try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){void reader.cancel();throw Error('body-too-large');}text+=decoder.decode(value,{stream:true});}return text+decoder.decode();}finally{reader.releaseLock();}}
export async function readJsonBody(req:Request){return JSON.parse(await readLimitedText(req)) as unknown;}
