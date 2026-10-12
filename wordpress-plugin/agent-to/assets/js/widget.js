(function(){
  var cfg = window.AgentToConfig;
  if (!cfg) return;

  function newId() {
    return 'v_' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now());
  }
  function visitorId() {
    try {
      var key = 'agent_to_visitor_' + location.host;
      var id = localStorage.getItem(key);
      if (!id) { id = newId(); localStorage.setItem(key, id); }
      return id;
    } catch (e) { return newId(); }
  }
  function replyText(data) {
    return data && typeof data.message === 'string' ? data.message :
      (data && data.data && typeof data.data.message === 'string' ? data.data.message : '');
  }
  function initial() {
    var name = (cfg.siteName || cfg.title || 'A').trim();
    return Array.from(name)[0] || 'A';
  }
  function makeBrandAvatar(className) {
    var avatar = document.createElement('span');
    avatar.className = className;
    avatar.setAttribute('aria-label', cfg.siteName || cfg.title || 'لوگوی سایت');
    if (cfg.logoUrl) {
      var img = document.createElement('img');
      img.src = cfg.logoUrl;
      img.alt = cfg.siteName || cfg.title || 'لوگوی سایت';
      img.loading = 'lazy';
      img.addEventListener('error', function() {
        avatar.classList.add('is-fallback');
        avatar.textContent = initial();
      }, { once: true });
      avatar.appendChild(img);
    } else {
      avatar.classList.add('is-fallback');
      avatar.textContent = initial();
    }
    return avatar;
  }
  function init(root) {
    if (root.dataset.ready) return;
    root.dataset.ready = '1';
    root.style.setProperty('--agent-to-color', cfg.color || '#10706B');

    var mode = root.getAttribute('data-agent-to-mode') || 'floating';
    var panel = document.createElement('section');
    panel.className = 'agent-to-panel';
    panel.setAttribute('aria-label', cfg.title || 'گفت‌وگو با سایت');

    var head = document.createElement('div');
    head.className = 'agent-to-head';
    var brand = document.createElement('div');
    brand.className = 'agent-to-brand';
    brand.appendChild(makeBrandAvatar('agent-to-brand-logo'));
    var title = document.createElement('div');
    title.className = 'agent-to-brand-title';
    title.textContent = cfg.title || 'گفت‌وگو با ما';
    brand.appendChild(title);
    head.appendChild(brand);

    var close = null;
    if (mode === 'floating') {
      close = document.createElement('button');
      close.className = 'agent-to-close';
      close.type = 'button';
      close.setAttribute('aria-label', 'بستن پنجره گفتگو');
      close.textContent = '×';
      head.appendChild(close);
    }

    var messages = document.createElement('div');
    messages.className = 'agent-to-messages';
    var form = document.createElement('form');
    form.className = 'agent-to-form';
    var input = document.createElement('input');
    input.className = 'agent-to-input';
    input.type = 'text';
    input.maxLength = 2000;
    input.placeholder = 'پیامت را بنویس…';
    input.setAttribute('aria-label', 'پیام شما');
    input.required = true;

    var send = document.createElement('button');
    send.className = 'agent-to-send';
    send.type = 'submit';
    send.textContent = 'ارسال';

    var error = document.createElement('div');
    error.className = 'agent-to-error';
    error.hidden = true;

    form.appendChild(input);
    form.appendChild(send);
    panel.appendChild(head);
    panel.appendChild(messages);
    panel.appendChild(error);
    panel.appendChild(form);

    function add(text, who) {
      var row = document.createElement('div');
      row.className = 'agent-to-message-row ' + who;
      if (who === 'bot') row.appendChild(makeBrandAvatar('agent-to-message-avatar'));
      var bubble = document.createElement('div');
      bubble.className = 'agent-to-msg ' + who;
      bubble.textContent = text;
      row.appendChild(bubble);
      messages.appendChild(row);
      messages.scrollTop = messages.scrollHeight;
      return bubble;
    }

    add(cfg.welcome || 'سلام! چطور می‌توانم کمکتان کنم؟', 'bot');

    if (mode === 'floating') {
      var launch = document.createElement('button');
      launch.type = 'button';
      launch.className = 'agent-to-launch';
      launch.setAttribute('aria-label', 'باز کردن گفت‌وگو');
      launch.appendChild(makeBrandAvatar('agent-to-launch-logo'));
      var launchText = document.createElement('span');
      launchText.className = 'agent-to-launch-text';
      launchText.textContent = cfg.title || 'گفت‌وگو با ما';
      launch.appendChild(launchText);
      var launchArrow = document.createElement('span');
      launchArrow.className = 'agent-to-launch-arrow';
      launchArrow.setAttribute('aria-hidden', 'true');
      launchArrow.textContent = '↗';
      launch.appendChild(launchArrow);
      launch.addEventListener('click', function() {
        panel.classList.add('is-open');
        launch.hidden = true;
        input.focus();
      });
      close.addEventListener('click', function() {
        panel.classList.remove('is-open');
        launch.hidden = false;
      });
      root.appendChild(panel);
      root.appendChild(launch);
    } else {
      panel.classList.add('is-open');
      root.appendChild(panel);
    }

    form.addEventListener('submit', async function(ev) {
      ev.preventDefault();
      var text = input.value.trim();
      if (!text || send.disabled) return;
      add(text, 'user');
      input.value = '';
      error.hidden = true;
      send.disabled = true;
      send.textContent = '…';
      var waiting = add('در حال دریافت پاسخ…', 'bot');
      try {
        var response = await fetch(cfg.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, visitorId: visitorId() })
        });
        var data = await response.json().catch(function() { return {}; });
        if (!response.ok) throw new Error(data.message || data.code || 'ارسال پیام ناموفق بود.');
        var reply = replyText(data);
        if (!reply) throw new Error('پاسخ متنی از سرور دریافت نشد.');
        waiting.textContent = reply;
      } catch (e) {
        waiting.parentElement.remove();
        error.textContent = e.message || 'ارتباط با سرور برقرار نشد.';
        error.hidden = false;
      } finally {
        send.disabled = false;
        send.textContent = 'ارسال';
        input.focus();
      }
    });
  }

  function boot() { document.querySelectorAll('.agent-to-root').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();