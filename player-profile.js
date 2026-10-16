/* A local nickname, shared by the game and award screens. */
function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function getPlayerName(){return state?.playerName||localStorage.getItem(KEY+'-name')||'';}
function migratePlayerProfile(){
 if(!state)return;
 delete state.participantId;
 if(!state.playerName)state.playerName=getPlayerName();
 save();
}
function showNameScreen(returnTo='guide'){
 cancelBoardCelebration();closeModal();
 document.getElementById('mainNav').classList.add('hidden');
 const screen=document.getElementById('screen');screen.className='start-screen name-screen';
 screen.innerHTML=`<section class="name-panel">${gameLogo('app-logo welcome-logo')}<form id="nameForm" class="name-form"><h2>なまえをおしえてね！</h2><label for="playerName">バッジにのせる なまえ</label><input id="playerName" name="playerName" type="text" value="${escapeHTML(getPlayerName())}" maxlength="20" required autocomplete="nickname" enterkeyhint="next" placeholder="なまえ・ニックネーム" aria-describedby="nameHint"><p id="nameHint">ニックネームでもOK！ 20文字まで</p><button class="primary start-button" type="submit">${returnTo==='badge'?'このなまえにする':'このなまえで出発！'}</button>${returnTo==='badge'?'<button type="button" class="secondary" onclick="renderBoard();showBadgeScreen()">バッジにもどる</button>':''}</form></section>`;
 const input=document.getElementById('playerName');
 input.addEventListener('input',()=>input.setCustomValidity(''));
 document.getElementById('nameForm').addEventListener('submit',e=>{
  e.preventDefault();
  const name=input.value.replace(/[\u0000-\u001f\u007f]/g,'').trim();
  if(!name){input.setCustomValidity('なまえを入れてね');input.reportValidity();return;}
  localStorage.setItem(KEY+'-name',name);
  if(state){state.playerName=name;delete state.participantId;save();}
  if(returnTo==='badge'){renderBoard();showBadgeScreen();}else{showStart();document.querySelector('.start-button')?.focus({preventScroll:true});}
 });
}
function showBadgeDetail(kind){
 if(!['bingo','complete'].includes(kind)||!(kind==='bingo'?state.firstBingo:state.complete))return;
 const label=kind==='bingo'?'海のきらめきスター':'海のヒーロー';
 showModal(`<div class="card badge-detail center"><h2>${rubyText(label)}</h2><div class="badge-stage">${badgeArt(kind)}</div><p class="badge-owner">${escapeHTML(getPlayerName())}</p><span class="earnedText">獲得したバッジ</span></div>`,label,'showBadgeScreen()');
}
