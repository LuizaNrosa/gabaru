import {getServerEnv} from '../../env.mjs';
import 'server-only';import {MercadoPagoProvider} from './mercado-pago';import type {BillingProvider} from './types';
export function getBillingProvider():BillingProvider{const config=getServerEnv();if((config.BILLING_PROVIDER??'mercadopago')!=='mercadopago')throw Error('billing-unavailable');const token=config.MP_ACCESS_TOKEN||config.MERCADO_PAGO_ACCESS_TOKEN,secret=config.MP_WEBHOOK_SECRET||config.MERCADO_PAGO_WEBHOOK_SECRET,collectorId=config.MERCADO_PAGO_COLLECTOR_ID;if(!token||!secret||!collectorId)throw Error('billing-unavailable');let baseUrl:string|undefined;
 // Transporte local restrito à fixture demo; autenticação do produto continua integral.
 if(config.BILLING_EMULATOR_URL){const u=new URL(config.BILLING_EMULATOR_URL);if(config.VERCEL||!config.FIREBASE_ADMIN_PROJECT_ID?.startsWith('demo-')||!/^127\.0\.0\.1:\d+$/.test(config.FIRESTORE_EMULATOR_HOST??'')||u.protocol!=='http:'||u.hostname!=='127.0.0.1')throw Error('invalid-billing-emulator');baseUrl=u.origin;}
 return new MercadoPagoProvider({token,secret,collectorId,origin:'https://gabaru.com.br',...(baseUrl?{baseUrl}:{})});}
