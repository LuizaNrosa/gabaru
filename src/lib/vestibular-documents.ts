export type ArchiveDocument = {
  id: string; institution: string; year: number; application: string;
  label: string; kind: string; url: string; source: string; phase?: string;
  sha256: string; bytes: number; pages: number; startPage: number;
};
export function documentUrl(d: ArchiveDocument) { return `/api/v1/vestibulares/${d.institution}/${d.id}`; }
export function applicationName(application: string) { return application === "meio-de-ano" ? "Meio de ano" : application === "segundo-vestibular" ? "2º vestibular" : "Vestibular regular"; }
