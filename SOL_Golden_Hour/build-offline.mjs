import {readFile,writeFile} from 'node:fs/promises';
import {lanes} from './content.mjs';
const root=new URL('./',import.meta.url),pub=new URL('./public/',root);
const css=await readFile(new URL('assets/site.css',pub),'utf8');
const js=await readFile(new URL('assets/app.js',pub),'utf8');
const photo='data:image/webp;base64,'+(await readFile(new URL('assets/solar-roof.webp',pub))).toString('base64');
const favicon='data:image/svg+xml;base64,'+(await readFile(new URL('assets/favicon.svg',pub))).toString('base64');
const routes=['/','/daybreak/','/command/','/fit/','/contact/','/review-gallery/','/privacy/','/media-notes/',...lanes.map(l=>'/'+l.path+'/')];
const pages={};
for(const route of routes){
 let html=await readFile(new URL(route==='/'?'index.html':route.slice(1)+'index.html',pub),'utf8');
 html=html.replaceAll('/assets/solar-roof.webp',photo);
 pages[route]=Buffer.from(html).toString('base64');
}
const escape=s=>JSON.stringify(s).replaceAll('<','\\u003c');
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Sol Solar Solutions — Portable Preview</title><link rel="icon" href="${favicon}"><style>${css}</style></head><body><noscript><main class="report"><h1>Sol Solar Solutions</h1><p>This interactive file needs JavaScript. Open the hosted preview in your browser to explore the website.</p><a href="tel:+19495915731">Call (949) 591-5731</a></main></noscript><script>
const pages=${escape(pages)},app=${escape(js)};
window.SOL_OFFLINE=true;
function showRoute(href){
 const u=new URL(href,'https://sol-preview.invalid');
 const route=u.pathname.endsWith('/')?u.pathname:u.pathname+'/';
 if(!Object.hasOwn(pages,route))return;
 const html=new TextDecoder().decode(Uint8Array.from(atob(pages[route]),c=>c.charCodeAt(0)));
 const doc=new DOMParser().parseFromString(html,'text/html');
 document.title=doc.title;
 document.body.className=doc.body.className;
 document.body.dataset.kind=doc.body.dataset.kind;
 document.body.innerHTML=doc.body.innerHTML;
 window.SOL_PREVIEW_QUERY=u.search;
 const script=document.createElement('script');script.textContent=app;document.body.append(script);
 window.scrollTo(0,0);
 if(u.hash)document.getElementById(decodeURIComponent(u.hash.slice(1)))?.scrollIntoView();
}
document.addEventListener('click',e=>{
 const a=e.target.closest('a[href]');if(!a)return;
 const href=a.getAttribute('href');if(!href.startsWith('/')||href.startsWith('//'))return;
 e.preventDefault();showRoute(href);
});
showRoute('/');
</script></body></html>`;
await writeFile(new URL('SOL_Golden_Hour_START_HERE.html',root),html);
console.log('Portable full-page preview built: '+routes.length+' routes. No embedded frame and no online capture.');
