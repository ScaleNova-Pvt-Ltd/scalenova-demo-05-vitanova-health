/**
 * ScaleNova EliteOS — Demo 05: VitaNova Health
 * Calming Physiological Biometric Wave Canvas (60fps Ambient Background)
 */

class VitalPulseCanvas {
  constructor(canvasId = 'biometric-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.time = 0;
    this.mouse = { x: -1000, y: -1000 };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * (window.devicePixelRatio || 1);
    this.canvas.height = this.height * (window.devicePixelRatio || 1);
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const cy = this.height * 0.45;

    // Background vital grid (very subtle sage/teal grid)
    this.ctx.strokeStyle = 'rgba(13, 148, 136, 0.035)';
    this.ctx.lineWidth = 1;
    const gridStep = 48;
    for (let x = 0; x < this.width; x += gridStep) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridStep) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // 3 layered physiological sine rhythms
    const waves = [
      { amp: 32, freq: 0.009, speed: 0.025, color: 'rgba(13, 148, 136, 0.22)', width: 1.5 },
      { amp: 48, freq: 0.006, speed: 0.018, color: 'rgba(2, 132, 199, 0.28)', width: 2 },
      { amp: 24, freq: 0.014, speed: 0.032, color: 'rgba(20, 184, 166, 0.18)', width: 1 }
    ];

    waves.forEach((w) => {
      this.ctx.beginPath();
      for (let x = 0; x < this.width; x += 4) {
        let mouseDist = Math.abs(x - this.mouse.x);
        let mouseLift = mouseDist < 140 ? (140 - mouseDist) * 0.2 : 0;
        
        // Periodic ECG heartbeat blip
        const pulseCycle = (this.time * w.speed + x * w.freq) % (Math.PI * 2);
        let ecgSpike = 0;
        if (pulseCycle > 2.8 && pulseCycle < 3.2) {
          ecgSpike = Math.sin((pulseCycle - 2.8) * Math.PI / 0.4) * 36;
        }

        const y = cy + Math.sin(this.time * w.speed + x * w.freq) * w.amp - ecgSpike - mouseLift;
        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.strokeStyle = w.color;
      this.ctx.lineWidth = w.width;
      this.ctx.stroke();
    });
  }

  animate() {
    this.time += 1;
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Global auto-init
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('biometric-canvas')) {
    window.vitalPulse = new VitalPulseCanvas('biometric-canvas');
  } else if (document.getElementById('vitalPulseCanvas')) {
    window.vitalPulse = new VitalPulseCanvas('vitalPulseCanvas');
  }
});

if (typeof window !== 'undefined') {
  window.VitalPulseCanvas = VitalPulseCanvas;
}
