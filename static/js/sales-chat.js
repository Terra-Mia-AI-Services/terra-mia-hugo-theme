
  (function () {
    var widgets = Array.prototype.slice.call(document.querySelectorAll('[data-safe-chat]'));
    if (!widgets.length) return;

    widgets.forEach(function (widget) {
      var locale = (widget.dataset.locale || 'it').toLowerCase();
      var isEn = locale === 'en';
      var maxChars = Number(widget.dataset.maxChars || 260);
      var contactEmail = widget.dataset.contactEmail || 'terra.mia.ai@gmail.com';
      var copy = isEn ? {
        launch: 'Safe Concierge',
        kicker: 'Rules-only assistant',
        title: 'Terra Mia Safe Concierge',
        close: 'Close',
        inputLabel: 'Ask Terra Mia',
        placeholder: 'Ask about product, pipeline, demos, safety...',
        send: 'Send',
        limit: 'Rules-only chat. Max {max} chars. Do not enter personal data, credentials, tokens, or private business details.',
        guardrails: ['No AI API', 'No secrets', 'No live deploy', 'No stored chat'],
        welcome: 'I can explain Terra Mia, the pipeline, the vertical demos, pricing paths and safety boundaries. I cannot access systems, store data, handle secrets, or trigger deploys.',
        chips: ['What is Terra Mia?', 'Pipeline', 'Hotel demo', 'Pricing paths', 'Safety limits'],
        blocked: 'Safety stop: this public chat cannot handle credentials, personal data, API keys, DNS, live deploys, n8n/Supabase/Cloudflare operations, deletes, or infrastructure actions. Use the contact link for a controlled handoff.',
        tooLong: 'Please keep the message shorter. This chat is intentionally limited to concise product questions.',
        fallback: 'I can stay useful inside the safe scope: product, pipeline, demos, pricing paths, translation, static Hugo build, Cloudflare-ready delivery and next steps.',
        answers: {
          product: 'Terra Mia turns a hospitality brief into a multilingual static site kit: hierarchy, copy, pages, Hugo build artifacts, SEO basics and a review path.',
          pipeline: 'The path is: guided form, business understanding, copy and page structure, IT/EN/DE/FR adaptation, Hugo static build, Cloudflare-ready delivery, then client iteration.',
          demo: 'The demo focuses on three verticals: boutique hotel, restaurant and agritourism. Each should change page set, copy, palette, CTA, language and commercial priority.',
          pricing: 'The public site shows paths, not invented prices: Pilot for validation, Launch for a sellable static site, Automation for partners or repeatable production.',
          safety: 'This widget is local and rules-only: no fetch, no AI API, no WebSocket, no storage, no credentials, no backend. It only renders predefined guidance in the browser.',
          contact: 'For a real review, send an email. Do not paste sensitive details here.'
        }
      } : {
        launch: 'Chiedi a Terra Mia',
        kicker: 'Demo sicura a regole',
        title: 'Cosa fa Terra Mia?',
        close: 'Chiudi',
        inputLabel: 'Chiedi a Terra Mia',
        placeholder: 'Scrivi: cos'ï¿½ Terra Mia? Come funziona? Quanto costa?',
        send: 'Invia',
        limit: 'Max {max} caratteri. Non inserire dati personali, credenziali, token o dettagli riservati.',
        guardrails: ['Risposte controllate', 'Non salva dati', 'Nessun deploy live', 'Nessun segreto'],
        welcome: "Ciao! Sono una guida sicura: ti spiego Terra Mia in parole semplici. Compili un brief, l'AI capisce il business, genera testi e pagine, traduce, costruisce Hugo e prepara una consegna Cloudflare-ready. Scegli una domanda.",
        chips: ["Cos'ï¿½ Terra Mia?", 'Come funziona?', 'Demo hotel', 'Quanto costa?', "ï¿½ sicuro?"],
        blocked: 'Stop di sicurezza: questa chat pubblica non gestisce credenziali, dati personali, API key, DNS, deploy live, operazioni n8n/Supabase/Cloudflare, delete o infrastruttura. Usa il contatto per un passaggio controllato.',
        tooLong: 'Messaggio troppo lungo. Tienilo breve: cosï¿½ posso rispondere meglio.',
        fallback: 'Posso aiutarti su cosa fa Terra Mia, pipeline, demo per hotel/ristoranti/agriturismi, lingue, percorsi commerciali e prossimi passi.',
        answers: {
          product: 'Terra Mia crea siti vetrina per hospitality partendo da un brief: capisce cosa deve vendere il business, organizza pagine e messaggi, genera copy, prepara lingue e produce un sito Hugo statico.',
          pipeline: 'Il percorso ï¿½ semplice: brief guidato, comprensione del business, testi e pagine, traduzione IT/EN/DE/FR, build Hugo, consegna Cloudflare-ready e modifiche richieste dal cliente.',
          demo: 'La demo mostra tre casi: boutique hotel, ristorante e agriturismo. Cambiano layout, pagine, palette, CTA, lingua e prioritï¿½ commerciale: non ï¿½ lo stesso template con parole diverse.',
          pricing: "Per ora ha senso parlare di percorsi: Pilot per validare l'idea, Launch per un sito vetrina completo, Automation per chi vuole scalare produzione e manutenzione.",
          safety: 'ï¿½ sicuro perchï¿½ questa chat ï¿½ statica: non salva messaggi, non accetta segreti, non chiama API e non puï¿½ avviare deploy, DNS, n8n o altre operazioni live.',
          contact: 'Per una revisione vera del tuo caso, scrivi a questa email. Meglio non incollare qui dati sensibili.'
        }
      };

      var toggle = widget.querySelector('[data-chat-toggle]');
      var close = widget.querySelector('[data-chat-close]');
      var panel = widget.querySelector('#tm-safe-chat-panel');
      var log = widget.querySelector('[data-chat-log]');
      var chips = widget.querySelector('[data-chat-chips]');
      var form = widget.querySelector('[data-chat-form]');
      var input = widget.querySelector('[data-chat-input]');
      var launchLabel = widget.querySelector('[data-chat-launch-label]');
      var kicker = widget.querySelector('[data-chat-kicker]');
      var title = widget.querySelector('[data-chat-title]');
      var guardrails = widget.querySelector('[data-chat-guardrails]');
      var inputLabel = widget.querySelector('[data-chat-input-label]');
      var send = widget.querySelector('[data-chat-send]');
      var limit = widget.querySelector('[data-chat-limit]');
      var seeded = false;

      var credentialTerms = ['password', 'token', 'api key', 'apikey', 'secret', 'credential', 'credenzial', 'chiave privata', 'private key', 'bearer', 'pat ', 'ssh', '.env'];
      var personalTerms = ['codice fiscale', 'carta di credito', 'credit card', 'telefono personale', 'indirizzo privato', 'personal address'];
      var opsTerms = ['deploy', 'dns', 'dominio', 'domain', 'cloudflare', 'n8n', 'supabase', 'webhook', 'database', 'server', 'luks', 'infra', 'delete', 'cancella', 'elimina', 'reboot', 'credential rotation'];
      var actionTerms = ['fai', 'esegui', 'avvia', 'attiva', 'collega', 'pubblica', 'modifica', 'cambia', 'ruota', 'mostra', 'dammi', 'manda', 'do ', 'run ', 'start ', 'enable ', 'connect ', 'publish ', 'change ', 'rotate ', 'show ', 'give ', 'delete '];

      function normalizeText(text) {
        return String(text || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\u2019/g, ' ').split(String.fromCharCode(39)).join(' ');
      }

      function hasAny(text, terms) {
        var normalized = normalizeText(text);
        return terms.some(function (term) { return normalized.indexOf(normalizeText(term)) !== -1; });
      }

      function isBlocked(text) {
        return hasAny(text, credentialTerms) || hasAny(text, personalTerms) || (hasAny(text, opsTerms) && hasAny(text, actionTerms));
      }

      function addMessage(kind, text, withContact) {
        var bubble = document.createElement('div');
        bubble.className = 'tm-safe-chat__message tm-safe-chat__message--' + kind;
        bubble.textContent = text;
        if (withContact) {
          bubble.appendChild(document.createTextNode(' '));
          var link = document.createElement('a');
          link.href = 'mailto:' + contactEmail;
          link.textContent = contactEmail;
          bubble.appendChild(link);
        }
        log.appendChild(bubble);
        log.scrollTop = log.scrollHeight;
      }

      function classify(text) {
        if (isBlocked(text)) return 'blocked';
        if (hasAny(text, ['prezzo', 'prezzi', 'costo', 'quanto', 'pricing', 'price', 'cost'])) return 'pricing';
        if (hasAny(text, ['pipeline', 'processo', 'come funziona', 'process', 'hugo', 'build', 'traduzione', 'translate', 'lingue', 'language'])) return 'pipeline';
        if (hasAny(text, ['hotel', 'ristorante', 'restaurant', 'agriturismo', 'demo', 'showcase', 'mini sito', 'mini-site'])) return 'demo';
        if (hasAny(text, ['sicurezza', 'sicuro', 'safe', 'safety', 'limiti', 'guardrail', 'api', 'privacy', 'dati'])) return 'safety';
        if (hasAny(text, ['contatto', 'email', 'scriv', 'call', 'contact', 'next step', 'prossimo'])) return 'contact';
        if (hasAny(text, ['terra mia', 'prodotto', 'cosa fa', 'cos e', 'che cos e', 'product', 'what is', 'servizio'])) return 'product';
        return 'fallback';
      }

      function answerFor(text) {
        var key = classify(text);
        if (key === 'blocked') return { text: copy.blocked, contact: true };
        if (key === 'fallback') return { text: copy.fallback, contact: false };
        return { text: copy.answers[key], contact: key === 'contact' };
      }

      function seed() {
        if (seeded) return;
        seeded = true;
        addMessage('bot', copy.welcome, false);
      }

      function setPanel(open) {
        panel.hidden = !open;
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
          seed();
          window.setTimeout(function () { input.focus(); }, 40);
        }
      }

      if (launchLabel) launchLabel.textContent = copy.launch;
      if (kicker) kicker.textContent = copy.kicker;
      if (title) title.textContent = copy.title;
      if (close) {
        close.textContent = copy.close;
        close.setAttribute('aria-label', copy.close);
      }
      if (inputLabel) inputLabel.textContent = copy.inputLabel;
      if (input) {
        input.placeholder = copy.placeholder;
        input.maxLength = maxChars;
      }
      if (send) send.textContent = copy.send;
      if (limit) limit.textContent = copy.limit.replace('{max}', String(maxChars));
      if (guardrails) {
        guardrails.textContent = '';
        copy.guardrails.forEach(function (item, index) {
          var pill = document.createElement(index === 0 ? 'strong' : 'span');
          pill.textContent = item;
          guardrails.appendChild(pill);
        });
      }
      if (chips) {
        chips.textContent = '';
        copy.chips.forEach(function (label) {
          var chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'tm-safe-chat__chip';
          chip.textContent = label;
          chip.addEventListener('click', function () {
            seed();
            addMessage('user', label, false);
            var response = answerFor(label);
            window.setTimeout(function () { addMessage('bot', response.text, response.contact); }, 120);
          });
          chips.appendChild(chip);
        });
      }

      toggle.addEventListener('click', function () { setPanel(panel.hidden); });
      close.addEventListener('click', function () { setPanel(false); });
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = (input.value || '').trim();
        if (!value) return;
        seed();
        addMessage('user', value.slice(0, maxChars), false);
        input.value = '';
        var response = value.length > maxChars ? { text: copy.tooLong, contact: false } : answerFor(value);
        window.setTimeout(function () { addMessage('bot', response.text, response.contact); }, 140);
      });
    });
  })();
