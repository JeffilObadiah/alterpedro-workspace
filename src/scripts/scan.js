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
    this.form.addEventListener('submit', (e) => { e.preventDefault(); this.send(false); });
    const dk = document.createElement('button');
    dk.type = 'button'; dk.className = 'btn btn-ghost'; dk.textContent = "I don't know"; dk.hidden = true;
    dk.addEventListener('click', () => this.send(true));
    this.form.querySelector('.row').insertBefore(dk, this.form.querySelector('.row a'));
    this.dk = dk;
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
      this.dk.hidden = !!data.done;
      start.textContent = 'Send';
      start.hidden = !!data.done; ta.hidden = !!data.done; this.form.querySelector('label').hidden = !!data.done;
      if (!data.done) ta.focus();
    } catch (err) {
      this.showError();
    } finally {
      this.busy = false; start.disabled = false;
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
    this.dk.hidden = false;
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
