'use strict';
const DATA=window.REVIEW_DATA||{courses:[],questions:[],maps:{}};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rich(s){let x=esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');x=x.replace(/\$([^$\n]+)\$/g,'<span class="inline-formula">$1</span>');return x.replace(/\n/g,'<br>')}
function renderMath(root){
 if(!window.katex)return;
 root.querySelectorAll('.inline-formula,.formula').forEach(element=>{
  const tex=element.textContent.trim();
  if(!tex||tex.length>900||/[\u3400-\u9fff]/.test(tex))return;
  try{window.katex.render(tex,element,{displayMode:element.classList.contains('formula'),strict:'ignore'})}catch{}
 });
}
const courses=DATA.courses, questions=DATA.questions, maps=DATA.maps;
const courseById=id=>courses.find(c=>c.id===id)||courses[0];
const chapterById=id=>{for(const c of courses){const x=c.chapters.find(ch=>ch.id===id);if(x)return {course:c,chapter:x}}return null};
const fresh=()=>({v:2,read:{},mastered:{},mistakes:{},favorites:{},notes:{},history:[],today:{},lastCourse:'quantum'});
let progress;try{progress=JSON.parse(localStorage.getItem('review-hub-v2'))||fresh()}catch{progress=fresh()}
progress={...fresh(),...progress};
function save(){
 try{localStorage.setItem('review-hub-v2',JSON.stringify(progress))}catch{}
 updateRail()
}
function isRead(id){return progress.read[id]===true}function isMastered(id){return progress.mastered[id]===true}function isMistake(id){return progress.mistakes[id]===true}function isFav(id){return progress.favorites[id]===true}
function courseProgress(c){const ids=questions.filter(q=>q.course===c.id).map(q=>q.id);const read=c.chapters.filter(ch=>isRead(ch.id)).length;const mastered=ids.filter(isMastered).length;return {read,total:c.chapters.length,mastered,totalQ:ids.length,pct:ids.length?Math.round(mastered*100/ids.length):Math.round(read*100/c.chapters.length)}}
function setHash(x){location.hash=x}
function route(){const p=(location.hash.replace(/^#/,'')||'home').split('/');return {view:p[0],course:p[1]||null,chapter:p[2]||null}}
function courseStyle(c){return `--course-color:${c.color}`}
function updateRail(){const read=Object.values(progress.read).filter(Boolean).length,mastered=Object.values(progress.mastered).filter(Boolean).length,mistakes=Object.values(progress.mistakes).filter(Boolean).length;$('#readCount').textContent=read;$('#masteredCount').textContent=mastered;$('#mistakeBadge').textContent=mistakes;$('#courseRail').innerHTML=courses.map(c=>{const p=courseProgress(c),r=route();return `<button class="rail-course ${r.course===c.id?'active':''}" style="--course-color:${c.color}" data-course="${c.id}"><i></i><span>${esc(c.name)}</span><small>${p.pct}%</small></button>`}).join('')}
function setActiveNav(view){$$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view))}
function titleBlock(kicker,title,sub,action=''){return `<div class="page-top"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${sub}</p></div>${action}</div>`}
function button(label,action,cls='primary',extra=''){return `<button class="button ${cls}" data-action="${action}" ${extra}>${label}</button>`}
function dailyQueue(){
 const priority=questions.filter(q=>isMistake(q.id)||progress.today[q.id]);
 const remaining=questions.filter(q=>!isMistake(q.id)&&!progress.today[q.id]&&!isMastered(q.id));
 const pending=priority.concat(remaining);
 return (pending.length?pending:questions).slice(0,10);
}
function renderHome(){
 const mastered=Object.values(progress.mastered).filter(Boolean).length, mistakes=Object.values(progress.mistakes).filter(Boolean).length, reads=Object.values(progress.read).filter(Boolean).length;
 const avg=Math.round(courses.reduce((n,c)=>n+courseProgress(c).pct,0)/courses.length);
 const queue=dailyQueue().slice(0,6);
 return titleBlock('REVIEW CONSOLE','课程复习','知识卡、主动回忆、题库、错题和内置知识地图都在同一个学习空间里。')+
 `<div class="hero"><section class="hero-copy"><div class="eyebrow">TODAY’S LEARNING LOOP</div><h2>理解一张卡，<br>再用一道题证明它。</h2><p>开卷课记住“去哪里查”；闭卷课把公式放进题目。每一次自测都会留下进度。</p>${button('开始今日练习','daily','primary')}</section><section class="hero-map"><div class="hero-orb"><div>ψ</div><span>概念</span><span>公式</span><span>题目</span></div></section></div>
 <div class="stats"><div class="stat-card primary"><span>整体学习进度</span><strong>${avg}%</strong><small>按课程知识卡与题库计算</small></div><div class="stat-card"><span>已掌握题目</span><strong>${mastered}</strong><small>共 ${questions.length} 道</small></div><div class="stat-card"><span>待回顾错题</span><strong>${mistakes}</strong><small>下次练习优先出现</small></div><div class="stat-card"><span>已读章节</span><strong>${reads}</strong><small>共 ${courses.reduce((n,c)=>n+c.chapters.length,0)} 章</small></div></div>
 <div class="section-head"><h2>课程进度 <span class="meta">COURSE PULSE</span></h2>${button('打开知识卡','learn','ghost')}</div><div class="course-grid">${courses.map(courseCard).join('')}</div>
 <div class="task-grid"><section class="panel"><h3>今天，从这里开始</h3><div class="panel-label">A LITTLE, EVERY DAY</div>${queue.length?queue.map((q,i)=>`<div class="task"><span class="task-num">${String(i+1).padStart(2,'0')}</span><div><strong>${esc(q.title)}</strong><small>${esc(courseById(q.course).name)} · ${esc(q.type)}</small></div><a href="#" data-action="open-question" data-id="${q.id}">练习</a></div>`).join(''):'<div class="mistake-empty">今天还没有待回顾题目。点击“开始今日练习”从未掌握题中抽取。</div>'}</section><section class="panel"><h3>你的复习策略</h3><div class="panel-label">OPEN BOOK / CLOSED BOOK</div><div class="task"><span class="task-num">A</span><div><strong>原子核物理 · 传感器</strong><small>先点知识地图，记住查找路径，再练题。</small></div></div><div class="task"><span class="task-num">B</span><div><strong>量子力学 · 电动力学</strong><small>先读知识卡，随后用题库检验推导。</small></div></div><div class="task"><span class="task-num">C</span><div><strong>专业外语</strong><small>术语 → 句型 → 用英文解释物理。</small></div></div></section></div>`;
}
function openCourse(id){
 setHash((Object.hasOwn(openBookIndex,id)?'#maps/':'#learn/')+id);
}
function courseCard(c){const p=courseProgress(c);return `<article class="course-card" style="--course-color:${c.color}"><div class="code">COURSE ${c.code} · ${c.mode}</div><h3>${esc(c.name)}</h3><div class="meta">${esc(c.credits)} · ${p.read}/${p.total} 章已读</div><p>${esc(c.summary)}</p><div class="foot"><div class="mini-bar"><i style="width:${p.pct}%"></i></div><small>${p.pct}%</small>${button(Object.hasOwn(openBookIndex,c.id)?'开卷索引':'进入学习','open-course','ghost','data-course="'+c.id+'"')}</div></article>`}
function renderLearn(courseId,chapterId){
 const detail=chapterId?chapterById(chapterId):null, c=detail?.course||courseById(courseId||progress.lastCourse);
 progress.lastCourse=c.id;save();
 const side=`<aside class="learn-side">${courses.map(x=>`<button class="${x.id===c.id?'active':''}" data-action="select-course" data-course="${x.id}" style="--course-color:${x.color}"><strong>${esc(x.name)}</strong><small>${x.mode} · ${courseProgress(x).pct}%</small></button>`).join('')}</aside>`;
 if(detail)return titleBlock('KNOWLEDGE CARDS',`${detail.course.name} · ${detail.chapter.title}`,detail.chapter.overview,button('返回章节目录','back-learn','ghost'))+`<div class="chapter-detail" style="--course-color:${detail.course.color}">${renderChapter(detail.course,detail.chapter)}</div>`;
 return titleBlock('KNOWLEDGE CARDS','按章节学习','每一章都包含知识卡、公式、解题路径和主动回忆。选择一门课开始。')+`<div class="learn-layout">${side}<section><div class="course-card" style="--course-color:${c.color};min-height:auto;margin-bottom:13px"><div class="code">${esc(c.mode)}</div><h3>${esc(c.name)}</h3><p>${esc(c.summary)}</p><div class="progress"><i style="width:${courseProgress(c).pct}%"></i></div><small class="muted">${courseProgress(c).mastered}/${courseProgress(c).totalQ} 道题已掌握 · ${courseProgress(c).read}/${courseProgress(c).total} 章已读</small></div><div class="chapter-grid">${c.chapters.map((ch,i)=>chapterCard(c,ch,i)).join('')}</div></section></div>`;
}
function chapterCard(c,ch,i){const qs=questions.filter(q=>q.chapterId===ch.id),done=qs.filter(q=>isMastered(q.id)).length;return `<a class="chapter-card" href="#learn/${c.id}/${ch.id}" style="--course-color:${c.color}"><div class="mini">${String(i+1).padStart(2,'0')} · ${qs.length?qs.length+' 道练习':'知识卡'}</div><h3>${esc(ch.title)}</h3><p>${esc(ch.subtitle)}</p><div class="chapter-foot"><span>${isRead(ch.id)?'✓ 已读':'待开始'}</span><span>${qs.length?done+'/'+qs.length:''}</span></div><div class="progress"><i style="width:${qs.length?done*100/qs.length:isRead(ch.id)?100:0}%"></i></div></a>`}
function renderChapter(c,ch){
 const qs=questions.filter(q=>q.chapterId===ch.id), tab=window.chapterTab?.id===ch.id?window.chapterTab.name:'cards';
 return `<div class="eyebrow">${esc(c.mode)} · ${esc(c.name)}</div><h1>${esc(ch.title)}</h1><p class="lead">${esc(ch.overview)}</p><div class="chapter-actions">${button('本章练习 '+(qs.length?qs.length+' 题':''),'chapter-practice','primary',qs.length?'':'disabled')} ${button(isRead(ch.id)?'✓ 已读章节':'标记为已读','toggle-read','secondary','data-chapter="'+ch.id+'"')} ${(qs.length?button(qs.some(q=>progress.today[q.id])?'已加入今日练习':'加入今日练习','add-today','ghost','data-chapter="'+ch.id+'"'):'')}</div><div class="tabs"><button class="${tab==='cards'?'active':''}" data-action="chapter-tab" data-tab="cards">知识卡与公式</button><button class="${tab==='recall'?'active':''}" data-action="chapter-tab" data-tab="recall">主动回忆</button><button class="${tab==='path'?'active':''}" data-action="chapter-tab" data-tab="path">解题路径</button></div>${tab==='cards'?`<div class="card-stack">${ch.cards.map((x,i)=>`<article class="knowledge-card"><div class="kicker">KEY CONCEPT ${String(i+1).padStart(2,'0')}</div><h3>${esc(x.title)}</h3><p>${rich(x.body)}</p>${x.formula?`<div class="formula">${esc(x.formula)}</div>`:''}</article>`).join('')}</div>`:tab==='recall'?`<div class="panel"><h3>合上资料，再回答</h3><p class="muted">先在脑中组织答案，再展开检查。完成后可以直接进入本章题库。</p>${ch.recall.map(x=>`<details class="recall-box"><summary>${esc(x.question)}</summary><div class="answer">${rich(x.answer)}</div></details>`).join('')}</div>`:`<div class="panel"><h3>把问题拆成几步</h3><div class="path-list">${ch.steps.map(x=>`<div class="path-step"><p>${rich(x)}</p></div>`).join('')}</div><h3 style="margin-top:24px">容易混淆</h3><div class="path-list">${ch.goals.map(x=>`<div class="path-step"><p>${esc(x)}</p></div>`).join('')}</div></div>`}<div class="section-head"><h3>这一章的训练</h3><span class="muted">${qs.filter(q=>isMastered(q.id)).length}/${qs.length} 道题已掌握</span></div>${qs.length?`<div class="question-list">${qs.slice(0,5).map((q,i)=>questionCard(q,i)).join('')}</div>`:'<div class="panel muted">这一章暂以知识卡和主动回忆为主。</div>'}${renderResourceIndex(c.id,ch.id)}`;
}
function questionCard(q,i){const c=courseById(q.course);return `<article class="question-card" style="--course-color:${c.color}"><div class="q-num">${String(i+1).padStart(2,'0')}</div><div><div class="q-meta"><span class="badge">${esc(q.type)}</span><span class="badge">${esc(q.difficulty)}</span><span>${esc(c.name)}</span></div><h3>${esc(q.title)}</h3><div class="stem">${rich(q.stem)}</div><div class="q-tags">${(q.tags||[]).slice(0,4).map(t=>`<span>${esc(t)}</span>`).join('')}</div></div><div class="q-actions"><button class="icon-btn" data-action="favorite" data-id="${q.id}" title="收藏">${isFav(q.id)?'★':'☆'}</button>${button(isMastered(q.id)?'再练一次':'开始自测','open-question','secondary','data-id="'+q.id+'"')}</div></article>`}
let bankFilter={course:'all',type:'all',status:'all',search:''};
function bankQuestions(){return questions.filter(q=>(bankFilter.course==='all'||q.course===bankFilter.course)&&(bankFilter.type==='all'||q.type===bankFilter.type)&&(bankFilter.status==='all'||bankFilter.status==='mastered'&&isMastered(q.id)||bankFilter.status==='mistake'&&isMistake(q.id)||bankFilter.status==='new'&&!isMastered(q.id)&&!isMistake(q.id))&&(!bankFilter.search||[q.title,q.stem,(q.tags||[]).join(' '),courseById(q.course).name].join(' ').toLowerCase().includes(bankFilter.search.trim().toLowerCase())))}
function bankResults(){
 const list=bankQuestions();
 return {count:list.length,html:list.map(questionCard).join('')||'<div class="mistake-empty">没有匹配题目。</div>'};
}
function renderBank(){const list=bankResults();return titleBlock('QUESTION BANK','题库练习','每道题先自己回答，再打开参考解答；主观题通过自评进入掌握或错题。',button('随机练习（最多 10 题）','random-practice','primary','id="bankRandom" '+(list.count?'':'disabled')))+`<div class="filters"><input id="bankSearch" placeholder="搜索题目、知识点或课程" aria-label="搜索题库" value="${esc(bankFilter.search)}"><select id="bankCourse"><option value="all">全部课程</option>${courses.map(c=>`<option value="${c.id}" ${bankFilter.course===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select><select id="bankType"><option value="all">全部题型</option>${[...new Set(questions.map(q=>q.type))].map(x=>`<option ${bankFilter.type===x?'selected':''}>${x}</option>`).join('')}</select><select id="bankStatus"><option value="all">全部状态</option><option value="new" ${bankFilter.status==='new'?'selected':''}>待练习</option><option value="mastered" ${bankFilter.status==='mastered'?'selected':''}>已掌握</option><option value="mistake" ${bankFilter.status==='mistake'?'selected':''}>错题</option></select></div><div class="bank-toolbar"><span id="bankCount" aria-live="polite">共 ${list.count} 道题</span><span>答案在自测后展开</span></div><div id="bankResults" class="question-list">${list.html}</div>`}
function renderMaps(courseId){const id=Object.hasOwn(maps,courseId)?courseId:'nuclear',m=maps[id],c=courseById(id);window.mapSelection=window.mapSelection||{};const selected=window.mapSelection[id]||m.nodes[0];return titleBlock('IN-SITE MIND MAP','知识地图','地图节点直接连接到站内知识卡；不需要离开网站查文件。')+`<div class="map-layout"><aside class="map-tabs">${Object.keys(maps).map(k=>`<button class="map-tab ${k===id?'active':''}" data-action="map-course" data-course="${k}"><strong>${esc(maps[k].title)}</strong><small>${esc(maps[k].subtitle)}</small></button>`).join('')}</aside><section class="map-board" style="--course-color:${c.color}"><div class="eyebrow">${esc(c.mode)}</div><h1>${esc(m.title)}</h1><p class="subtitle">${esc(m.subtitle)}</p><div class="map-nodes"><div class="map-node core"><strong>${esc(c.name)} · 复习主轴</strong><span>选择节点，查看对应章节</span></div>${m.nodes.map(n=>`<button class="map-node ${selected.chapterId===n.chapterId?'selected':''}" data-action="map-node" data-course="${id}" data-chapter="${n.chapterId}" aria-pressed="${selected.chapterId===n.chapterId}"><strong>${esc(n.label)}</strong><span>${esc(n.detail)}</span></button>`).join('')}</div><div class="map-detail"><strong>${esc(selected.label)}</strong><br>${esc(selected.detail)}<div class="chapter-actions">${button('进入这一节点的知识卡','map-learn','primary','data-course="'+id+'" data-chapter="'+selected.chapterId+'"')} ${!['nuclear','sensor'].includes(id)&&questions.some(q=>q.chapterId===selected.chapterId)?button('开始相关练习','map-practice','secondary','data-chapter="'+selected.chapterId+'"'):''}</div></div>${renderResourceIndex(id,selected.chapterId)}</section></div>`}
function renderMistakes(){const list=questions.filter(q=>isMistake(q.id));return titleBlock('REVIEW AGAIN','错题本','复做标记为“还需巩固”的题目，自评掌握后移出错题本。',list.length?button('随机回顾','mistake-practice','primary'):'')+`<div class="question-list">${list.map(questionCard).join('')||'<div class="mistake-empty"><h3>还没有错题</h3><p>在题库里完成一次“需要巩固”的自评，它就会出现在这里。</p></div>'}</div>`}
function renderEnglish(){
 return titleBlock('ENGLISH WORKBENCH','英语学习站','背词、翻译和口语计时练习。', '<a class="button secondary" href="./english.html">独立打开英语站</a>')+
  '<div class="english-shell"><iframe title="英语学习站" src="./english.html?embedded=1"></iframe></div>';
}
function render(){const r=route();setActiveNav(['home','learn','bank','maps','mistakes','english'].includes(r.view)?r.view:'home');updateRail();let html=r.view==='learn'?renderLearn(r.course,r.chapter):r.view==='bank'?renderBank():r.view==='maps'?renderMaps(r.course):r.view==='mistakes'?renderMistakes():r.view==='english'?renderEnglish():renderHome();$('#app').innerHTML=html;renderMath($('#app'));}
function openPractice(queue){
 const available=queue.filter(Boolean);
 if(!available.length)return;
 window.practice={queue:available,index:0,revealed:false,score:0};
 const dialog=$('#practiceDialog');
 dialog.className='dialog';
 renderPractice();
 if(!dialog.open)dialog.showModal();
 dialog.querySelector('[data-action="reveal-answer"]')?.focus();
}
function closePractice(){$('#practiceDialog').close();window.practice=null}
function renderPractice(){const p=window.practice;if(!p)return;const d=$('#practiceDialog');if(p.index>=p.queue.length){d.innerHTML=`<div class="dialog-inner"><div class="dialog-top"><span class="eyebrow">PRACTICE COMPLETE</span><button class="icon-btn" data-action="close-practice">×</button></div><h2 id="practiceTitle">这一轮完成了。</h2><p class="stem">${p.score}/${p.queue.length} 道自评为“已掌握”。错题会自动留在错题本。</p><div class="dialog-actions">${button('继续练习','daily','primary')} ${button('回到学习空间','close-practice','secondary')}</div></div>`;return}const q=p.queue[p.index],c=courseById(q.course),st=isMastered(q.id);d.innerHTML=`<div class="dialog-inner" style="--course-color:${c.color}"><div class="dialog-top"><span class="eyebrow">${esc(c.name)} · ${p.index+1}/${p.queue.length}</span><button class="icon-btn" data-action="close-practice">×</button></div><h2 id="practiceTitle">${esc(q.title)}</h2><div class="q-meta"><span class="badge">${esc(q.type)}</span><span class="badge">${esc(q.difficulty)}</span><span>${esc((q.tags||[]).join(' · '))}</span></div><div class="stem">${rich(q.stem)}</div><textarea class="note" id="practiceNote" placeholder="先写下你的思路、公式或英文答案…">${esc(progress.notes[q.id]||'')}</textarea>${p.revealed?`<div class="answer-reveal"><strong>参考解答</strong><p>${rich(q.answer)}</p></div>`:''}<div class="dialog-actions">${!p.revealed?button('查看参考解答','reveal-answer','primary'):''}${p.revealed?button('我已掌握','grade-good','primary'):''}${p.revealed?button('还需巩固','grade-bad','secondary'):''}${button('跳过','skip-question','ghost')}</div></div>`;renderMath(d);if(p.revealed)d.querySelector('[data-action="grade-good"]')?.focus()}
function record(correct){const p=window.practice,q=p.queue[p.index];delete progress.today[q.id];if(correct){progress.mastered[q.id]=true;delete progress.mistakes[q.id];p.score++}else{progress.mistakes[q.id]=true;delete progress.mastered[q.id]}progress.history.push({id:q.id,correct,time:new Date().toISOString()});if(progress.history.length>500)progress.history=progress.history.slice(-500);save();p.index++;p.revealed=false;renderPractice();render()}
document.addEventListener('click',event=>{
 const control=event.target.closest('[data-action]');
 if(!control||control.disabled)return;
 const {action,course,chapter,id,tab}=control.dataset;
 const practice=window.practice;
 switch(action){
  case 'open-course': openCourse(course); break;
  case 'select-course': setHash('#learn/'+course); break;
  case 'learn': setHash('#learn'); break;
  case 'back-learn': setHash('#learn/'+progress.lastCourse); break;
  case 'daily': openPractice(dailyQueue()); break;
  case 'open-question':
   event.preventDefault();
   openPractice([questions.find(question=>question.id===id)]);
   break;
  case 'favorite': progress.favorites[id]=!isFav(id); save(); render(); break;
  case 'chapter-tab': window.chapterTab={id:route().chapter,name:tab}; render(); break;
  case 'toggle-read': progress.read[chapter]=!isRead(chapter); save(); render(); break;
  case 'add-today':
   questions.filter(question=>question.chapterId===chapter).forEach(question=>{progress.today[question.id]=true});
   save();
   render();
   break;
  case 'chapter-practice': openPractice(questions.filter(question=>question.chapterId===route().chapter)); break;
  case 'random-practice': {
   const pool=bankQuestions();
   for(let i=pool.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [pool[i],pool[j]]=[pool[j],pool[i]];
   }
   openPractice(pool.slice(0,10));
   break;
  }
  case 'map-course': setHash('#maps/'+course); break;
  case 'map-node':
   window.mapSelection[course]=maps[course].nodes.find(node=>node.chapterId===chapter);
   render();
   $('.map-node.selected')?.focus();
   break;
  case 'map-learn': setHash('#learn/'+course+'/'+chapter); break;
  case 'map-practice': openPractice(questions.filter(question=>question.chapterId===chapter).slice(0,3)); break;
  case 'mistake-practice': openPractice(questions.filter(question=>isMistake(question.id))); break;
  case 'reveal-answer': practice.revealed=true; renderPractice(); break;
  case 'grade-good': record(true); break;
  case 'grade-bad': record(false); break;
  case 'skip-question': practice.index++; practice.revealed=false; renderPractice(); break;
  case 'close-practice': closePractice(); break;
 }
});
document.addEventListener('input',e=>{
 const input=e.target;
 if(input.id==='bankSearch'){
  bankFilter.search=input.value;
  const list=bankResults();
  $('#bankCount').textContent=`共 ${list.count} 道题`;
  $('#bankResults').innerHTML=list.html;
  $('#bankRandom').disabled=!list.count;
  renderMath($('#bankResults'));
 }
 if(input.id==='practiceNote'&&window.practice){
  const q=window.practice.queue[window.practice.index];
  progress.notes[q.id]=input.value;save();
 }
});
document.addEventListener('change',e=>{
 const key={bankCourse:'course',bankType:'type',bankStatus:'status'}[e.target.id];
 if(key){bankFilter[key]=e.target.value;render()}
});
$('#practiceDialog').addEventListener('close',()=>{if(!$('#practiceDialog').open)window.practice=null});
$$('.nav-btn').forEach(b=>b.onclick=()=>setHash('#'+b.dataset.view));$('#courseRail').onclick=e=>{const b=e.target.closest('[data-course]');if(b)openCourse(b.dataset.course)};
$('#globalSearch').onkeydown=e=>{if(e.key==='Enter'){bankFilter.search=e.target.value;if(location.hash==='#bank')render();else setHash('#bank')}};
$('#themeBtn').onclick=()=>{const dark=document.documentElement.dataset.theme==='dark';document.documentElement.dataset.theme=dark?'':'dark';localStorage.setItem('review-theme',dark?'light':'dark')};if(localStorage.getItem('review-theme')==='dark')document.documentElement.dataset.theme='dark';
$('#backupBtn').onclick=()=>{const blob=new Blob([JSON.stringify(progress,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='课程复习记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),500)};
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#globalSearch').focus()}});
render();
