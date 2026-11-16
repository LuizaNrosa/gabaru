'use client';
import {sanitizePlainText} from '@/lib/security/content';
/** Plain source text stays selectable and React-escaped on server and client. */
export function SafeText({text}:{text?:string|null}){return <span>{sanitizePlainText(text??'')}</span>;}
