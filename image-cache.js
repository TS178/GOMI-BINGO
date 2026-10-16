/* Warm the browser image cache after the opening has painted. No UI waits on it. */
window.GameImages=(()=>{
 const jobs=new Map(),queue=[],decoded=new Map();
 let active=0,started=false;
 const remember=(src,img)=>{
  decoded.delete(src);decoded.set(src,img);
  // Keep only the nearby screens decoded, not all 50 full-size quiz bitmaps.
  while(decoded.size>12)decoded.delete(decoded.keys().next().value);
 };
 function pump(){
  while(active<2&&queue.length){
   queue.sort((a,b)=>b.priority-a.priority);
   const job=queue.shift();job.status='loading';active++;
   const img=new Image();img.decoding='async';img.fetchPriority=job.priority?'high':'low';job.image=img;
   const finish=ok=>{img.onload=img.onerror=null;job.image=null;job.status=ok?'loaded':'failed';job.resolve(ok);active--;pump()};
   img.onerror=()=>finish(false);
   img.onload=async()=>{
    if(job.priority){try{await img.decode();remember(job.src,img)}catch{finish(false);return}}
    finish(true);
   };
   img.src=job.src;
  }
 }
 function warm(src,priority=0){
  let job=jobs.get(src);
  if(job&&job.status!=='failed'){
   job.priority=Math.max(job.priority,priority);
   if(job.image&&priority)job.image.fetchPriority='high';
   if(priority&&job.status==='loaded'&&!decoded.has(src)){
    const img=new Image();img.decoding='async';img.src=src;
    return img.decode().then(()=>{remember(src,img);return true},()=>false);
   }
   return job.promise;
  }
  job={src,priority,status:'queued'};job.promise=new Promise(resolve=>job.resolve=resolve);
  jobs.set(src,job);queue.push(job);pump();return job.promise;
 }
 const quiz=(no,kind)=>`assets/quiz/${kind}/q${String(no).padStart(2,'0')}.webp`;
 return {
  start(){
   if(started)return;started=true;
   // Yield to the first animation frame; do not compete with title image loading.
   requestAnimationFrame(()=>setTimeout(()=>{
    const ids=ITEMS.map(item=>item.id);
    ids.forEach(id=>warm(`assets/categories/${id}.webp`,1));
    ids.forEach(id=>warm(`assets/photos/${id}.webp`));
    QUIZZES.forEach(q=>{warm(quiz(q.no,'questions'));warm(quiz(q.no,'answers'))});
    ['bingo','complete'].forEach(kind=>warm(`assets/badges/${kind}.svg?v=9`));
   },200));
  },
  forItem(item){
   warm(`assets/photos/${item.id}.webp`,2);
   relatedQuiz(item).forEach(q=>warm(quiz(q.no,'questions'),1));
  },
  forQuestion(q,next){
   warm(quiz(q.no,'questions'),3);warm(quiz(q.no,'answers'),2);
   if(next){warm(quiz(next.no,'questions'),1);warm(quiz(next.no,'answers'),1)}
  },
  forAnswer(q,next){
   warm(quiz(q.no,'answers'),3);
   if(next){warm(quiz(next.no,'questions'),2);warm(quiz(next.no,'answers'),1)}
  },
  // Read-only diagnostics used by the browser regression checks.
  status:()=>({active,queued:queue.length,decoded:decoded.size,loaded:[...jobs.values()].filter(j=>j.status==='loaded').map(j=>j.src),failed:[...jobs.values()].filter(j=>j.status==='failed').map(j=>j.src)})
 };
})();
