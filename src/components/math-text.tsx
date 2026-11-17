import {sanitizePlainText,sanitizeMath} from '@/lib/security/content';
import katex from 'katex';
/** Only math delimiters are interpreted. All prose remains React-escaped text. */
export function MathText({ text }: { text: string }) {
  return <span className="v2-prose">{text.split(/(\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|(?<![\p{L}\p{N}])\$(?!\s)[^$\n]+(?<!\s)\$)/gu).map((part, i) => {
    const inline = part.startsWith('\\(') && part.endsWith('\\)');
    const display = part.startsWith('$$') && part.endsWith('$$');
    const dollar = !display && part.startsWith('$') && part.endsWith('$');
    if (!inline && !display && !dollar) return <span key={i}>{sanitizePlainText(part)}</span>;
    return <span key={i} className="v2-math" dangerouslySetInnerHTML={{ __html: sanitizeMath(katex.renderToString(part.slice(dollar ? 1 : 2, dollar ? -1 : -2), { output:'htmlAndMathml', displayMode:display, throwOnError:false, trust:false, strict:'warn' })) }} />;
  })}</span>;
}
