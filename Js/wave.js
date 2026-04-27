// ── Beat Visualizer for #barGroup ──
let audioCtx2, analyser2, source2, mediaSource;
let vizAnimId = null;
const BAR_COUNT = 28;

function initVisualizer() {
  if (audioCtx2) return; // already initialized
  audioCtx2 = new (window.AudioContext || window.webkitAudioContext)();
  analyser2 = audioCtx2.createAnalyser();
  analyser2.fftSize = 128;
  analyser2.smoothingTimeConstant = 0.8;
  mediaSource = audioCtx2.createMediaElementSource(currentSong);
  mediaSource.connect(analyser2);
  analyser2.connect(audioCtx2.destination);
}

function setupBars() {
  const barGroup = document.getElementById('barGroup');
  barGroup.innerHTML = '';
  for (let i = 0; i < BAR_COUNT; i++) {
    const bar = document.createElement('div');
    bar.className = 'viz-bar';
    barGroup.appendChild(bar);
  }
}

function animateBars() {
  vizAnimId = requestAnimationFrame(animateBars);
  if (!analyser2) return;
  const freqData = new Uint8Array(analyser2.frequencyBinCount);
  analyser2.getByteFrequencyData(freqData);
  const bars = document.querySelectorAll('.viz-bar');
  bars.forEach((bar, i) => {
    const bin = Math.floor((i / BAR_COUNT) * freqData.length * 0.7);
    const val = freqData[bin] / 255;
    const h = Math.max(3, val * 48);
    bar.style.height = h + 'px';
    // Color: green when low, teal when mid, white when high
   // Color: black to white based on intensity
    const brightness = Math.round(val * 255);
    bar.style.background = `rgb(${brightness},${brightness},${brightness})`;
    bar.style.boxShadow = val > 0.4 ? `0 0 8px rgba(255,255,255,${val * 0.8})` : 'none';
  });
}

function startVisualizer() {
  if (!audioCtx2) initVisualizer();
  if (audioCtx2.state === 'suspended') audioCtx2.resume();
  if (!vizAnimId) animateBars();
}

// CSS for bars — inject once
const vizStyle = document.createElement('style');
vizStyle.textContent = `
  #barGroup {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 52px;
    margin-top: 6px;
  }
  .viz-bar {
    width: 4px;
    min-height: 3px;
    border-radius: 2px 2px 0 0;
    background: black;
    transition: height 0.05s ease;
  }
`;
document.head.appendChild(vizStyle);

// Setup bars on load
setupBars();