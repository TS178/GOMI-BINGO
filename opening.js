/* 海・ゴ・ミ launch individually, then BINGO! launches as one group. */
(() => {
  'use strict';
  const letters = '海ゴミBINGO!';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const FIRST_LETTER = 1700, LETTER_INTERVAL = 600, LETTER_FLIGHT = 550;
  const LOGO_COMPLETE = 4200, OPENING_END = 6100;
  let current = null;
  let starting = false;
  let soundEnabled = false;
  const logo = () => gameLogoMarkup();
  // A solid barrel-shaped lid: curved wooden staves, two end caps and a flat inner face.
  // The shell and the inner face rotate together around the existing rear hinge.
  const lidShell = `<div class="sb-lid-shell">${Array.from({length:24},(_,i)=>{
    const start=i*Math.PI/24,end=(i+1)*Math.PI/24;
    const y=(1-Math.cos(start))/2,z=Math.sin(start)*.72;
    const dy=(1-Math.cos(end))/2-y,dz=Math.sin(end)*.72-z,shine=Math.sin((start+end)/2);
    return `<i class="sb-lid-stave" style="--sy:${y};--sz:${z};--sl:${Math.hypot(dy,dz)};--sa:${Math.atan2(dz,dy)*180/Math.PI}deg;--wood:hsl(28 67% ${46+18*shine}%);--band:hsl(43 95% ${61+23*shine}%);--seam:${i%4===0?'#894a2d77':'transparent'}"></i>`;
  }).join('')}${['left','right'].map(side=>`<svg class="sb-lid-cap ${side}" viewBox="0 0 130 93.6" preserveAspectRatio="xMidYMid meet"><path d="M0 93.6A65 93.6 0 0 1 130 93.6Z" fill="#ffdb70"/><path d="M6 88A59 81 0 0 1 124 88Z" fill="#b7753d"/><path d="M14 84A51 70 0 0 1 116 84" fill="none" stroke="#e5a25b" stroke-width="4"/><path d="M22 67H108M42 38H88" stroke="#98572f" stroke-width="2"/></svg>`).join('')}</div>`;
  const chest = `<div class="sb-chest" aria-hidden="true"><div class="sb-chest-inside"></div><div class="sb-hinges"></div>
    <div class="sb-chest-lid">
    <svg class="sb-lid-face sb-lid-outside" viewBox="0 0 320 130" preserveAspectRatio="none"><defs><linearGradient id="sbWoodL" x2=".2" y2="1"><stop stop-color="#ffc084"/><stop offset=".5" stop-color="#d68342"/><stop offset="1" stop-color="#a55730"/></linearGradient><linearGradient id="sbGold" x2=".4" y2="1"><stop stop-color="#fff6aa"/><stop offset=".45" stop-color="#ffcf48"/><stop offset="1" stop-color="#e6a12b"/></linearGradient></defs>
      <path d="M31 125V30Q31 5 59 5H261Q289 5 289 30V125Z" fill="url(#sbWoodL)" stroke="#a56630" stroke-width="5"/>
      <path d="M39 43H281M35 81H285" stroke="#ae6632" stroke-width="4"/>
      <path d="M39 47H281M35 85H285" stroke="#f9ba7c" stroke-width="3"/>
      <path d="M37 121V31Q37 11 60 11H260Q283 11 283 31V121ZM85 12V120M235 12V120" fill="none" stroke="url(#sbGold)" stroke-width="12" stroke-linejoin="round"/>
      <path d="M50 31Q50 22 65 22H256" fill="none" stroke="#fff6cb" stroke-width="4" stroke-linecap="round"/>
      <path d="m160 42 10 20 22 3-16 15 4 23-20-11-20 11 4-23-16-15 22-3Z" fill="#ffe998" stroke="#b87931" stroke-width="2"/>
      <g fill="#fff6c6"><circle cx="85" cy="106" r="4"/><circle cx="235" cy="106" r="4"/></g>
    </svg>
    <svg class="sb-lid-face sb-lid-inside" viewBox="0 0 320 130" preserveAspectRatio="none">
      <path d="M31 125V30Q31 5 59 5H261Q289 5 289 30V125Z" fill="#9c552e" stroke="#c58b2b" stroke-width="6"/>
      <path d="M43 114V32Q43 18 61 18H259Q277 18 277 32V114Z" fill="#c67e42" stroke="url(#sbGold)" stroke-width="12" stroke-linejoin="round"/>
      <path d="M53 53H267M52 85H268" stroke="#a86637" stroke-width="3"/>
      <path d="M55 39Q55 29 68 29H254" fill="none" stroke="#fff3b4" stroke-width="4" stroke-linecap="round"/>
      <path d="m160 43 23 25-23 25-23-25Z" fill="#ffe897" stroke="#edb64a" stroke-width="3"/>
      <path d="m160 51-15 17 15-6Z" fill="#fffce3"/>
      <path d="M43 120H277" stroke="#fff0a0" stroke-width="7" stroke-linecap="round"/>
      <circle cx="66" cy="105" r="4" fill="#fff5bb"/><circle cx="254" cy="105" r="4" fill="#fff5bb"/>
    </svg>
    ${lidShell}
    </div>
    <svg class="sb-chest-base" viewBox="0 0 320 240"><defs><linearGradient id="sbWoodB" x2=".25" y2="1"><stop stop-color="#eda262"/><stop offset=".45" stop-color="#c47a3e"/><stop offset="1" stop-color="#a65a31"/></linearGradient></defs>
    <path d="M31 112H289L278 207Q277 222 260 224H61Q44 222 42 207Z" fill="url(#sbWoodB)" stroke="#98562c" stroke-width="5"/>
    <path d="M42 145H281M44 180H278M96 126q26-8 48 0m37 34q35 9 52-1M103 202q36-8 66 0" fill="none" stroke="#9b562d" stroke-width="3" opacity=".65"/>
    <path d="M40 121H280M52 209H271M81 119l5 95M239 119l-5 95" fill="none" stroke="url(#sbGold)" stroke-width="18" stroke-linecap="round"/>
    <path d="M40 121H280M82 127l4 76" stroke="#fff3b4" stroke-width="4" stroke-linecap="round"/>
    <circle cx="160" cy="160" r="33" fill="#ffc74c" stroke="#fff1ac" stroke-width="5"/>
    <path d="m160 134 8 16 18 3-13 12 3 19-16-9-16 9 3-19-13-12 18-3Z" fill="#fff2a9" stroke="#d6932a" stroke-width="2"/>
    <path d="M164 153a6 6 0 1 0-8 0l-2 9h12Z" fill="#955729"/>
    <g fill="#fff6bf"><circle cx="85" cy="133" r="4"/><circle cx="88" cy="201" r="4"/><circle cx="235" cy="133" r="4"/><circle cx="233" cy="201" r="4"/></g>
    </svg></div>`;

  function finish() {
    const run = current;
    if (!run || run.ending) return;
    run.ending = true;
    run.timers.forEach(clearTimeout);
    if (run.audio) run.audio.close().catch(() => {});
    run.el.classList.add('sb-ending');
    setTimeout(() => {
      run.el.getAnimations({subtree:true}).forEach(a => a.cancel());
      run.el.remove();
      run.app.inert = run.previousInert;
      document.body.style.overflow = run.previousOverflow;
      current = null;
      const target = run.focusBefore?.isConnected && run.focusBefore !== document.body ? run.focusBefore : (document.querySelector('.start-button') || document.querySelector('.nav-tab'));
      target?.focus({preventScroll:true});
    }, motion.matches ? 150 : 650);
  }

  window.startSeaOpening = async function () {
    if (current || starting) return;
    starting=true;
    // Logo sprites can animate immediately; text fonts load independently.
    await gameLogoReady();
    starting=false;
    if(current) return;
    const el = document.createElement('section');
    el.className = 'sb-opening';
    el.setAttribute('role','dialog');
    el.setAttribute('aria-modal','true');
    el.setAttribute('aria-label','海ゴミBINGO！ オープニング');
    el.innerHTML = `<div class="sb-scene" aria-hidden="true"><div class="sb-party-rays"></div><div class="sb-party-ring"></div><div class="sb-sprinkles"><i>✦</i><i>●</i><i>✦</i><i>●</i><i>✦</i><i>●</i></div><div class="sb-shadow"></div><div class="sb-glow"></div>${chest}<div class="sb-title">${logo()}</div><span class="sb-kirakira">✦</span><span class="sb-kirakira second">✦</span><div class="sb-progress"></div></div><div class="sb-controls"><button type="button" class="sb-control sb-sound" aria-pressed="false">♪ 音をつける</button><button type="button" class="sb-control sb-skip">スキップ →</button></div>`;
    const app = document.querySelector('.app');
    const run = current = {el,app,timers:[],audio:null,ending:false,focusBefore:document.activeElement,previousInert:app.inert,previousOverflow:document.body.style.overflow};
    app.inert = true;
    document.body.style.overflow = 'hidden';
    document.body.appendChild(el);
    // A fixed mask at the front rim hides the letters while they are inside.
    // It belongs to the scene, not to the moving glyphs.
    const flightLayer = document.createElement('div');
    flightLayer.className = 'sb-letter-flight';
    const title = el.querySelector('.sb-title');
    title.before(flightLayer);
    flightLayer.appendChild(title);
    const later = (fn, delay) => run.timers.push(setTimeout(() => {if(!run.ending) fn();}, delay));
    const skip = el.querySelector('.sb-skip');
    const sound = el.querySelector('.sb-sound');
    skip.addEventListener('click',finish);
    skip.focus({preventScroll:true});
    el.addEventListener('keydown', e => {
      if(e.key === 'Escape'){e.preventDefault();finish();}
      if(e.key === 'Tab'){e.preventDefault();(document.activeElement === skip ? sound : skip).focus();}
    });
    function tone(freq, duration=.14, type='sine', volume=.065) {
      if (!soundEnabled || !run.audio || run.audio.state !== 'running') return;
      const ctx=run.audio, now=ctx.currentTime, oscillator=ctx.createOscillator(), gain=ctx.createGain();
      oscillator.type=type;oscillator.frequency.setValueAtTime(freq*.7,now);oscillator.frequency.exponentialRampToValueAtTime(freq,now+.035);
      gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+.015);gain.gain.exponentialRampToValueAtTime(.001,now+duration);
      oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(now);oscillator.stop(now+duration+.02);
    }
    async function enableAudio() {
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if(!Audio) throw new Error('Audio unavailable');
        run.audio ||= new Audio();
        await run.audio.resume();
        if(run.ending) return;
        sound.setAttribute('aria-pressed',String(soundEnabled));
        sound.textContent=soundEnabled ? '♪ 音あり' : '♪ 音なし';
        if(soundEnabled) tone(660,.1);
      } catch {soundEnabled=false;sound.textContent='音声は利用できません';sound.disabled=true;}
    }
    sound.addEventListener('click',() => {soundEnabled=!soundEnabled;enableAudio();});
    if(soundEnabled) enableAudio();
    if(!motion.matches) {
      const box=el.getBoundingClientRect();
      // Fixed, large chest: launch from its front rim, never from off-screen.
      const chestW=parseFloat(getComputedStyle(el.querySelector('.sb-chest')).width);
      const chestTop=parseFloat(getComputedStyle(el.querySelector('.sb-chest')).top);
      const origin={x:box.width*.5,y:chestTop+chestW/1.35*(112/240-.5)};
      flightLayer.style.setProperty('--mouth-y',`${origin.y}px`);
      const units=[...el.querySelectorAll('.sb-title .logo-line:first-child .logo-character'),el.querySelector('.sb-title .logo-line:last-child')];
      units.forEach((letter,i) => {
        letter.dataset.launchUnit=String(i);
        if(i===3)letter.classList.add('sb-bingo-group');
        const rect=letter.getBoundingClientRect(), x=origin.x-(rect.left+rect.width/2), y=origin.y-(rect.top+rect.height/2);
        const delay=FIRST_LETTER+i*LETTER_INTERVAL;
        // Rise vertically through the same opening before travelling sideways.
        // Finish this letter's flight before the next letter starts.
        const hidden=`translate(${x}px,${y+rect.height*.4+16}px) scale(.5)`;
        letter.animate([
          {opacity:0,transform:hidden,offset:0},
          {opacity:1,transform:hidden,offset:.001},
          {opacity:1,transform:`translate(${x}px,${y-rect.height*.32}px) scale(.65) rotate(-12deg)`,offset:.25},
          {opacity:1,transform:`translate(${x*.62}px,${-rect.height*.65}px) scale(1.15) rotate(${i%2?18:-18}deg)`,offset:.52},
          {opacity:1,transform:'translate(0,-16px) scale(1.1,.96) rotate(-4deg)',offset:.78},
          {opacity:1,transform:'translate(0,4px) scale(.98,1.03) rotate(1deg)',offset:.91},
          {opacity:1,transform:'translate(0,0) scale(1) rotate(0)',offset:1}
        ],{duration:LETTER_FLIGHT,delay,fill:'both',easing:'linear',id:`sb-flight-${i}`});
        letter.animate([{transform:'translateY(0) rotate(0)'},{transform:`translateY(-7px) rotate(${i%2 ? 2 : -2}deg)`},{transform:'translateY(0) rotate(0)'}],{duration:1800,delay:LOGO_COMPLETE+i*90,iterations:Infinity,composite:'add'});
        later(() => tone([523,659,784,1047][i],.19,'triangle'),delay+70);
        // A little burst per letter makes each launch feel like popping corn.
        for(let j=0;j<4;j++){
          const spark=document.createElement('i');spark.className='sb-particle star';
          spark.style.cssText=`top:${origin.y}px;--color:${['#fff18b','#ff83be','#a4ffed','#d3b0ff'][j]}`;
          el.querySelector('.sb-scene').appendChild(spark);
          const dx=(j-1.5)*45,dy=-50-Math.abs(j-1.5)*12;
          spark.animate([{opacity:0,transform:'scale(.2)'},{opacity:1,transform:`translate(${dx*.5}px,${dy*.7}px) scale(.8)`,offset:.3},{opacity:0,transform:`translate(${dx}px,${dy}px) scale(.2) rotate(90deg)`}],{duration:420,delay:delay+80,fill:'both'});
        }
      });
      const colors=['#ffcc4e','#ff89b7','#93eacc','#b09bff','#fbf5a4','#69d7fa'];
      for(let i=0;i<34;i++) {
        const p=document.createElement('i');p.className=`sb-particle ${i%3 ? 'star' : 'drop'}`;p.style.setProperty('--color',colors[i%6]);p.style.top=origin.y+'px';el.querySelector('.sb-scene').appendChild(p);
        const angle=-Math.PI*.95+(i%17)/16*Math.PI*.9, radius=Math.min(box.width*.44,440)*( .65+(i%5)*.085), x=Math.cos(angle)*radius,y=Math.sin(angle)*radius;
        p.animate([{opacity:0,transform:'translate(-50%,-50%) scale(.1)'},{opacity:1,transform:`translate(${x*.55}px,${y*.9}px) rotate(90deg) scale(1.05)`,offset:.35},{opacity:0,transform:`translate(${x}px,${y+100}px) rotate(240deg) scale(.3)`}],{duration:1600+(i%4)*180,delay:1100+(i%7)*60,fill:'both',easing:'ease-out'});
      }
      [580,740,900,1030].forEach(t => later(() => tone(170,.08,'triangle',.04),t));
      [1047,1319,1568,2093].forEach((f,i) => later(() => tone(f,.55,'sine',.045),LOGO_COMPLETE+i*65));
    }
    later(finish,motion.matches ? 1600 : OPENING_END);
  };
  window.closeSeaOpening = finish;
  window.startSeaOpening();
})();
