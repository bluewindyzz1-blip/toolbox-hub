const entry = await import('../dist/server-ssr/entry-server.js');
for (const p of ['/about','/guide','/privacy','/contact','/guides']) {
  const h = entry.render(p);
  console.log(p, h.includes('페이지를 찾을 수 없습니다'), h.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1] || 'NO_H1', h.slice(0,160));
}
