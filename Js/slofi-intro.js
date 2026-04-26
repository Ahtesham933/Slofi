// ─────────────────────────────────────────
//  Slofi Intro Animation v4
//  Add just before </body>:
//  <script src="slofi-intro.js"></script>
// ─────────────────────────────────────────

(function () {

  const style = document.createElement('style');
  style.textContent = `
    body.slofi-intro-active {
      overflow: hidden;
    }

    #slofi-intro {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(ellipse at center, #0f172a 0%, #020617 70%);
    }

    #slofi-intro .intro-logo {
      position: absolute;
      display: inline-flex;
      align-items: center;
      font-family: 'Sora', sans-serif;
      font-weight: 600;
      font-size: 96px;
      letter-spacing: -2px;
      line-height: 1;
      gap: 0;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      white-space: nowrap;
    }

    #slofi-intro .intro-part {
      color: #e8ddd0;
      opacity: 0;
      display: inline-block;
    }

    /* sl/fi slide — 3.0s slow ease */
    #slofi-intro .intro-sl {
      transform: translateX(-40px);
      transition: opacity 3.0s cubic-bezier(.22,1,.36,1),
                  transform 3.0s cubic-bezier(.22,1,.36,1);
    }
    #slofi-intro .intro-fi {
      transform: translateX(40px);
      transition: opacity 3.0s cubic-bezier(.22,1,.36,1),
                  transform 3.0s cubic-bezier(.22,1,.36,1);
    }
    #slofi-intro .intro-part.revealed {
      opacity: 1;
      transform: translateX(0);
    }

    /* Disk */
    #slofi-intro .intro-disk {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      border: 5px solid transparent;
      background:
        linear-gradient(#020617, #161310) padding-box,
        linear-gradient(to bottom right, #0f172a, #5d53e9, #020617) border-box;
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow:
        inset 0 0 0 18px #161310,
        inset 0 0 0 24px #e0944033,
        inset 0 0 0 30px #161310,
        inset 0 0 0 34px #e0944020,
        0 0 60px #3c34a744,
        0 0 120px #1e1b4b33;
      opacity: 0;
      transform: scale(0.2) rotate(-360deg);
      transition: opacity 0.7s cubic-bezier(.34,1.36,.64,1),
                  transform 0.7s cubic-bezier(.34,1.36,.64,1);
    }

    /* Disk spins at 5s per rotation */
    @keyframes slofi-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    #slofi-intro .intro-disk-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: slofi-spin 5s linear infinite;
      animation-play-state: paused;
    }

    #slofi-intro .intro-disk.revealed {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }

    #slofi-intro .intro-disk-hole {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: linear-gradient(to bottom right, #0f172a, #3c34a7, #020617);
      position: absolute;
      box-shadow: 0 0 10px #5d53e966;
    }

    /* Background curtain wipe */
    #slofi-intro .intro-bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at center, #0f172a 0%, #020617 70%);
      transform-origin: left center;
      transition: none;
    }
    #slofi-intro .intro-bg.wipe {
      transition: transform 0.9s cubic-bezier(.76,0,.24,1);
      transform: scaleX(0);
    }

    /* Particles */
    @keyframes particle-burst {
      0%   { opacity: 1; transform: translate(0,0) scale(1); }
      100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0); }
    }
    .slofi-particle {
      position: fixed;
      border-radius: 50%;
      animation: particle-burst 0.7s ease-out forwards;
      pointer-events: none;
      z-index: 100000;
    }
  `;
  document.head.appendChild(style);

  // ── Build HTML ────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'slofi-intro';
  overlay.innerHTML = `
    <div class="intro-bg"></div>
    <div class="intro-logo">
      <span class="intro-part intro-sl">sl</span>
      <span class="intro-disk">
        <span class="intro-disk-inner">
          <span class="intro-disk-hole"></span>
        </span>
      </span>
      <span class="intro-part intro-fi">fi</span>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.classList.add('slofi-intro-active');

  const bg        = overlay.querySelector('.intro-bg');
  const logo      = overlay.querySelector('.intro-logo');
  const disk      = overlay.querySelector('.intro-disk');
  const diskInner = overlay.querySelector('.intro-disk-inner');
  const sl        = overlay.querySelector('.intro-sl');
  const fi        = overlay.querySelector('.intro-fi');

  // ── Particle burst ────────────────────────────────────────
  function burst() {
    const rect   = disk.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const colors = ['#5d53e9','#3c34a7','#e8ddd0','#e09440','#818cf8'];
    for (let i = 0; i < 20; i++) {
      const p     = document.createElement('div');
      p.className = 'slofi-particle';
      const angle = (i / 20) * 360;
      const dist  = 70 + Math.random() * 80;
      const tx    = Math.cos(angle * Math.PI / 180) * dist;
      const ty    = Math.sin(angle * Math.PI / 180) * dist;
      const size  = 3 + Math.random() * 6;
      p.style.cssText = `
        left:${cx}px; top:${cy}px;
        width:${size}px; height:${size}px;
        background:${colors[i % colors.length]};
        --tx:${tx}px; --ty:${ty}px;
        animation-delay:${Math.random() * 0.08}s;
        animation-duration:${0.5 + Math.random() * 0.4}s;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }
  }

  // ── Timeline ──────────────────────────────────────────────
  // t=100ms  → disk pops in, starts spinning at 5s/rotation
  setTimeout(() => {
    disk.classList.add('revealed');
    diskInner.style.animationPlayState = 'running';
  }, 100);

  // t=1500ms → sl & fi slowly slide in (3.0s transition)
  setTimeout(() => {
    sl.classList.add('revealed');
    fi.classList.add('revealed');
  }, 1500);

  // t=5500ms → particle burst (after sl/fi fully settled ~4500ms + buffer)
  setTimeout(() => {
    burst();
  }, 5500);

  // t=6200ms → logo flies to nav + curtain wipes left
  setTimeout(() => {
    const navLogo = document.querySelector('.slofi-logo');
    if (!navLogo) {
      bg.classList.add('wipe');
      logo.style.transition = 'opacity 0.5s';
      logo.style.opacity = '0';
      return;
    }

    const navRect  = navLogo.getBoundingClientRect();
    const logoRect = logo.getBoundingClientRect();

    const scaleX = navRect.width  / logoRect.width;
    const scaleY = navRect.height / logoRect.height;
    const scale  = Math.min(scaleX, scaleY);

    const newW = logoRect.width  * scale;
    const newH = logoRect.height * scale;

    const targetCX = navRect.left + newW / 2;
    const targetCY = navRect.top  + newH / 2;
    const fromCX   = logoRect.left + logoRect.width  / 2;
    const fromCY   = logoRect.top  + logoRect.height / 2;

    const dx = targetCX - fromCX;
    const dy = targetCY - fromCY;

    logo.style.transition = `transform 0.85s cubic-bezier(.76,0,.24,1), opacity 0.3s ease 0.6s`;
    logo.style.transform  = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`;
    logo.style.opacity    = '0';

    bg.classList.add('wipe');

  }, 6200);

  // t=7200ms → remove overlay, unlock scroll
  setTimeout(() => {
    overlay.remove();
    document.body.classList.remove('slofi-intro-active');
  }, 7200);

})();