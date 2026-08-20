const lessons = [
  { title: 'Home row explorers', group: 'HOME ROW', instruction: 'Keep your fingers resting on A S D F and J K L ;. Type the highlighted letters.', steps: ['asdf jkl; asdf jkl;', 'sad fall ask all', 'a dad asks lola'] },
  { title: 'F and J anchors', group: 'HOME ROW', instruction: 'Feel the small bumps on F and J. They help your hands find home.', steps: ['fff jjj fff jjj', 'fall adds jazz', 'jill falls fast'] },
  { title: 'Home row words', group: 'HOME ROW', instruction: 'Let your fingers travel gently across the home row.', steps: ['sad dash flask', 'all asks dad', 'a small glass falls'] },
  { title: 'Home row rhythm', group: 'HOME ROW', instruction: 'Let your fingers travel gently across your home keys.', steps: ['a s d f j k l ;', 'jazz falls fast', 'dad asks jill'] },
  { title: 'Reach up: E and I', group: 'TOP ROW', instruction: 'Reach up from D to E and K to I, then return home.', steps: ['eee iii eee iii', 'see side idea', 'jill sees a field'] },
  { title: 'Reach up: R and U', group: 'TOP ROW', instruction: 'Use your index fingers for R and U, then come home.', steps: ['rrr uuu rrr uuu', 'rural turtle', 'a turtle runs'] },
  { title: 'Top row team', group: 'TOP ROW', instruction: 'Practice a relaxed reach to R, T, U, and I.', steps: ['r t u i r t u i', 'tree true turtle', 'a little turtle sits'] },
  { title: 'W and O', group: 'TOP ROW', instruction: 'Reach up softly, one finger at a time.', steps: ['www ooo www ooo', 'wood wool owl', 'two owls swoop'] },
  { title: 'Q and P', group: 'TOP ROW', instruction: 'The outside top keys need a gentle stretch.', steps: ['qqq ppp qqq ppp', 'quip pop puppy', 'a puppy naps'] },
  { title: 'Top-row story', group: 'TOP ROW', instruction: 'Bring your top-row keys together in a little story.', steps: ['quiet water ripples', 'two purple owls', 'we write a story'] },
  { title: 'Bottom row: C and N', group: 'BOTTOM ROW', instruction: 'Reach down from D and J, then return home.', steps: ['ccc nnn ccc nnn', 'can nice dance', 'nina can dance'] },
  { title: 'Bottom row: V and M', group: 'BOTTOM ROW', instruction: 'Let your fingers dip down and come back up.', steps: ['vvv mmm vvv mmm', 'move velvet', 'mila moves'] },
  { title: 'X and comma', group: 'BOTTOM ROW', instruction: 'The bottom row has useful little visitors.', steps: ['xxx ,,, xxx ,,,', 'mix, mix, mix', 'max mixes jam'] },
  { title: 'Z and period', group: 'BOTTOM ROW', instruction: 'Finish sentences with a calm reach to period.', steps: ['zzz ... zzz ...', 'zoo. zoo. zoo.', 'liz sees a zebra.'] },
  { title: 'Bottom row bounce', group: 'BOTTOM ROW', instruction: 'Use every bottom-row key you have learned.', steps: ['c v n m x z', 'can move nice', 'mila can dance'] },
  { title: 'All letter adventure', group: 'MIXED KEYS', instruction: 'Your fingers now know the whole letter map.', steps: ['quick brown fox', 'jump over lazy dogs', 'we can type with care'] },
  { title: 'Space and flow', group: 'MIXED KEYS', instruction: 'Use your thumbs for space and keep a smooth rhythm.', steps: ['small steps matter', 'typing takes time', 'each word has space'] },
  { title: 'Capital letters', group: 'SHIFT KEY', instruction: 'Hold Shift with the opposite hand, then type the letter.', steps: ['A S D F J K L', 'Sam likes music', 'I can type well.'] },
  { title: 'Capital names', group: 'SHIFT KEY', instruction: 'Practice friendly names with a capital at the start.', steps: ['Mia Ravi Zoe', 'Asha visits Ravi.', 'Zoe likes art.'] },
  { title: 'Question marks', group: 'PUNCTUATION', instruction: 'Use Shift for the question mark and give each sentence a voice.', steps: ['who what why?', 'Can we type?', 'What is your name?'] },
  { title: 'Exclamation marks', group: 'PUNCTUATION', instruction: 'Use the same careful Shift reach for an excited finish.', steps: ['wow! yay! fun!', 'I did it!', 'Typing is fun!'] },
  { title: 'Commas and periods', group: 'PUNCTUATION', instruction: 'Punctuation gives each sentence a helpful pause.', steps: ['yes, no, maybe.', 'Slow down, then type.', 'Read, type, smile.'] },
  { title: 'Numbers 1 to 5', group: 'NUMBER ROW', instruction: 'Reach up to the number row, then return to home.', steps: ['1 2 3 4 5', '1 2 3 4 5', 'I have 3 pens.'] },
  { title: 'Numbers 6 to 0', group: 'NUMBER ROW', instruction: 'Use the right hand for the other side of the number row.', steps: ['6 7 8 9 0', '6 7 8 9 0', 'We read 10 books.'] },
  { title: 'Number patterns', group: 'NUMBER ROW', instruction: 'Make a steady rhythm with familiar number patterns.', steps: ['12 34 56 78 90', '2 + 2 = 4', 'My score is 8.'] },
  { title: 'Useful symbols', group: 'SYMBOLS', instruction: 'Meet a few symbols you may use in school work.', steps: ['@ # $ % &', 'cost: $5', 'score: 90%'] },
  { title: 'Accuracy builder', group: 'MIXED KEYS', instruction: 'Take your time. Clean typing is powerful typing.', steps: ['little steps every day', 'practice makes patterns', 'accuracy builds speed'] },
  { title: 'Speed builder', group: 'MIXED KEYS', instruction: 'Stay relaxed and let your fingers find their rhythm.', steps: ['swift fingers type', 'keep a steady pace', 'kind practice helps'] },
  { title: 'Ready for the test', group: 'MIXED KEYS', instruction: 'Use all your skills in a confident final warm-up.', steps: ['The quick fox jumps.', 'We type with care!', 'Each day makes us stronger.'] },
  { title: 'KeyQuest finale', group: 'FINAL DAY', instruction: 'Celebrate your 30-day journey, then take your personal test.', steps: ['I learned every key.', 'I can type with confidence!', 'Small steps make big progress.'] }
];
const keyRows = [
  ['1','2','3','4','5','6','7','8','9','0','-','=','Backspace'],
  ['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
  ['Caps','A','S','D','F','G','H','J','K','L',';','\'','Enter'],
  ['Shift','Z','X','C','V','B','N','M',',','.','/','Shift']
];
const initialState = { name: '', currentDay: 1, completed: [], streak: 0, lastPractice: '', sessions: [], sound: true };
let state = loadState();
let activeView = 'dashboard';
let practice = { step: 0, typed: '', errors: 0, startedAt: null, timer: null, keyStats: {} };
let test = { mode: '60', typed: '', errors: 0, startedAt: null, timer: null, seconds: 60, keyStats: {} };
const testPassage = 'small steps each day make typing feel easy and strong';

function loadState() { try { return { ...initialState, ...JSON.parse(localStorage.getItem('keyquest-state')) }; } catch { return { ...initialState }; } }
function saveState() { localStorage.setItem('keyquest-state', JSON.stringify(state)); }
function el(id) { return document.getElementById(id); }
function currentLesson() { return lessons[(state.currentDay - 1) % lessons.length]; }
function escapeHtml(value) { return value.replace(/[&<>"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[char]); }
function todayString() { return new Date().toISOString().slice(0, 10); }

function setView(name) {
  activeView = name;
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `${name}View`));
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === name));
  const labels = { dashboard:['YOUR LEARNING SPACE', `Good afternoon, ${state.name || 'Student'}!`], practice:['GUIDED PRACTICE','One key at a time.'], test:['SKILL CHECK','Your personal typing test'], progress:['LEARNING HISTORY','Look how far you have come.'] };
  el('viewEyebrow').textContent = labels[name][0]; el('viewTitle').textContent = labels[name][1];
  if (name === 'practice') resetPractice();
  if (name === 'progress') renderProgress();
}

function renderKeyboard() {
  const keyboard = el('keyboard'); keyboard.innerHTML = '';
  keyRows.forEach((row, rowIndex) => {
    const rowEl = document.createElement('div'); rowEl.className = 'key-row';
    row.forEach((key, index) => {
      const keyEl = document.createElement('span'); const size = ['Backspace','Tab','Caps','Enter','Shift'].includes(key) ? 'wide' : ''; keyEl.className = `key ${size} ${index < row.length / 2 ? 'zone-left' : 'zone-right'}`; keyEl.dataset.key = key.toLowerCase(); keyEl.textContent = key === 'Backspace' ? '⌫' : key; rowEl.appendChild(keyEl);
    });
    if (rowIndex === 3) { const space = document.createElement('span'); space.className = 'key space'; space.dataset.key = ' '; space.textContent = 'space'; rowEl.appendChild(space); }
    keyboard.appendChild(rowEl);
  });
}

function renderDashboard() {
  const lesson = currentLesson();
  el('studentName').textContent = state.name || 'Student'; el('avatarInitial').textContent = (state.name || 'S').charAt(0).toUpperCase();
  el('todayTitle').textContent = lesson.title; el('todayDescription').textContent = lesson.instruction; el('todayDay').textContent = state.currentDay;
  el('streakValue').textContent = state.streak; el('sidebarStreak').textContent = state.streak; el('lessonValue').textContent = state.completed.length;
  const bestAccuracy = state.sessions.length ? Math.max(...state.sessions.map(s => s.accuracy)) : null;
  const bestWpm = state.sessions.length ? Math.max(...state.sessions.map(s => s.wpm)) : null;
  el('accuracyValue').textContent = bestAccuracy === null ? '--' : bestAccuracy; el('accuracySuffix').textContent = bestAccuracy === null ? '' : '%'; el('wpmValue').textContent = bestWpm === null ? '--' : bestWpm;
  el('streakMessage').textContent = state.streak ? 'You are building a habit!' : 'Start your first quest today!';
  const path = el('pathLine'); path.innerHTML = '';
  for (let i=1; i<=7; i++) { const dot = document.createElement('span'); dot.className = 'path-dot'; if (i < state.currentDay) dot.classList.add('done'); else if (i === state.currentDay) dot.classList.add('current'); path.appendChild(dot); }
  const weak = getWeakKeys(); const focus = el('focusKeys');
  if (weak.length) { focus.innerHTML = weak.slice(0,2).map(k => `<span class="focus-key">${k.key.toUpperCase()}</span>`).join('') + `<div><strong>Give these keys some love</strong><p>We'll add a short warm-up next.</p></div>`; el('keyBadge').textContent = 'Personalized'; }
  else { focus.innerHTML = '<span class="focus-key">F</span><span class="focus-key">J</span><div><strong>Start with home row</strong><p>Your practice will adapt to you.</p></div>'; el('keyBadge').textContent = 'Ready'; }
}

function resetPractice() {
  clearInterval(practice.timer); practice = { step: 0, typed: '', errors: 0, startedAt: null, timer: null, keyStats: {} }; const lesson = currentLesson();
  el('practiceEyebrow').textContent = `DAY ${state.currentDay} · ${lesson.group}`; el('practiceTitle').textContent = lesson.title; el('practiceInstruction').textContent = lesson.instruction;
  updatePracticeUI(); renderKeyboard();
}
function practiceTarget() { return currentLesson().steps[practice.step]; }
function renderTarget(target, typed) {
  return [...target].map((char, index) => { const safe = char === ' ' ? '&nbsp;' : escapeHtml(char); if (index < typed.length) return `<span class="${typed[index] === char ? 'correct' : 'wrong'}">${safe}</span>`; if (index === typed.length) return `<span class="current">${safe}</span>`; return safe; }).join('');
}
function calculateWpm(typed, startedAt) { if (!startedAt) return 0; const minutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60000); return Math.max(0, Math.round((typed.length / 5) / minutes)); }
function accuracy(typedLength, errors) { return typedLength ? Math.max(0, Math.round(((typedLength - errors) / typedLength) * 100)) : 100; }
function keyGuide(char) { const shifted = { '@':'2', '#':'3', '$':'4', '%':'5', '&':'7', '!':'1', '?':'/', ':':';', '+':'=' }; if (char === ' ') return { visible:' ', label:'SPACE' }; if (shifted[char]) return { visible:shifted[char], label:`SHIFT + ${shifted[char]}` }; if (char && char === char.toUpperCase() && /[A-Z]/.test(char)) return { visible:char.toLowerCase(), label:`SHIFT + ${char}` }; return { visible:(char || '').toLowerCase(), label:(char || '').toUpperCase() }; }
function updatePracticeUI() {
  const target = practiceTarget(); el('stepLabel').textContent = `Step ${practice.step + 1} of ${currentLesson().steps.length}`; el('lessonProgress').style.width = `${((practice.step + 1) / currentLesson().steps.length) * 100}%`;
  el('targetText').innerHTML = renderTarget(target, practice.typed); el('typeField').innerHTML = practice.typed ? escapeHtml(practice.typed) : '<span class="placeholder">Click here, then start typing...</span>';
  const wpm = calculateWpm(practice.typed, practice.startedAt); el('liveWpm').textContent = wpm; el('liveAccuracy').textContent = accuracy(practice.typed.length, practice.errors); el('liveErrors').textContent = practice.errors;
  const next = target[practice.typed.length]; const guide = keyGuide(next); document.querySelectorAll('.key').forEach(k => k.classList.toggle('active-key', k.dataset.key === guide.visible));
  el('keyboardPrompt').innerHTML = next ? `Your next key is <span>${guide.label}</span>` : 'Great! <span>Step complete</span>';
  el('continueLesson').disabled = practice.typed.length < target.length;
}
function recordKey(statMap, expected, actual, elapsed) { if (!expected) return; const key = expected.toLowerCase(); if (!/[a-z0-9;]/.test(key)) return; if (!statMap[key]) statMap[key] = { attempts: 0, errors: 0, totalMs: 0 }; statMap[key].attempts++; statMap[key].totalMs += elapsed; if (expected !== actual) statMap[key].errors++; }
function startPracticeTimer() { if (practice.timer) return; practice.startedAt = Date.now(); practice.timer = setInterval(() => { const s = Math.floor((Date.now() - practice.startedAt)/1000); el('practiceTimer').textContent = `00:${String(s).padStart(2,'0')}`; el('liveWpm').textContent = calculateWpm(practice.typed, practice.startedAt); }, 500); el('typingStatus').textContent = 'YOU ARE DOING GREAT'; }
function handlePracticeKey(event) {
  if (activeView !== 'practice') return; if (event.metaKey || event.ctrlKey || event.altKey) return; const target = practiceTarget();
  if (event.key === 'Backspace') { event.preventDefault(); practice.typed = practice.typed.slice(0, -1); updatePracticeUI(); return; }
  if (event.key.length !== 1 || practice.typed.length >= target.length) return; event.preventDefault(); startPracticeTimer(); const expected = target[practice.typed.length]; const elapsed = Date.now() - practice.startedAt; recordKey(practice.keyStats, expected, event.key, elapsed); if (expected !== event.key) practice.errors++; practice.typed += event.key; updatePracticeUI();
}
function completePracticeStep() {
  if (practice.typed.length < practiceTarget().length) return; if (practice.step < currentLesson().steps.length - 1) { practice.step++; practice.typed = ''; practice.errors = 0; practice.startedAt = null; clearInterval(practice.timer); practice.timer = null; el('practiceTimer').textContent = '00:00'; el('typingStatus').textContent = 'NEXT STEP'; updatePracticeUI(); el('typeField').focus(); return; }
  clearInterval(practice.timer); const totalTyped = currentLesson().steps.reduce((n, step) => n + step.length, 0); const totalErrors = Object.values(practice.keyStats).reduce((n, stat) => n + stat.errors, 0); const session = { id: Date.now(), type:'Lesson', lesson:`Day ${state.currentDay}`, date: todayString(), wpm: calculateWpm(practice.typed, practice.startedAt), accuracy: accuracy(totalTyped, totalErrors), errors: totalErrors, keys: practice.keyStats };
  saveSession(session); state.completed = [...new Set([...state.completed, state.currentDay])]; state.currentDay = Math.min(30, state.currentDay + 1); saveState(); renderDashboard(); showResult(session, true);
}
function saveSession(session) { state.sessions.unshift(session); state.sessions = state.sessions.slice(0, 18); if (state.lastPractice !== todayString()) { state.streak = state.lastPractice ? state.streak + 1 : 1; state.lastPractice = todayString(); } saveState(); }
function getWeakKeys() { const aggregated = {}; state.sessions.forEach(session => Object.entries(session.keys || {}).forEach(([key, value]) => { const item = aggregated[key] ||= { key, attempts:0, errors:0, totalMs:0 }; item.attempts += value.attempts; item.errors += value.errors; item.totalMs += value.totalMs; })); return Object.values(aggregated).map(item => ({ ...item, score: item.errors * 10 + item.totalMs / Math.max(item.attempts,1) / 100 })).sort((a,b) => b.score - a.score).filter(item => item.errors || item.attempts > 3); }

function startTest() { test = { mode: document.querySelector('.test-option.selected').dataset.test, typed:'', errors:0, startedAt:null, timer:null, seconds:60, keyStats:{} }; el('testIntro').classList.add('hidden'); el('testRun').classList.remove('hidden'); const target = test.mode === '60' ? testPassage.repeat(4) : testPassage; el('testTarget').innerHTML = renderTarget(target, ''); el('testField').innerHTML = '<span class="placeholder">Click here, then start typing...</span>'; el('testModeTitle').textContent = test.mode === '60' ? '60 second test' : 'Short passage test'; el('testClock').textContent = test.mode === '60' ? '01:00' : 'Ready'; el('testField').focus(); }
function testTarget() { return test.mode === '60' ? testPassage.repeat(4) : testPassage; }
function startTestTimer() { if (test.timer) return; test.startedAt = Date.now(); if (test.mode !== '60') return; test.timer = setInterval(() => { const remaining = Math.max(0, 60 - Math.floor((Date.now() - test.startedAt) / 1000)); el('testClock').textContent = `00:${String(remaining).padStart(2,'0')}`; if (!remaining) finishTest(); }, 250); }
function updateTestUI() { const target = testTarget(); el('testTarget').innerHTML = renderTarget(target, test.typed); el('testField').innerHTML = test.typed ? escapeHtml(test.typed) : '<span class="placeholder">Click here, then start typing...</span>'; el('testWpm').textContent = calculateWpm(test.typed, test.startedAt); el('testAccuracy').textContent = accuracy(test.typed.length, test.errors); el('testErrors').textContent = test.errors; }
function handleTestKey(event) { if (activeView !== 'test' || el('testRun').classList.contains('hidden')) return; if (event.metaKey || event.ctrlKey || event.altKey) return; if (event.key === 'Backspace') { event.preventDefault(); test.typed = test.typed.slice(0,-1); updateTestUI(); return; } if (event.key.length !== 1 || test.typed.length >= testTarget().length) return; event.preventDefault(); startTestTimer(); const expected = testTarget()[test.typed.length]; recordKey(test.keyStats, expected, event.key, Date.now() - test.startedAt); if (expected !== event.key) test.errors++; test.typed += event.key; updateTestUI(); if (test.mode === 'passage' && test.typed.length === testTarget().length) finishTest(); }
function finishTest() { if (!test.startedAt) return; clearInterval(test.timer); const session = { id: Date.now(), type:'Typing test', lesson:test.mode === '60' ? '60 seconds' : 'Passage', date:todayString(), wpm:calculateWpm(test.typed, test.startedAt), accuracy:accuracy(test.typed.length,test.errors), errors:test.errors, keys:test.keyStats }; saveSession(session); renderDashboard(); showResult(session, false); el('testRun').classList.add('hidden'); el('testIntro').classList.remove('hidden'); }

function showResult(session, isLesson) { el('resultEyebrow').textContent = isLesson ? 'LESSON COMPLETE' : 'TEST COMPLETE'; el('resultTitle').textContent = isLesson ? 'That was excellent work!' : 'You did it!'; el('resultWpm').textContent = session.wpm; el('resultAccuracy').textContent = `${session.accuracy}%`; el('resultErrors').textContent = session.errors; const weak = Object.values(session.keys).filter(k => k.errors).length; el('resultMessage').textContent = weak ? 'We noticed a couple of keys to revisit. Your next warm-up will help.' : 'Beautiful accuracy. Your fingers are learning the way.'; el('resultAction').textContent = isLesson ? 'Back to my learning →' : 'See my progress →'; el('resultModal').classList.remove('hidden'); }
function renderProgress() { const sessions = state.sessions; const chart = el('simpleChart'); chart.innerHTML = ''; if (!sessions.length) { chart.innerHTML = '<p class="empty-history">Your accuracy chart will grow here after your first practice.</p>'; el('chartAverage').textContent = 'No sessions yet'; } else { sessions.slice(0,7).reverse().forEach((session, index) => { const bar = document.createElement('div'); bar.className = 'chart-bar'; bar.style.height = `${Math.max(14, session.accuracy * 1.25)}px`; bar.innerHTML = `<b>${session.accuracy}%</b><span>${index+1}</span>`; chart.appendChild(bar); }); el('chartAverage').textContent = `${Math.round(sessions.reduce((sum,s)=>sum+s.accuracy,0)/sessions.length)}% average`; }
  const weak = getWeakKeys(); el('keyCoach').innerHTML = weak.length ? `<div class="coach-list">${weak.slice(0,3).map(item => `<div class="coach-item"><span class="focus-key">${item.key.toUpperCase()}</span><div><strong>${item.errors ? `${item.errors} little slips` : 'Needs a little speed'}</strong><p>Warm-up practice will bring this key home.</p><div class="coach-bar"><i style="width:${Math.min(100, 20 + item.score * 2)}%"></i></div></div></div>`).join('')}</div>` : '<p>Complete a practice session and your personal key coach will appear here.</p>';
  const list = el('historyList'); list.innerHTML = sessions.length ? sessions.slice(0,7).map(session => `<div class="history-item"><span><strong>${session.type} · ${session.lesson}</strong><small>${session.date}</small></span><span><strong>${session.wpm}</strong><small>WPM</small></span><span><strong>${session.accuracy}%</strong><small>accuracy</small></span><span><strong>${session.errors}</strong><small>errors</small></span></div>`).join('') : '<p class="empty-history">Your completed practice sessions will appear here.</p>';
}
function showToast(message) { el('toast').textContent = message; el('toast').classList.remove('hidden'); setTimeout(() => el('toast').classList.add('hidden'), 2400); }
function initEvents() {
  document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
  el('startLesson').addEventListener('click', () => setView('practice')); el('quickPractice').addEventListener('click', () => setView('practice')); el('seePath').addEventListener('click', () => setView('practice'));
  el('exitPractice').addEventListener('click', () => setView('dashboard')); el('restartPractice').addEventListener('click', resetPractice); el('continueLesson').addEventListener('click', completePracticeStep); el('typeField').addEventListener('click', () => el('typeField').focus());
  el('startTest').addEventListener('click', startTest); el('stopTest').addEventListener('click', finishTest); el('testField').addEventListener('click', () => el('testField').focus()); document.querySelectorAll('.test-option').forEach(btn => btn.addEventListener('click', () => { document.querySelectorAll('.test-option').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); }));
  document.addEventListener('keydown', event => { handlePracticeKey(event); handleTestKey(event); }); document.addEventListener('visibilitychange', () => { if (document.hidden && practice.timer) { clearInterval(practice.timer); practice.timer = null; el('typingStatus').textContent = 'PAUSED · CLICK TO CONTINUE'; } });
  el('soundButton').addEventListener('click', () => { state.sound = !state.sound; saveState(); el('soundButton').textContent = state.sound ? '♬' : '♩'; showToast(state.sound ? 'Sound cues are on.' : 'Sound cues are off.'); }); el('helpButton').addEventListener('click', () => showToast('Use the highlighted key, then come right back to home row.'));
  el('openProfile').addEventListener('click', () => { if (confirm('Start a new local profile? This resets practice saved in this browser.')) { localStorage.removeItem('keyquest-state'); location.reload(); } });
  el('beginJourney').addEventListener('click', () => { const name = el('nameInput').value.trim(); if (!name) { el('nameInput').focus(); return; } state.name = name; saveState(); el('onboardingModal').classList.add('hidden'); renderDashboard(); setView('dashboard'); }); el('nameInput').addEventListener('keydown', event => { if (event.key === 'Enter') el('beginJourney').click(); });
  el('resultAction').addEventListener('click', () => { el('resultModal').classList.add('hidden'); setView(activeView === 'test' ? 'progress' : 'dashboard'); });
}
function init() { renderKeyboard(); renderDashboard(); initEvents(); el('soundButton').textContent = state.sound ? '♬' : '♩'; if (state.name) el('onboardingModal').classList.add('hidden'); }
init();
