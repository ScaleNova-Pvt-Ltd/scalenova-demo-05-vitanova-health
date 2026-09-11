/**
 * ScaleNova EliteOS — Demo 05: VitaNova Health
 * Calming Physiological Biometric Wave Canvas
 */

export class VitalPulseCanvas {
  constructor(canvasId) {
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

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    this.animate();
  }

  resize() {
    this.width = this.canvas.parentElement.clientWidth || window.innerWidth;
    this.height = this.canvas.parentElement.clientHeight || 440;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const cy = this.height / 2;

    // Background vital grid
    this.ctx.strokeStyle = 'rgba(13, 148, 136, 0.05)';
    this.ctx.lineWidth = 1;
    const gridStep = 32;
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
      { amp: 28, freq: 0.012, speed: 0.03, color: 'rgba(13, 148, 136, 0.4)', width: 1.5 },
      { amp: 45, freq: 0.008, speed: 0.02, color: 'rgba(2, 132, 199, 0.5)', width: 2 },
      { amp: 20, freq: 0.018, speed: 0.04, color: 'rgba(20, 184, 166, 0.3)', width: 1 }
    ];

    waves.forEach((w) => {
      this.ctx.beginPath();
      for (let x = 0; x < this.width; x += 3) {
        let mouseDist = Math.abs(x - this.mouse.x);
        let mouseLift = mouseDist < 100 ? (100 - mouseDist) * 0.25 : 0;
        
        // Periodic ECG heartbeat blip
        const pulseCycle = (this.time * w.speed + x * w.freq) % (Math.PI * 2);
        let ecgSpike = 0;
        if (pulseCycle > 2.8 && pulseCycle < 3.2) {
          ecgSpike = Math.sin((pulseCycle - 2.8) * Math.PI / 0.4) * 35;
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
