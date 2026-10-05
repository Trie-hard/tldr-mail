async function check() {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  console.log('HTML Length:', html.length);
  const scripts = [...html.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
  console.log('Scripts found:', scripts);
  for (const s of scripts) {
    const sRes = await fetch('http://localhost:3000' + s);
    console.log(`Script ${s}: status ${sRes.status} (${sRes.headers.get('content-type')})`);
  }
}
check().catch(console.error);
