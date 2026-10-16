/* Individually generated, spoiler-free question art and separate answer illustrations. */
const QUIZ_VISUALS={
 1:['街と海のごみ','plastic','town'],2:['プラごみ','plastic','turtle'],3:['プラごみ','plastic','micro'],
 4:['ペットボトル','pet','years'],5:['ペットボトル','pet','separate'],6:['漁具・ロープ','rope','net'],
 7:['食品と容器','food','shelf'],8:['缶・びん・ペットボトル','metal','bottles'],9:['ごみと3R','plastic','recycle'],
 10:['街と海のごみ','plastic','pickup'],11:['プラごみ','plastic','spoon'],12:['発泡スチロール','foam','foam'],
 13:['お出かけのごみ','plastic','takehome'],14:['海を守るくらし','plastic','daily'],15:['プラごみ','plastic','pellets'],
 16:['ペットボトル','pet','broken'],17:['食品とくらし','food','food'],18:['海の遊び道具','buoy','repair'],
 19:['ごみと生き物','plastic','fish'],20:['リユース','bottle','reuse'],21:['プラごみ','plastic','bag'],
 22:['ビーチクリーン','plastic','smiles'],23:['ごみの分別','metal','bins'],24:['プラごみ','plastic','wash'],25:['よごれた紙','paper','paper']
};
function quizPhoto(q){
 const [genre]=QUIZ_VISUALS[Number(q.no)];
 return {genre,src:`assets/quiz/questions/q${String(Number(q.no)).padStart(2,'0')}.webp`,alt:`${genre}の問題イラスト`};
}
function quizQuestionCard(q,env=false){
 const next=env?QUIZZES[state.envQuizOrder?.[state.envQuizIndex+1]]:null;
 window.GameImages?.forQuestion(q,next);
 const photo=quizPhoto(q),progress=env?`${state.envQuizIndex+1} / ${QUIZZES.length}`:(reviewQuizPos===null?'3択':'ふくしゅう');
 return `<div class="card quiz-shell visual-quiz ${q.question.length>48?'long-question':''}"><figure class="quiz-photo-hero"><img src="${photo.src}" decoding="async" alt="${photo.alt}"><figcaption class="quiz-topline"><strong>${photo.genre}</strong><span>${progress}</span></figcaption></figure><h2>${rubyText(q.question)}</h2><div id="${env?'envChoices':'choices'}">${q.choices.map((c,i)=>`<button class="choice" onclick="${env?'answerEnvQuiz':'answerQuiz'}(${i})"><span class="choice-letter">${String.fromCharCode(65+i)}</span><span>${rubyText(c)}</span></button>`).join('')}</div></div>`;
}
function quizAnswerIndex(q){return (q.answer||'').trim().toUpperCase().replace('Ａ','A').replace('Ｂ','B').replace('Ｃ','C').charCodeAt(0)-65;}
function quizFeedbackCard(q,ok,env=false){
 const next=env?QUIZZES[state.envQuizOrder?.[state.envQuizIndex+1]]:null;
 window.GameImages?.forAnswer(q,next);
 const answer=q.choices[quizAnswerIndex(q)];
 const action=env?'nextEnvQuiz()':reviewQuizPos===null?'afterQuiz()':'finishReviewQuiz()';
 const button=env?(state.envQuizIndex+1<QUIZZES.length?'次のクイズ':'もう一度クイズに挑戦'):(reviewQuizPos===null?'ビンゴにもどる':'ごみずかんにもどる');
 return `<div class="card ${env?'env-result':'quiz-result'} quiz-feedback visual-feedback ${ok?'is-correct':'try-again'}"><div class="result-heading"><span class="result-symbol" aria-hidden="true">${ok?'〇':'✦'}</span><div class="big">${ok?'正解！':'おしい！'}</div><span class="result-topic">${quizPhoto(q).genre}</span></div><figure class="answer-picture"><div class="answer-art" role="img" aria-label="${answer}を表すイラスト">${answerIllustration(q)}</div><figcaption><span>正解は</span><strong>${rubyText(answer)}</strong></figcaption></figure><p class="answer-explanation">${rubyText(q.explanation)}</p><button class="primary" onclick="${action}">${button}</button></div>`;
}
function answerIllustration(q){
 const no=String(Number(q.no)).padStart(2,'0');
 return `<img src="assets/quiz/answers/q${no}.webp" width="960" height="640" alt="" decoding="async">`;
}
