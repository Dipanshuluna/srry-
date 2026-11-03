export class AudioPlayer {
  constructor(onChange) {
    this.onChange = onChange;
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.audio.preload = 'metadata';
    this.context = null;
    this.analyser = null;
    this.frequencyData = null;
    this.source = null;
    this.url = null;
    this.demo = true;
    this.demoPlaying = false;
    this.autoplayBlocked = false;
    this.listeners = [];
    for (const event of ['timeupdate', 'loadedmetadata', 'play', 'pause', 'ended', 'error']) {
      const fn = () => this.emit(); this.audio.addEventListener(event, fn); this.listeners.push([event, fn]);
    }
  }
  emit() { this.onChange?.({ playing: this.demo ? this.demoPlaying : !this.audio.paused, current: this.audio.currentTime || 0, duration: this.audio.duration || 0, title: this.audio.dataset.title || '', demo: this.demo, autoplayBlocked: this.autoplayBlocked, error: this.audio.error ? 'This audio file could not be played.' : '' }); }
  setup() {
    if (this.context) { if (this.context.state === 'suspended') this.context.resume(); return; }
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.context.createAnalyser(); this.analyser.fftSize = 512; this.analyser.smoothingTimeConstant = .84;
    this.analyser.connect(this.context.destination);
    this.source = this.context.createMediaElementSource(this.audio); this.source.connect(this.analyser);
  }
  async toggle() {
    if (this.demo) { this.demoPlaying = !this.demoPlaying; this.emit(); return; }
    this.setup();
    if (this.audio.paused) {
      try { await this.audio.play(); this.autoplayBlocked = false; }
      catch { this.autoplayBlocked = true; }
    } else this.audio.pause();
    this.emit();
  }
  async loadDefault(url,title) {
    this.demo=false;this.demoPlaying=false;this.autoplayBlocked=false;
    this.audio.volume=.72;this.audio.dataset.title=title;this.audio.src=url;this.audio.load();this.setup();this.emit();
    try { await this.audio.play(); }
    catch { this.autoplayBlocked=true; }
    this.emit();
  }
  load(file) {
    if (!file) return;
    if (!file.type.startsWith('audio/')) { this.onChange?.({ error: 'Choose an audio file such as MP3 or WAV.' }); return; }
    this.demo = false; this.demoPlaying = false; this.autoplayBlocked=false;
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = URL.createObjectURL(file); this.audio.src = this.url; this.audio.dataset.title = file.name.replace(/\.[^.]+$/, '');
    this.audio.load(); this.emit(); this.toggle();
  }
  setVolume(value) { this.audio.volume = value; }
  getData() {
    if (!this.analyser) return null;
    if (!this.frequencyData || this.frequencyData.length !== this.analyser.frequencyBinCount) this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }
  destroy() { this.audio.pause(); this.listeners.forEach(([e, fn]) => this.audio.removeEventListener(e, fn)); if (this.url) URL.revokeObjectURL(this.url); this.source?.disconnect(); this.analyser?.disconnect(); this.context?.close(); }
}
