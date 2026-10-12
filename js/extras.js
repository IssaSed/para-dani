(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Sobre de bienvenida + música */
  const music = document.getElementById('bgMusic');
  const pbtn = document.getElementById('playBtn');
  const hint0 = document.getElementById('musicHint');
  const player = document.querySelector('.music-player');
  let target = 0.1, started = false;   // volumen inicial: 10 %
  const vol = document.createElement('input');
  vol.type='range'; vol.min=0; vol.max=1; vol.step=0.05; vol.value=target; vol.className='vol'; vol.setAttribute('aria-label','Volumen');
  if (player) player.appendChild(vol);
  vol.addEventListener('input', ()=>{ target=+vol.value; if(music) music.volume=target; });
  const evs=['pointerdown','touchstart','click','keydown'];
  function startMusic(){
    if(!music||started) return;
    music.volume=target;
    const p=music.play();
    if(p&&p.then) p.then(()=>{ started=true; if(pbtn) pbtn.textContent='❚❚'; if(hint0) hint0.style.display='none'; evs.forEach(e=>document.removeEventListener(e,startMusic)); }).catch(()=>{});
  }

  const ov = document.createElement('div');
  ov.id = 'envOverlay';
  ov.innerHTML = '<h2>Para Dani 🌸</h2><div class="env"><div class="letter">Ábreme ✨</div><div class="front"></div><div class="flap"></div><div class="seal">🌸</div></div><p class="tap">Toca para abrir</p>';
  document.body.appendChild(ov);
  document.body.style.overflow = 'hidden';
  let opened = false;
  ov.addEventListener('click', function(){
    if (opened) return; opened = true;
    ov.querySelector('.env').classList.add('open');
    startMusic();
    setTimeout(()=>{ ov.classList.add('gone'); document.body.style.overflow=''; }, 1300);
    setTimeout(()=>ov.remove(), 2400);
  });

  /* Reducir pétalos (quita 1 de cada 3) */
  (function(){
    const box = document.getElementById('petals-container');
    if (!box) return;
    Array.from(box.children).forEach((el,i)=>{ if (i % 3 === 2) el.remove(); });
  })();

  /* 2. Tarjetas al hacer scroll */
  const items = document.querySelectorAll('.timeline-item');
  const io = new IntersectionObserver(es=>es.forEach(e=>{
    if (e.isIntersecting){ e.target.classList.remove('dim'); e.target.querySelector('.card').classList.add('in'); io.unobserve(e.target); }
  }),{threshold:.12, rootMargin:'0px 0px -8% 0px'});
  items.forEach(it=>{ it.classList.add('dim'); it.querySelector('.card').classList.add('reveal'); io.observe(it); });

  /* 3. Tulipanes: desfase + abrir/cerrar con el scroll */
  const tulipWraps = [];
  document.querySelectorAll('.tulip-band use[href="#tulipFlower"]').forEach((u,i)=>{
    const x=+u.getAttribute('x'), y=+u.getAttribute('y'), w=+u.getAttribute('width'), h=+u.getAttribute('height');
    const pivot = (x + w/2)+'px '+(y + h*214/280)+'px';
    u.style.transformOrigin = pivot;
    u.style.animationDelay = (-i*0.7)+'s';
    u.style.animationDuration = (4.2 + (i%4)*0.6)+'s';
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('class','tulip-wrap');
    g.style.transformOrigin = pivot;
    u.parentNode.insertBefore(g,u);
    g.appendChild(u);
    tulipWraps.push({el:g, offset:(i%5)*0.05});
  });

  /* Sol/luna */
  const celWrap = document.createElement('div'); celWrap.id='celestial';
  const sunB = document.createElement('div'); sunB.id='sunBody'; sunB.className='cel-body';
  const moonB = document.createElement('div'); moonB.id='moonBody'; moonB.className='cel-body';
  celWrap.appendChild(sunB); celWrap.appendChild(moonB);
  document.body.appendChild(celWrap);

  /* Atardecer con el scroll */
  (function(){
    const day =['#d6e8ff','#9fc6f8','#7eaeee','#a9a3e6'];
    const gold=['#a9b8f0','#e9b0c8','#ffb98a','#ffd08a'];
    const dusk=['#3a2570','#7a3f9e','#d4527f','#ff8f45'];
    const pos=[0,28,62,100];
    const rgb=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
    const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
    const sky=document.createElement('div'); sky.id='sky';
    const glow=document.createElement('div'); glow.id='sunGlow';
    document.body.appendChild(sky); document.body.appendChild(glow);
    document.documentElement.style.background='#9fc6f8';
    document.body.style.background='transparent';
    let ticking=false;
    function paint(){
      ticking=false;
      const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
      const p=Math.min(1,Math.max(0,scrollY/max));
      const stops=pos.map((pc,i)=>{
        const c = p<.5 ? mix(rgb(day[i]),rgb(gold[i]),p*2) : mix(rgb(gold[i]),rgb(dusk[i]),(p-.5)*2);
        return 'rgb('+c.join(',')+') '+pc+'%';
      });
      sky.style.background='linear-gradient(180deg,'+stops.join(',')+')';
      const g=Math.min(1,Math.max(0,(p-.35)/.65));
      glow.style.opacity=(g*g*(3-2*g)).toFixed(3);
      const cc=mix([255,255,255],[255,160,120],p);
      document.documentElement.style.setProperty('--cloudc','rgba('+cc.join(',')+','+(0.55-0.07*p).toFixed(2)+')');

      const xPct = 6 + 84*p;
      const arc = Math.sin(Math.min(1,p)*Math.PI) * 26;
      sunB.style.left = xPct+'%'; sunB.style.top = (18-arc)+'px';
      moonB.style.left = xPct+'%'; moonB.style.top = (18-arc)+'px';
      sunB.style.opacity = Math.max(0, 1 - p*1.5).toFixed(2);
      moonB.style.opacity = Math.min(1, Math.max(0,(p-0.35)*1.6)).toFixed(2);

      tulipWraps.forEach(({el,offset})=>{
        const e = Math.min(1, Math.max(0, (p-offset)*1.25));
        const sx = 0.8 + 0.2*e, sy = 0.52 + 0.48*e;
        el.style.transform = 'scale('+sx.toFixed(3)+','+sy.toFixed(3)+')';
      });
    }
    addEventListener('scroll',()=>{ if(!ticking){ticking=true;requestAnimationFrame(paint);} },{passive:true});
    addEventListener('resize',paint);
    paint();
  })();

  if (reduce) return;

  /* 4. Nubes */
  [[8,220,60,70],[22,300,80,110],[40,180,50,90],[12,260,70,140],[55,240,64,100]].forEach(([top,w,h,dur],i)=>{
    const c = document.createElement('div');
    c.className = 'cloud';
    c.style.cssText = `top:${top}%;width:${w}px;height:${h}px;animation-duration:${dur}s;animation-delay:${-i*dur/5}s;opacity:${0.5+ (i%3)*0.15}`;
    document.body.appendChild(c);
  });

  /* 5. Mariposas */
  const svg = c1 => `<svg viewBox="0 0 40 30"><g class="wl"><ellipse cx="11" cy="10" rx="10" ry="8" fill="${c1}"/><ellipse cx="12" cy="21" rx="7" ry="6" fill="#f9a8d4"/></g><g class="wr"><ellipse cx="29" cy="10" rx="10" ry="8" fill="${c1}"/><ellipse cx="28" cy="21" rx="7" ry="6" fill="#f9a8d4"/></g><rect x="19" y="6" width="2" height="18" rx="1" fill="#7a2246"/></svg>`;
  function butterfly(){
    const b = document.createElement('div');
    b.className = 'bfly';
    b.innerHTML = svg(Math.random()<.5 ? '#ec4899' : '#f4c430');
    document.body.appendChild(b);
    const W = innerWidth, H = innerHeight, ltr = Math.random()<.5;
    const n = 7, kf = [];
    let y = H*(0.15+Math.random()*0.5);
    for (let i=0;i<=n;i++){
      const x = (ltr ? -40 + (W+80)*i/n : W+40 - (W+80)*i/n);
      y = Math.max(60, Math.min(H-120, y + (Math.random()-.5)*160));
      kf.push({transform:`translate(${x}px,${y}px) rotate(${(Math.random()-.5)*30}deg)`});
    }
    const a = b.animate(kf,{duration:14000+Math.random()*5000,easing:'ease-in-out'});
    a.onfinish = ()=>b.remove();
  }
  setTimeout(butterfly, 6000);
  setInterval(()=>{ butterfly(); if (Math.random()<.5) setTimeout(butterfly,1500); }, 16000);

  /* 6. Woodstock aterriza junto al botón */
  const link = document.querySelector('.btn-whatsapp');
  const bird = document.getElementById('woodstock');
  const trail = document.getElementById('trail-layer');
  if (link && bird){
    const perch = document.createElement('img');
    perch.className = 'perch'; perch.src = bird.src; perch.alt = ''; perch.setAttribute('aria-hidden','true');
    link.appendChild(perch);
    new IntersectionObserver(es=>es.forEach(e=>{
      const land = e.isIntersecting;
      perch.classList.toggle('on', land);
      bird.style.visibility = land ? 'hidden' : 'visible';
      if (trail) trail.style.display = land ? 'none' : '';
    }),{threshold:.9}).observe(link);
  }
})();