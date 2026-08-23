/* =========================================================
   SCRIPT PRINCIPAL — AquaSolar CEP
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* 1. MENU HAMBÚRGUER (mobile) */
  const menuToggle = document.getElementById('menuToggle');
  const menuPrincipal = document.getElementById('menuPrincipal');

  if (menuToggle && menuPrincipal) {
    menuToggle.addEventListener('click', () => {
      const aberto = menuPrincipal.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', aberto);
      menuToggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });

    menuPrincipal.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuPrincipal.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* 2. AJUSTE DE FONTE (acessibilidade) */
  const root = document.documentElement;
  const BASE = 16, MIN = 12, MAX = 24;
  let current = BASE;

  const setFontSize = (size) => {
    current = Math.max(MIN, Math.min(MAX, size));
    root.style.fontSize = current + 'px';
  };

  const fontPlus = document.getElementById('fontPlus');
  const fontMinus = document.getElementById('fontMinus');
  const fontReset = document.getElementById('fontReset');

  if (fontPlus) fontPlus.addEventListener('click', () => setFontSize(current + 2));
  if (fontMinus) fontMinus.addEventListener('click', () => setFontSize(current - 2));
  if (fontReset) fontReset.addEventListener('click', () => setFontSize(BASE));

  /* 3. DISCO DE NEWTON (clique para girar rápido) */
  const newtonSvg = document.getElementById('newtonSvg');
  if (newtonSvg) {
    const toggleNewton = () => newtonSvg.classList.toggle('rapido');
    newtonSvg.addEventListener('click', toggleNewton);
    newtonSvg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleNewton(); }
    });
  }

  /* 4. CÂMARA ESCURA (clique para animar) */
  const cameraSvg = document.getElementById('cameraSvg');
  if (cameraSvg) {
    const toggleCamera = () => cameraSvg.classList.toggle('ativa');
    cameraSvg.addEventListener('click', toggleCamera);
    cameraSvg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCamera(); }
    });
  }

  /* 5. SIMULADOR INTERATIVO */
  const radSlider = document.getElementById('radSlider');
  const ambSlider = document.getElementById('ambSlider');
  const targetSlider = document.getElementById('targetSlider');

  if (radSlider && ambSlider && targetSlider) {
    const radValue = document.getElementById('radValue');
    const ambValue = document.getElementById('ambValue');
    const targetValue = document.getElementById('targetValue');
    const waterTempEl = document.getElementById('waterTemp');
    const statusText = document.getElementById('statusText');
    const waterLevel = document.getElementById('waterLevel');
    const atuador = document.getElementById('atuador');
    const atuadorIcon = document.getElementById('atuadorIcon');
    const atuadorState = document.getElementById('atuadorState');
    const bubbles = document.getElementById('bubbles');

    let intervaloBolhas = null;

    const criarBolhas = () => {
      if (intervaloBolhas) return;
      intervaloBolhas = setInterval(() => {
        const b = document.createElement('span');
        b.className = 'bubble';
        b.style.left = Math.random() * 100 + '%';
        b.style.animationDuration = (2 + Math.random() * 2) + 's';
        b.style.width = b.style.height = (6 + Math.random() * 8) + 'px';
        if (bubbles) bubbles.appendChild(b);
        setTimeout(() => b.remove(), 4000);
      }, 250);
    };

    const limparBolhas = () => {
      if (intervaloBolhas) clearInterval(intervaloBolhas);
      intervaloBolhas = null;
      if (bubbles) bubbles.innerHTML = '';
    };

    const atualizarSimulador = () => {
      const rad = parseInt(radSlider.value, 10);
      const amb = parseInt(ambSlider.value, 10);
      const alvo = parseInt(targetSlider.value, 10);

      if (radValue) radValue.textContent = rad;
      if (ambValue) ambValue.textContent = amb;
      if (targetValue) targetValue.textContent = alvo;

      const tempAgua = (amb + rad * 0.15).toFixed(1);
      if (waterTempEl) waterTempEl.textContent = tempAgua;

      const altura = 30 + (tempAgua - 10) * 2;
      if (waterLevel) waterLevel.style.height = Math.min(95, Math.max(10, altura)) + '%';

      const t = parseFloat(tempAgua);
      if (waterLevel) {
        if (t < 20) waterLevel.style.background = 'linear-gradient(180deg,#93c5fd,#1e40af)';
        else if (t < 28) waterLevel.style.background = 'linear-gradient(180deg,#60a5fa,#0369a1)';
        else if (t < 32) waterLevel.style.background = 'linear-gradient(180deg,#0ea5e9,#0c4a6e)';
        else waterLevel.style.background = 'linear-gradient(180deg,#f59e0b,#b45309)';
      }

      const bombaLigada = (t < alvo) && (rad > 20);
      
      if (atuador && atuadorIcon && atuadorState && statusText) {
        if (bombaLigada) {
          atuador.classList.add('ligada');
          atuadorIcon.textContent = '🟢';
          atuadorState.textContent = 'ligada';
          statusText.textContent = '☀️ Aquecendo a piscina...';
          criarBolhas();
        } else if (t >= alvo) {
          atuador.classList.remove('ligada');
          atuadorIcon.textContent = '🔵';
          atuadorState.textContent = 'em espera';
          statusText.textContent = '✅ Temperatura ideal alcançada!';
          limparBolhas();
        } else {
          atuador.classList.remove('ligada');
          atuadorIcon.textContent = '⚪';
          atuadorState.textContent = 'desligada';
          statusText.textContent = '🌙 Radiação insuficiente — sistema em standby.';
          limparBolhas();
        }
      }
    };

    [radSlider, ambSlider, targetSlider].forEach(s => s.addEventListener('input', atualizarSimulador));
    atualizarSimulador();
  }

  /* 6. FECHAR MENU COM TECLA ESC */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuPrincipal && menuPrincipal.classList.contains('open')) {
      menuPrincipal.classList.remove('open');
      if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    }
  });

});
