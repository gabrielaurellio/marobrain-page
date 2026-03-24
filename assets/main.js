/* ================================================================
   main.js — Memopezil Rebuild
   Mínimo: data dinâmica + contador de estoque
   Zero tracking. Zero libs externas.
   ================================================================ */
(function () {
  'use strict';

  /* 1. DATA ATUAL no post meta */
  var dateEl = document.querySelector('.data_atual');
  if (dateEl) {
    var d  = new Date();
    var dd = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
    var mm = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1);
    dateEl.textContent = dd + '/' + mm + '/' + d.getFullYear();
  }

  /* 2. CONTADOR DE ESTOQUE — decresce 1-2 a cada 55s */
  var STORAGE_KEY = 'mp_cnt';
  var STORAGE_TS  = 'mp_ts';
  var MIN_COUNT   = 9;      // nunca abaixo de 9 — urgência sem zerar
  var START_COUNT = 43;     // começa em 43 quando os potes aparecem no pitch
  var INTERVAL_MS = 55000;  // cai a cada 55s — visível, crível, dura ~30min até chegar em 9

  function getRandom() { return Math.floor(Math.random() * 2) + 1; } // 1 ou 2 por tick

  function getStorage(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  }

  function setStorage(key, val) {
    try { sessionStorage.setItem(key, val); } catch (e) {}
  }

  function initCount() {
    var saved = parseInt(getStorage(STORAGE_KEY), 10);
    var ts    = parseInt(getStorage(STORAGE_TS) || '0', 10);
    if (isNaN(saved) || saved < MIN_COUNT) { saved = START_COUNT; }

    // Recalcula pelo tempo decorrido desde a última visita
    var elapsed   = Date.now() - ts;
    var intervals = Math.floor(elapsed / INTERVAL_MS);
    for (var i = 0; i < intervals; i++) {
      saved = Math.max(MIN_COUNT, saved - getRandom());
    }
    return saved;
  }

  function saveCount(n) {
    setStorage(STORAGE_KEY, String(n));
    setStorage(STORAGE_TS,  String(Date.now()));
  }

  // Cache dos elementos do contador (evita querySelectorAll repetido)
  var counterEls = document.querySelectorAll('.counter_left');

  function renderCount(n) {
    counterEls.forEach(function (el) { el.textContent = n; });
  }

  function tick() {
    var current = parseInt(getStorage(STORAGE_KEY) || START_COUNT, 10);
    var next    = Math.max(MIN_COUNT, current - getRandom());
    saveCount(next);
    renderCount(next);
  }

  var count = initCount();
  saveCount(count);
  renderCount(count);
  var tickTimer = setInterval(tick, INTERVAL_MS);

  // Limpa o intervalo ao sair da página (evita memory leak)
  window.addEventListener('beforeunload', function () {
    clearInterval(tickTimer);
  });

  /* 3. IGUALA Basic com Most Popular em desktop */
  function syncBasicHeight() {
    var items = document.querySelectorAll('.products .item');
    if (items.length < 3) return;
    var popular = items[1];
    var basic   = items[2];
    basic.style.minHeight = '';
    if (window.innerWidth >= 768) {
      basic.style.minHeight = popular.offsetHeight + 'px';
    }
  }
  // Roda após tudo renderizado (CSS + imagens)
  window.addEventListener('load', syncBasicHeight);
  window.addEventListener('resize', syncBasicHeight);

  /* 4. LIKE nos comentários (UX sem tracking) */
  // Cache dos botões de like (evita querySelectorAll repetido em click)
  var likeButtons = document.querySelectorAll('.comment-data .buttons like');
  likeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var comment = btn.closest('.comment');
      var likesEl = comment && comment.querySelector('likes');
      if (!likesEl) return;

      var liked = btn.getAttribute('data-liked') === '1';
      var cnt   = parseInt(likesEl.textContent, 10) || 0;

      if (liked) {
        btn.setAttribute('data-liked', '0');
        btn.style.color = '';
        likesEl.textContent = Math.max(0, cnt - 1);
      } else {
        btn.setAttribute('data-liked', '1');
        btn.style.color = '#365899';
        likesEl.textContent = cnt + 1;
      }
    });
  });

})();
