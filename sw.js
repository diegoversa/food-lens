const CACHE='foodlens-v1';
const PARAMS_KEY='foodlens-last-params';

self.addEventListener('install',event=>{
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate',event=>{
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch',event=>{
  if(event.request.mode!=='navigate')return;
  const url=new URL(event.request.url);
  const isRoot=url.pathname.endsWith('/')||url.pathname.endsWith('/index.html');
  if(!isRoot||url.search)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const saved=await cache.match(PARAMS_KEY);
    if(saved){
      const params=await saved.text();
      if(params){
        return Response.redirect(url.pathname+params,302);
      }
    }
    return fetch(event.request);
  })());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SAVE_PARAMS'){
    caches.open(CACHE).then(cache=>{
      cache.put(PARAMS_KEY,new Response(event.data.params||''));
    });
  }
});
