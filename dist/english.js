'use strict';

const el = id => document.getElementById(id);
el('review-home').hidden = new URLSearchParams(location.search).has('embedded');

function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch {}
}

const words = window.REVIEW_ENGLISH_WORDS;
const progressKey = 'course-review-english-words';
const known = new Set(readStorage(progressKey, []));
let wordIndex = 0;
let wordList = words;

const translations = [
  ['城市公共图书馆延长了开放时间，方便上班族在下班后借书和自习。', 'The city’s public library has extended its opening hours so that working people can borrow books and study there after work.'],
  ['随着越来越多的人骑车通勤，社区需要增设安全的自行车停放点。', 'As more people cycle to work, neighborhoods need to provide more secure places to park bicycles.'],
  ['在做出决定之前，研究团队比较了两种方法的成本、精度和适用条件。', 'Before making a decision, the research team compared the costs, accuracy and conditions of use of the two methods.'],
  ['这种装置能够在温度迅速变化时记录数据，因此适合在户外使用。', 'The device can record data even when the temperature changes rapidly, making it suitable for outdoor use.'],
  ['游客可以通过手机了解展品的来历，还可以听到当地居民讲述相关故事。', 'Visitors can use their phones to learn where the exhibits came from and listen to local residents tell stories about them.'],
  ['这项计划的目标是减少浪费，同时确保偏远地区也能获得可靠的公共服务。', 'The plan aims to reduce waste while ensuring that remote areas also have access to reliable public services.'],
  ['由于原有设备已经老化，学校决定分阶段更换实验室的仪器。', 'As the existing equipment had aged, the school decided to replace the laboratory instruments in stages.'],
  ['一项技术能否得到推广，常常取决于它是否易于使用和维护。', 'Whether a technology is widely adopted often depends on how easy it is to use and maintain.'],
  ['与直接背诵结论相比，解释每一步的理由更有助于发现理解上的漏洞。', 'Explaining the reason for each step is more helpful in revealing gaps in understanding than simply memorizing the conclusion.'],
  ['许多志愿者利用周末修理旧家电，并把修好的物品送给需要的人。', 'Many volunteers spend their weekends repairing old appliances and give the repaired items to people who need them.'],
  ['为了让不同专业的读者也能理解结果，作者在图表旁解释了关键术语。', 'To make the results accessible to readers from different fields, the authors explained the key terms next to the figures.'],
  ['即使读数彼此接近，也需要检查仪器是否有共同的系统误差。', 'Even if the readings are close to one another, it is necessary to check whether they share a systematic error.']
];
const drafts = readStorage('course-review-english-drafts', {});
let translationIndex = 0;

const speakingPrompts = [
  'Describe a place where you can concentrate. What makes it suitable for studying?',
  'Tell a new student about a study habit that has helped you. Give an example.',
  'Should universities offer more project-based courses? Explain your answer.',
  'Describe a time when feedback changed the way you approached a task.',
  'Which everyday tool would you redesign, and what would you change?',
  'Would you prefer to learn a new skill alone or in a group? Explain why.',
  'Explain a scientific idea to someone who has never studied physics.',
  'Which service would you improve in your neighborhood? Give a practical example.',
  'Describe a problem that took longer to solve than you expected. What did you learn?',
  'What is one useful way to make a presentation easier to understand?',
  'Should a university library stay open late? Explain one benefit and one trade-off.',
  'Describe something you changed after measuring how you spent your time.'
];
let speakingIndex = 0;
let timer;
let timerEnd;

function showWord() {
  const word = wordList[wordIndex];
  el('word').textContent = word ?? '没有匹配词汇';
  el('word-status').textContent = `已掌握 ${known.size} / ${words.length} · 当前筛选 ${word ? wordIndex + 1 : 0} / ${wordList.length}`;
  el('word-known').textContent = known.has(word) ? '取消已掌握' : '标记为已掌握';
  el('word-known').disabled = !word;
  el('previous-word').disabled = wordList.length < 2;
  el('next-word').disabled = wordList.length < 2;
  el('read-word').disabled = !word || !('speechSynthesis' in window);
}

function filterWords(resetIndex = true) {
  const term = el('word-filter').value.trim().toLowerCase();
  wordList = words.filter(word => word.toLowerCase().includes(term) && (!el('unmastered').checked || !known.has(word)));
  wordIndex = resetIndex ? 0 : Math.min(wordIndex, Math.max(0, wordList.length - 1));
  showWord();
}

function moveWord(step) {
  if (!wordList.length) return;
  wordIndex = (wordIndex + step + wordList.length) % wordList.length;
  showWord();
}

function showTranslation() {
  const [prompt, answer] = translations[translationIndex];
  el('translation-status').textContent = `第 ${translationIndex + 1} / ${translations.length} 题`;
  el('translation-prompt').textContent = prompt;
  el('translation-answer').textContent = answer;
  el('translation-draft').value = drafts[translationIndex] ?? '';
  el('translation-details').open = false;
}

function moveTranslation(step) {
  translationIndex = (translationIndex + step + translations.length) % translations.length;
  showTranslation();
}

function resetTimer() {
  clearInterval(timer);
  el('speaking-timer').textContent = '45';
  el('speaking-feedback').textContent = '';
  el('start-speaking').disabled = false;
}

function showSpeaking() {
  resetTimer();
  el('speaking-status').textContent = `第 ${speakingIndex + 1} / ${speakingPrompts.length} 题`;
  el('speaking-prompt').textContent = speakingPrompts[speakingIndex];
}

document.querySelectorAll('[data-panel]').forEach(button => {
  button.addEventListener('click', () => {
    const panel = button.dataset.panel;
    document.querySelectorAll('[data-panel]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
    document.querySelectorAll('.english-panel').forEach(section => { section.hidden = section.id !== panel; });
    if (panel !== 'speaking') resetTimer();
  });
});
el('word-filter').addEventListener('input', () => filterWords());
el('unmastered').addEventListener('change', () => filterWords());
el('previous-word').addEventListener('click', () => moveWord(-1));
el('next-word').addEventListener('click', () => moveWord(1));
el('word-known').addEventListener('click', () => {
  const word = wordList[wordIndex];
  if (!word) return;
  if (known.has(word)) known.delete(word);
  else known.add(word);
  writeStorage(progressKey, [...known]);
  filterWords(false);
});
el('read-word').addEventListener('click', () => {
  if (!wordList[wordIndex]) return;
  const utterance = new SpeechSynthesisUtterance(wordList[wordIndex]);
  utterance.lang = 'en-US';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
});
el('previous-translation').addEventListener('click', () => moveTranslation(-1));
el('next-translation').addEventListener('click', () => moveTranslation(1));
el('translation-draft').addEventListener('input', event => {
  drafts[translationIndex] = event.target.value;
  writeStorage('course-review-english-drafts', drafts);
});
el('start-speaking').addEventListener('click', () => {
  resetTimer();
  el('start-speaking').disabled = true;
  timerEnd = Date.now() + 45000;
  timer = setInterval(() => {
    const seconds = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
    el('speaking-timer').textContent = seconds;
    if (seconds === 0) {
      clearInterval(timer);
      el('start-speaking').disabled = false;
      el('speaking-feedback').textContent = '时间到。回想你的观点、例子和结尾是否完整。';
    }
  }, 250);
});
el('reset-speaking').addEventListener('click', resetTimer);
el('next-speaking').addEventListener('click', () => {
  speakingIndex = (speakingIndex + 1) % speakingPrompts.length;
  showSpeaking();
});

filterWords();
showTranslation();
showSpeaking();
