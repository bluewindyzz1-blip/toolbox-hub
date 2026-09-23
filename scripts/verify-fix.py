import re
from pathlib import Path
root=Path('dist/public')
sm=Path('client/public/sitemap.xml').read_text()
urls=re.findall(r'<loc>https://carculate\.moneyko\.co\.kr([^<]*)</loc>',sm)
problems=[]
for route in urls:
    route=route.split('?')[0]
    f=root/'index.html' if route=='/' else root/route.strip('/')/'index.html'
    if not f.exists():
        problems.append((route,'MISSING')); continue
    b=f.read_text()
    title=re.search(r'<title>(.*?)</title>',b,re.S)
    canon=re.search(r'<link rel="canonical" href="([^"]+)"',b)
    if not title or '페이지를 찾을 수 없습니다' in title.group(1) or not canon or canon.group(1).rstrip('/') != ('https://carculate.moneyko.co.kr'+route).rstrip('/'):
        problems.append((route,title.group(1) if title else 'NO_TITLE',canon.group(1) if canon else 'NO_CANON'))
print('SITEMAP_COUNT',len(urls))
print('PROBLEMS',len(problems))
for p in problems: print(p)
print('LEGACY_GUIDE_SITEMAP', 'https://carculate.moneyko.co.kr/guide</loc>' in sm)
print('DOCUMENT_SITEMAP', 'https://carculate.moneyko.co.kr/document</loc>' in sm)
print('SEARCH_SITEMAP', 'https://carculate.moneyko.co.kr/search</loc>' in sm)
