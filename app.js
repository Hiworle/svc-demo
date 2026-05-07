import WaveSurfer from 'wavesurfer.js';

/* ===== Data Config =====
   Edit this array to add/remove demo groups.
   All groups share the same source vocal (ai神童.wav).
   Reference = target timbre sample, Converted = SVC output. */

const SHARED_SOURCE = 'audio/source.mp3';

const groups = [
  {
    name: '川普 (Trump)',
    tracks: [
      { type: 'source',    label: '原始干声',         path: SHARED_SOURCE },
      { type: 'reference', label: '参考音色',  path: 'audio/trump-reference.wav' },
      { type: 'converted', label: '转换结果',   path: 'audio/trump-converted.mp3' },
    ],
  },
  {
    name: '洛天依 (Luo Tianyi)',
    tracks: [
      { type: 'source',    label: '原始干声',         path: SHARED_SOURCE },
      { type: 'reference', label: '参考音色',  path: 'audio/luotianyi-reference.wav' },
      { type: 'converted', label: '转换结果',   path: 'audio/luotianyi-converted.mp3' },
    ],
  },
  {
    name: '周深 (Zhou Shen)',
    tracks: [
      { type: 'source',    label: '原始干声',         path: SHARED_SOURCE },
      { type: 'reference', label: '参考音色',  path: 'audio/zhoushen-reference.wav' },
      { type: 'converted', label: '转换结果',   path: 'audio/zhoushen-converted.mp3' },
    ],
  },
  {
    name: '孙燕姿 (Sun Yanzi)',
    tracks: [
      { type: 'source',    label: '原始干声',         path: SHARED_SOURCE },
      { type: 'reference', label: '参考音色',  path: 'audio/sunyanzi-reference.wav' },
      { type: 'converted', label: '转换结果',   path: 'audio/sunyanzi-converted.mp3' },
    ],
  },
  {
    name: '王菲 (Faye Wong)',
    tracks: [
      { type: 'source',    label: '原始干声',         path: SHARED_SOURCE },
      { type: 'reference', label: '参考音色',  path: 'audio/wangfei-reference.wav' },
      { type: 'converted', label: '转换结果',   path: 'audio/wangfei-converted.mp3' },
    ],
  },
];

/* ===== Waveform color config per track type ===== */
const colorConfig = {
  source:    { wave: '#374F80', progress: '#3B82F6' },
  reference: { wave: '#4C3F80', progress: '#8B5CF6' },
  converted: { wave: '#6B3D28', progress: '#F97316' },
};

/* ===== SVG Icons ===== */
const playIcon = `<svg class="play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z"/></svg>`;
const pauseIcon = `<svg class="pause-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

/* ===== DOM container ===== */
const container = document.getElementById('groups-container');

/* ===== Track state ===== */
const groupSurfers = [];

/* ===== Render all groups ===== */
function renderGroups() {
  groups.forEach((group, groupIdx) => {
    const section = document.createElement('section');
    section.className = 'group-section';

    const title = document.createElement('h2');
    title.className = 'group-title';
    title.textContent = group.name;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'comparison-grid';

    group.tracks.forEach((track, trackIdx) => {
      const card = document.createElement('div');
      card.className = `player-card ${track.type}`;
      card.id = `card-${groupIdx}-${trackIdx}`;

      const header = document.createElement('div');
      header.className = 'card-header';
      const badge = document.createElement('span');
      badge.className = `card-badge ${track.type}`;
      badge.textContent = track.label;
      header.appendChild(badge);
      card.appendChild(header);

      const waveformWrapper = document.createElement('div');
      waveformWrapper.className = 'waveform-container';
      waveformWrapper.id = `waveform-${groupIdx}-${trackIdx}`;
      card.appendChild(waveformWrapper);

      const controls = document.createElement('div');
      controls.className = 'controls-row';

      const playBtn = document.createElement('button');
      playBtn.className = 'play-btn';
      playBtn.id = `play-btn-${groupIdx}-${trackIdx}`;
      playBtn.innerHTML = playIcon + pauseIcon;
      playBtn.setAttribute('aria-label', `播放 ${track.label}`);
      playBtn.addEventListener('click', () => togglePlay(groupIdx, trackIdx));
      controls.appendChild(playBtn);

      const timeDisplay = document.createElement('span');
      timeDisplay.className = 'time-display';
      timeDisplay.id = `time-${groupIdx}-${trackIdx}`;
      timeDisplay.textContent = '--:--';
      controls.appendChild(timeDisplay);

      card.appendChild(controls);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

/* ===== Format time (seconds → M:SS) ===== */
function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ===== Initialize WaveSurfer for a single track ===== */
function initWaveSurfer(groupIdx, trackIdx) {
  const track = groups[groupIdx].tracks[trackIdx];
  const colors = colorConfig[track.type];
  const waveformId = `waveform-${groupIdx}-${trackIdx}`;
  const timeId = `time-${groupIdx}-${trackIdx}`;
  const cardId = `card-${groupIdx}-${trackIdx}`;
  const btnId = `play-btn-${groupIdx}-${trackIdx}`;

  const ws = WaveSurfer.create({
    container: `#${waveformId}`,
    waveColor: colors.wave,
    progressColor: colors.progress,
    url: track.path,
    height: 80,
    barWidth: 2,
    barGap: 1.5,
    barRadius: 2,
    cursorWidth: 2,
    cursorColor: 'rgba(255,255,255,0.5)',
    backend: 'WebAudio',
    normalize: false,
    autoCenter: false,
    autoScroll: false,
    fillParent: true,
    interact: true,
    hideScrollbar: true,
  });

  const card = document.getElementById(cardId);
  const timeEl = document.getElementById(timeId);
  const btnEl = document.getElementById(btnId);

  ws.on('loading', () => {
    timeEl.textContent = '加载中...';
    card.classList.add('loading');
  });

  ws.on('ready', () => {
    timeEl.textContent = formatTime(ws.getDuration());
    card.classList.remove('loading', 'error');
  });

  ws.on('timeupdate', (currentTime) => {
    timeEl.textContent = formatTime(currentTime);
  });

  ws.on('play', () => {
    card.classList.add('playing');
    btnEl.setAttribute('aria-label', `暂停 ${track.label}`);
    if (groupSurfers[groupIdx]) {
      groupSurfers[groupIdx].forEach((other, otherIdx) => {
        if (otherIdx !== trackIdx && other && other.isPlaying()) {
          other.pause();
        }
      });
    }
  });

  ws.on('pause', () => {
    card.classList.remove('playing');
    btnEl.setAttribute('aria-label', `播放 ${track.label}`);
  });

  ws.on('finish', () => {
    card.classList.remove('playing');
    btnEl.setAttribute('aria-label', `播放 ${track.label}`);
    timeEl.textContent = formatTime(ws.getDuration());
  });

  ws.on('error', (err) => {
    console.warn(`Error loading ${track.path}:`, err);
    card.classList.remove('loading');
    card.classList.add('error');
    const waveformEl = document.getElementById(waveformId);
    if (waveformEl) {
      waveformEl.innerHTML = `<div class="waveform-error">音频文件未找到<br><small>${track.path}</small></div>`;
    }
    timeEl.textContent = '--:--';
  });

  btnEl.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      togglePlay(groupIdx, trackIdx);
    }
  });

  return ws;
}

/* ===== Toggle play/pause ===== */
function togglePlay(groupIdx, trackIdx) {
  const ws = groupSurfers[groupIdx]?.[trackIdx];
  if (!ws) return;
  ws.playPause();
}

/* ===== Initialize ===== */
function init() {
  renderGroups();

  groups.forEach((group, groupIdx) => {
    const surfers = [];
    group.tracks.forEach((_, trackIdx) => {
      const ws = initWaveSurfer(groupIdx, trackIdx);
      surfers.push(ws);
    });
    groupSurfers.push(surfers);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
