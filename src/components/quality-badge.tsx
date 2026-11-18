import type { NivelQualidade } from '@/lib/catalogo/types';
import { Simbolo } from './logo';

export function QualityBadge({ nivel, carimbo = false }: { nivel: NivelQualidade; carimbo?: boolean }) {
  const label = nivel === 'nivel-2-resolucao-comentada'
    ? 'Resolução comentada verificada'
    : nivel === 'nivel-1-gabarito-oficial' ? 'Gabarito oficial conferido' : 'Em revisão editorial';
  const verifiedStamp = carimbo && nivel !== 'nivel-0-quarentena';

  return (
    <span className={verifiedStamp ? 'v2-quality gb-quality-stamp' : 'v2-quality'} data-level={nivel}
      title="A verificação automática confere estrutura, integridade dos arquivos e concordância com o gabarito cadastrado.">
      {verifiedStamp && <Simbolo />}
      {label}
    </span>
  );
}
