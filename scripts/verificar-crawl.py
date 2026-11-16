"""Parse actual HTTP XML and verify canonical URLs, robots rules and editorial gates."""
import json, os, urllib.request, xml.etree.ElementTree as ET
origin='https://www.gabaru.com.br'
base=os.environ.get('VERIFY_BASE_URL','http://localhost:3000')
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
cat=json.load(open('src/data/catalogo-v2.json'))
complete={origin+'/questoes/'+q['slug'] for q in cat['questoes'] if q['statusPublicacao']=='completa'}
def get(path):
 with urllib.request.urlopen(base+path) as r:return r.read().decode()
root=ET.fromstring(get('/sitemap.xml'));assert root.tag.endswith('sitemapindex')
parts=[n.text for n in root.findall('s:sitemap/s:loc',ns)]
assert len(parts)==len(set(parts))
for part in parts:assert part.startswith(origin+'/sitemap-')
for name in ['hubs','provas','disciplinas','questoes']:
 doc=ET.fromstring(get('/sitemap-'+name+'.xml'));assert doc.tag.endswith('urlset')
 urls=[n.text for n in doc.findall('s:url/s:loc',ns)]
 assert len(urls)==len(set(urls)),name
 assert all(u.startswith(origin+'/') and '?' not in u for u in urls)
 if name=='questoes':assert set(urls)==complete
 for entry in doc.findall('s:url',ns):
  last=entry.find('s:lastmod',ns)
  if last is not None:assert len(last.text)==10 and last.text[:4].isdigit()
 print(f'sitemap-{name}.xml: XML válido; {len(urls)} URLs canônicas; '+('registrado' if origin+'/sitemap-'+name+'.xml' in parts else 'fora do índice por ausência de conteúdo completo'))
robots=get('/robots.txt')
for agent in ['Googlebot','Bingbot','OAI-SearchBot','ChatGPT-User','GPTBot','ClaudeBot','Google-Extended','PerplexityBot']:assert 'User-Agent: '+agent in robots or 'User-agent: '+agent in robots
assert 'Sitemap: '+origin+'/sitemap.xml' in robots
for rule in ['/api/','/painel','/*?*sort=','/*?*page=','/*?*busca=']:assert 'Disallow: '+rule in robots
assert 'Disallow: /\n' not in robots
print('robots.txt: agentes, bloqueios de filtros e declaração de sitemap válidos')
for path in ['/llms.txt','/llms-full.txt']:
 text=get(path);assert '# Gabaru' in text and origin in text
 print(path+': disponível e coerente com o domínio canônico')
print(f'sitemap.xml: índice válido; {len(parts)} partes não vazias')
