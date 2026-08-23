/* =========================================================
   SCRIPT PRINCIPAL — AquaSolar CEP
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------
     1. MENU HAMBÚRGUER (mobile)
     ------------------------------------------------------- */
  const menuToggle = document.getElementById('menuToggle');
  const menuPrincipal = document.getElementById('menuPrincipal');

  menuToggle.addEventListener('click', () => {
    const aberto = menuPrincipal.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', aberto);
    menuToggle.setAttribute('aria-label', aberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
  });

  // Fecha o menu ao clicar em um link (melhor UX no mobile)
  menuPrincipal.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuPrincipal.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* -------------------------------------------------------
     2. AJUSTE DE FONTE (acessibilidade)
     ------------------------------------------------------- */
  const root = document.documentElement;
  const BASE = 16;     // tamanho padrão em px
  const MIN  = 12;
  const MAX  = 24;
  let current = BASE;

  const setFontSize = (size) => {
    current = Math.max(MIN, Math.min(MAX, size));
    root.style.fontSize = current + 'px';
  };

  document.getElementById('fontPlus').addEventListener('click',  () => setFontSize(current + 2));
  document.getElementById('fontMinus').addEventListener('click', () => setFontSize(current - 2));
  document.getElementById('fontReset').addEventListener('click', () => setFontSize(BASE));

  /* -------------------------------------------------------
     3. DISCO DE NEWTON — clique para girar rápido e ficar branco
     ------------------------------------------------------- */
  const newtonSvg = document.getElementById('newtonSvg');
  if (newtonSvg) {
    const toggleNewton = () => newtonSvg.classList.toggle('rapido');

    // Clique
    newtonSvg.addEventListener('click', toggleNewton);
    // Teclado (Enter ou Espaço) — acessibilidade
    newtonSvg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleNewton();
      }
    });
  }

  /* -------------------------------------------------------
     4. CÂMARA ESCURA — clique para animar raios e imagem invertida
     ------------------------------------------------------- */
  const cameraSvg = document.getElementById('cameraSvg');
  if (cameraSvg) {
    const toggleCamera = () => cameraSvg.classList.toggle('ativa');

    cameraSvg.addEventListener('click', toggleCamera);
    cameraSvg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCamera();
      }
    });
  }

  /* -------------------------------------------------------
     5. SIMULADOR INTERATIVO
     ------------------------------------------------------- */
  const radSlider    = document.getElementById('radSlider');
  const ambSlider    = document.getElementById('ambSlider');
  const targetSlider = document.getElementById('targetSlider');

  const radValue    = document.getElementById('radValue');
  const ambValue    = document.getElementById('ambValue');
  const targetValue = document.getElementById('targetValue');

  const waterTempEl = document.getElementById('waterTemp');
  const statusText  = document.getElementById('statusText');
  const waterLevel  = document.getElementById('waterLevel');
  const atuador     = document.getElementById('atuador');
  const atuadorIcon = document.getElementById('atuadorIcon');
  const atuadorState= document.getElementById('atuadorState');
  const bubbles     = document.getElementById('bubbles');

  // Modelo simplificado: T_água ≈ T_amb + (radiação * 0.15)
  const atualizarSimulador = () => {
    const rad = parseInt(radSlider.value, 10);
    const amb = parseInt(ambSlider.value, 10);
    const alvo = parseInt(targetSlider.value, 10);

    radValue.textContent    = rad;
    ambValue.textContent    = amb;
    targetValue.textContent = alvo;

    const tempAgua = (amb + rad * 0.15).toFixed(1);
    waterTempEl.textContent = tempAgua;

    // Altura visual da água cresce com a temperatura
    const altura = 30 + (tempAgua - 10) * 2; // entre ~30% e ~100%
    waterLevel.style.height = Math.min(95, Math.max(10, altura)) + '%';

    // Cor da água: mais quente = mais alaranjada
    const t = parseFloat(tempAgua);
    if (t < 20) {
      waterLevel.style.background = 'linear-gradient(180deg,#93c5fd,#1e40af)';
    } else if (t < 28) {
      waterLevel.style.background = 'linear-gradient(180deg,#60a5fa,#0369a1)';
    } else if (t < 32) {
      waterLevel.style.background = 'linear-gradient(180deg,#0ea5e9,#0c4a6e)';
    } else {
      waterLevel.style.background = 'linear-gradient(180deg,#f59e0b,#b45309
         ')';
    }

    // Lógica do atuador: liga a bomba se a água estiver abaixo da desejada
    // e houver radiação suficiente (dia)
    const bombaLigada = (t < alvo) && (rad > 20);
    
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
      statusText.textContent = ' Radiação insuficiente — sistema em standby.';
      limparBolhas();
    }
  };

  // Bolhas animadas quando a bomba está ligada
  let intervaloBolhas = null;
  const criarBolhas = () => {
    if (intervaloBolhas) return;
    intervaloBolhas = setInterval(() => {
      const b = document.createElement('span');
      b.className = 'bubble';
      b.style.left = Math.random() * 100 + '%';
      b.style.animationDuration = (2 + Math.random() * 2) + 's';
      b.style.width = b.style.height = (6 + Math.random() * 8) + 'px';
      bubbles.appendChild(b);
      setTimeout(() => b.remove(), 4000);
    }, 250);
  };
  
  const limparBolhas = () => {
    if (intervaloBolhas) clearInterval(intervaloBolhas);
    intervaloBolhas = null;
    bubbles.innerHTML = '';
  };

  // Atualiza o simulador sempre que o usuário mexe nos sliders
  [radSlider, ambSlider, targetSlider].forEach(s => {
    s.addEventListener('input', atualizarSimulador);
  });
  
  atualizarSimulador(); // executa o estado inicial ao carregar a página

  /* -------------------------------------------------------
     6. FECHAR MENU MOBILE COM TECLA ESC (acessibilidade)
     ------------------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuPrincipal.classList.contains('open')) {
      menuPrincipal.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.focus();
    }
  });

});
