import 'server-only';import {adminDb} from '@/lib/firebase/admin';import {isSubscriptionActive} from '@/lib/security/subscription';
export async function hasPremiumAccess(uid:string){try{const value=(await (await adminDb()).collection('subscriptions').doc(uid).get()).data();return isSubscriptionActive(value,Date.now());}catch{return false;}}
