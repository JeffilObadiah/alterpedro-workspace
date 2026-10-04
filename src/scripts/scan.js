// Scan island (vanilla JS). Progressive enhancement only: without this script the form still POSTs to /api/scan/turn.
// All server text is written with textContent (escaped); never innerHTML.
class AlterScan extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('[data-scan-form]');
    if (!this.form) return;
    this.log = this.querySelector('[data-log]');
    this.panel = this.querySelector('[data-panel]');
    this.model = null;
    this.turn = 0;
    this.busy = false;
    this.setAttribute('data-ready', ''); // reveals the chips (CSS keeps them invisible, but space-reserved, until the script has run)
    this.form.addEventListener('submit', (e) => { e.preventDefault(); this.send(false); });
    const dk = document.createElement('button');
    dk.type = 'button'; dk.className = 'btn btn-ghost'; dk.textContent = "I don't know"; dk.style.visibility = 'hidden';
    dk.addEventListener('click', () => this.send(true));
    // The button lives in the reserved stage (not the hero row) so showing it can never move the hero.
    this.log.before(dk);
    this.dk = dk;
    // Example chips: fill the textarea and focus it. Chips are plain buttons in the HTML; no-JS hides them.
    this.form.addEventListener('click', (e) => {
      const chip = e.target.closest && e.target.closest('[data-chip]');
      if (!chip) return;
      const ta = this.form.elements.answer;
      ta.value = chip.dataset.chip;
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    });
  }
  async send(dontKnow) {
    if (this.busy) return;
    const ta = this.form.elements.answer;
    const answer = ta.value.trim();
    if (!dontKnow && !answer) { ta.focus(); return; }
    this.busy = true;
    const start = this.form.querySelector('[data-start]');
    start.disabled = true;
    try {
      const res = await fetch('/api/scan/turn', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: this.model, answer: dontKnow ? '' : answer, turn: this.turn, dont_know: dontKnow }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data && data.error ? String(data.error) : 'error');
      this.model = data.model; this.turn = data.model.turn;
      this.render(data, dontKnow ? "I don't know" : answer);
      ta.value = '';
      this.dk.style.visibility = data.done ? 'hidden' : '';
      // The label stays "Start": swapping it for "Send" changed the button width by 3px and made the hero row wrap (layout shift).
      if (data.done) { ta.disabled = true; this.done = true; } else ta.focus();
    } catch (err) {
      this.showError();
    } finally {
      this.busy = false; start.disabled = !!this.done;
    }
  }
  render(data, said) {
    this.log.hidden = false; this.panel.hidden = false;
    const mk = (cls, text) => { const p = document.createElement('p'); if (cls) p.className = cls; p.textContent = text; return p; };
    this.log.append(mk('secondary small', said), mk('scan-echo', data.echo));
    if (data.question) this.log.append(mk('scan-question', data.question));
    if (data.done) this.log.append(mk('scan-question', "That's enough for me to say something useful."));
    for (const li of this.panel.querySelectorAll('[data-area]')) {
      li.dataset.covered = String(!!(data.model.areas[li.dataset.area] || {}).covered);
    }
    this.dk.style.visibility = data.done ? 'hidden' : '';
  }
  showError() {
    this.log.hidden = false;
    const d = document.createElement('div');
    d.className = 'scan-error'; d.setAttribute('role', 'alert');
    d.textContent = 'Something went wrong on our side. Your text is still in the box. Try again, or book 20 minutes instead.';
    this.log.append(d);
  }
}
customElements.define('alter-scan', AlterScan);
