/* Board-only celebration. Leaving the board cancels all pending visuals/dialogs. */
let activeBoardCelebration=null;
function reachLines(opened=state.opened){
 const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
 return lines.filter(line=>line.filter(p=>opened[p]).length===2);
}
function reachTargets(opened=state.opened){
 return [...new Set(reachLines(opened).map(line=>line.find(p=>!opened[p])))];
}
function paintReachTargets(){
 const targets=reachTargets();
 document.querySelectorAll('.board .cell').forEach(cell=>{
  const isReach=targets.includes(Number(cell.dataset.pos));cell.classList.toggle('is-reach',isReach);
  if(isReach)cell.setAttribute('aria-label',`${cell.querySelector('.name')?.textContent||''}：あと1つでビンゴ`);
 });
}
function cancelBoardCelebration(){
 const run=activeBoardCelebration;
 if(!run)return;
 activeBoardCelebration=null;run.cancelled=true;
 run.animations.forEach(a=>a.cancel());run.observer?.disconnect();
 run.cleanups.forEach(fn=>fn());
 run.overlay?.remove();
 document.querySelectorAll('.bingo-glowing').forEach(e=>e.classList.remove('bingo-glowing'));
}
async function showBingoFinale(run,reduced){
 const finale=document.createElement('div');finale.className='bingo-finale';finale.setAttribute('aria-hidden','true');
 finale.innerHTML='<div class="bingo-finale-halo"></div><div class="bingo-petals"></div><div class="bingo-finale-center"><div class="bingo-finale-logo"></div></div>';
 const logo=finale.querySelector('.bingo-finale-logo');
 // Use exactly the same six image assets as the second row of the title logo.
 const title=document.createElement('div');title.innerHTML=gameLogoMarkup();logo.appendChild(title.lastElementChild);
 document.body.appendChild(finale);run.cleanups.push(()=>finale.remove());
 const duration=reduced?1800:3200;
 if(!reduced){
  const animate=(el,frames,timing)=>{const a=el.animate(frames,timing);run.animations.push(a);return a;};
  const colors=['#ff6da9','#ffb3dc','#ffe362','#fff7ca','#54dbe1','#af85ff','#fff'];
  const petals=finale.querySelector('.bingo-petals');
  const count=innerWidth<600?84:126;
  for(let i=0;i<count;i++){
   const petal=document.createElement('i');petal.className=`bingo-petal petal-shape-${i%3}`;
   const side=i%3,fromTop=side===2,x=fromTop?(i*47)%100:side===0?-4:104;
   const peakX=fromTop?x:side===0?14+(i*17)%60:86-(i*17)%60;
   const endX=peakX+((i*23)%41-20),peakY=fromTop?15:-14+(i*13)%43;
   petal.style.setProperty('--petal-color',colors[i%colors.length]);petal.style.setProperty('--petal-size',`${9+(i*7)%13}px`);
   petals.appendChild(petal);
   const spin=(i%2?1:-1)*(360+(i*29)%480);
   animate(petal,[
    {transform:`translate(${x}vw,${fromTop?-8:76}dvh) rotate(0deg) rotateY(0deg)`,opacity:0},
    {transform:`translate(${x*.6+peakX*.4}vw,${fromTop?0:32}dvh) rotate(${spin*.18}deg) rotateY(60deg)`,opacity:1,offset:.18},
    {transform:`translate(${peakX}vw,${peakY}dvh) rotate(${spin*.45}deg) rotateY(170deg)`,opacity:1,offset:.42},
    {transform:`translate(${endX}vw,112dvh) rotate(${spin}deg) rotateY(350deg)`,opacity:0}
   ],{duration:2300+(i%5)*120,delay:(i%9)*45,fill:'both',easing:'linear'});
  }
  animate(logo,[{opacity:0,transform:'scale(.25) rotate(-9deg)'},{opacity:1,transform:'scale(1.12) rotate(3deg)',offset:.13},{opacity:1,transform:'scale(1) rotate(0)',offset:.24},{opacity:1,transform:'scale(1.04) rotate(-1deg)',offset:.65},{opacity:1,transform:'scale(1) rotate(0)',offset:.88},{opacity:0,transform:'scale(.92) rotate(0)'}],{duration,fill:'both',easing:'ease-out'});
  animate(finale.querySelector('.bingo-finale-halo'),[{opacity:0,transform:'scale(.4) rotate(-20deg)'},{opacity:.95,transform:'scale(1) rotate(0)',offset:.18},{opacity:.7,transform:'scale(1.12) rotate(18deg)',offset:.8},{opacity:0,transform:'scale(1.15) rotate(22deg)'}],{duration,fill:'both'});
  const fade=animate(finale,[{opacity:0},{opacity:1,offset:.08},{opacity:1,offset:.9},{opacity:0}],{duration,fill:'both'});
  await Promise.allSettled([fade.finished]);
 }else{
  await new Promise(resolve=>{const timer=setTimeout(resolve,duration);run.cleanups.push(()=>{clearTimeout(timer);resolve();});});
 }
 finale.remove();
}
async function runBoardCelebration(pos,lines,rewards,newReach=[]){
 cancelBoardCelebration();
 const board=document.querySelector('.board');if(!board)return;
 const run=activeBoardCelebration={cancelled:false,animations:[],overlay:null,observer:null,cleanups:[]};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const alive=()=>!run.cancelled&&board.isConnected;
 const medal=board.querySelector(`[data-pos="${pos}"] .clear-medal`);
 // Follow actual animation completion, never a timer that could race a modal.
 if(medal&&!reduced){
  await Promise.allSettled(medal.getAnimations().filter(a=>a.animationName==='clear-arrival').map(a=>a.finished));
  if(!alive())return;
 }
 if(medal){medal.classList.remove('is-landing');medal.closest('.cell').classList.remove('is-clearing');}
 if(lines.length){
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');svg.classList.add('bingo-trails');svg.setAttribute('aria-hidden','true');
  board.appendChild(svg);run.overlay=svg;
  const parts=lines.map((line,index)=>{
   line.forEach(pos=>board.querySelector(`[data-pos="${pos}"]`).classList.add('bingo-glowing'));
   const nodes=['bingo-trail-glow','bingo-trail-core'].map(cls=>{
    const node=document.createElementNS(ns,'line');node.setAttribute('class',cls);node.setAttribute('pathLength','1');svg.appendChild(node);return node;
   });
   const dot=document.createElementNS(ns,'circle');dot.setAttribute('r','8');dot.setAttribute('class','bingo-trail-spark');svg.appendChild(dot);
   return {line,index,nodes,dot,start:null,end:null};
  });
  const position=()=>{
   const r=svg.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);
   const center=pos=>{const q=board.querySelector(`[data-pos="${pos}"]`).getBoundingClientRect();return {x:(q.left+q.right)/2-r.left,y:(q.top+q.bottom)/2-r.top};};
   parts.forEach(p=>{
    p.start=center(p.line[0]);p.end=center(p.line[2]);
    p.nodes.forEach(n=>{n.setAttribute('x1',p.start.x);n.setAttribute('y1',p.start.y);n.setAttribute('x2',p.end.x);n.setAttribute('y2',p.end.y);});
    p.dot.setAttribute('cx',p.start.x);p.dot.setAttribute('cy',p.start.y);
    if(p.sparkAnimation)p.sparkAnimation.effect.setKeyframes([{transform:'translate(0,0)',opacity:0},{transform:'translate(0,0)',opacity:1,offset:.08},{transform:`translate(${p.end.x-p.start.x}px,${p.end.y-p.start.y}px)`,opacity:1,offset:.88},{transform:`translate(${p.end.x-p.start.x}px,${p.end.y-p.start.y}px)`,opacity:0}]);
   });
  };position();
  const status=document.querySelector('.board-footnote');status.setAttribute('role','status');status.textContent=`BINGO! ${completedBingoLines().length}ライン達成！`;
  if(!reduced){
   parts.forEach(p=>{
    const timing={duration:1150,delay:p.index*180,fill:'both',easing:'ease-in-out'};
    p.nodes.forEach(n=>run.animations.push(n.animate([{strokeDashoffset:1,opacity:0},{strokeDashoffset:1,opacity:1,offset:.08},{strokeDashoffset:0,opacity:1,offset:.88},{strokeDashoffset:0,opacity:.85}],timing)));
    p.sparkAnimation=p.dot.animate([{transform:'translate(0,0)',opacity:0},{transform:'translate(0,0)',opacity:1,offset:.08},{transform:`translate(${p.end.x-p.start.x}px,${p.end.y-p.start.y}px)`,opacity:1,offset:.88},{transform:`translate(${p.end.x-p.start.x}px,${p.end.y-p.start.y}px)`,opacity:0}],timing);
    run.animations.push(p.sparkAnimation);
   });
   run.observer=new ResizeObserver(position);run.observer.observe(board);
   await Promise.allSettled(run.animations.map(a=>a.finished));
   if(!alive())return;
  }
  await showBingoFinale(run,reduced);
  if(!alive())return;
 }
 if(!alive())return;
 if(newReach.length){
  const count=reachLines().length;
  const message=count===1?'リーチ！':count===2?'ダブルリーチ！':`${count}リーチ！`;
  const status=document.querySelector('.board-footnote');status.setAttribute('role','status');status.textContent=`${message} 光っているマスでビンゴ！`;
  const callout=document.createElement('div');callout.className=`reach-callout${count>1?' reach-callout-long':''}`;
  callout.setAttribute('aria-hidden','true');callout.innerHTML='<span></span>';callout.firstChild.textContent=message;
  document.body.appendChild(callout);run.cleanups.push(()=>callout.remove());
  if(!reduced){
   run.overlay?.remove();run.observer?.disconnect();
   const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
   svg.classList.add('reach-spotlight');svg.setAttribute('aria-hidden','true');
   svg.innerHTML='<defs><mask id="reach-window" maskUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="white"/></mask></defs><rect width="100%" height="100%" fill="#101c42" fill-opacity=".82" mask="url(#reach-window)"/>';
   const mask=svg.querySelector('mask');
   const holes=newReach.map(pos=>{
    const hole=document.createElementNS(ns,'rect'),ring=document.createElementNS(ns,'rect');
    hole.setAttribute('fill','black');hole.setAttribute('rx','18');mask.appendChild(hole);
    ring.setAttribute('class','reach-ring');ring.setAttribute('rx','18');ring.dataset.pos=pos;svg.appendChild(ring);
    return {pos,hole,ring};
   });
   document.body.appendChild(svg);run.overlay=svg;
   const position=()=>{
    svg.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);
    holes.forEach(({pos,hole,ring})=>{
     const r=board.querySelector(`[data-pos="${pos}"]`).getBoundingClientRect();
     [hole,ring].forEach(n=>{n.setAttribute('x',r.x-2);n.setAttribute('y',r.y-2);n.setAttribute('width',r.width+4);n.setAttribute('height',r.height+4);});
    });
   };position();
   run.observer=new ResizeObserver(position);run.observer.observe(board);
   window.addEventListener('resize',position);run.cleanups.push(()=>window.removeEventListener('resize',position));
   const animation=svg.animate([{opacity:0},{opacity:1,offset:.13},{opacity:1,offset:.82},{opacity:0}],{duration:2200,fill:'both'});
   run.animations.push(animation);await Promise.allSettled([animation.finished]);
   if(!alive())return;
  }else{
   // Keep the message readable without scaling, dimming or flashing.
   await new Promise(resolve=>{const timer=setTimeout(resolve,2200);run.cleanups.push(()=>{clearTimeout(timer);resolve();});});
   if(!alive())return;
  }
 }
 cancelBoardCelebration();
 if(rewards.length)showAwardCelebration(rewards);
}
function showAwardCelebration(kinds){
 const [kind,...remaining]=kinds,complete=kind==='complete';
 const next=remaining.length?`showAwardCelebration(['${remaining.join("','")}'])`:(complete?'showBadgeScreen()':'renderBoard()');
 showModal(`<div class="badge-celebration center"><div class="badge-confetti" aria-hidden="true">${Array.from({length:24},(_,i)=>`<i style="--x:${(i*37)%100}%;--c:${['#ff69b8','#ffd43b','#21d8cf','#4dabf7','#aa84f5'][i%5]};--t:${2.2+(i%5)*.25}s;--delay:${-(i%7)*.32}s"></i>`).join('')}</div><div class="badge-title">${complete?'ぜんぶクリア！':'ビンゴ達成！'}</div><div class="badge-stage">${badgeArt(kind)}</div><div class="badge-sub">${complete?'海のヒーロー':'海のきらめきスター'}</div><p>${complete?'すべてのごみを見つけたね！':'3つそろったね！ バッジをゲット！'}</p><button class="primary" onclick="${next}">${remaining.length?'次のバッジへ':complete?'バッジを確認する':'ビンゴにもどる'}</button></div>`,'バッジ獲得',next);
}
