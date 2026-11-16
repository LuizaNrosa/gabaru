import {sanitizePlainText,sanitizeMath} from '@/lib/security/content';
import katex from 'katex';
/** Only math delimiters are interpreted. All prose remains React-escaped text. */
export function MathText({ text }: { text: string }) {
  return <span className="v2-prose">{text.split(/(\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$)/g).map((part, i) => {
    const inline = part.startsWith('\\(') && part.endsWith('\\)');
    const display = part.startsWith('$$') && part.endsWith('$$');
    if (!inline && !display) return <span key={i}>{sanitizePlainText(part)}</span>;
    return <span key={i} className="v2-math" dangerouslySetInnerHTML={{ __html: sanitizeMath(katex.renderToString(part.slice(2,-2), { output:'htmlAndMathml', displayMode:display, throwOnError:false, trust:false, strict:'warn' })) }} />;
  })}</span>;
}
