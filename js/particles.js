/* js/particles.js — 樱花粒子引擎 */

console.log('[particles] loading...');
const ParticleEngine = (() => {
  console.log('[particles] IIFE running, defining engine');
  let canvas, ctx;
  let particles = [];
  let animationId = null;
  let isRunning = false;
  let mouseX = -1000, mouseY = -1000;
  let bloomMultiplier = 1;
  let isMidnight = false;

  // 配置
  const CONFIG = {
    baseCount: 60,
    bloomCount: 180,
    gravity: 0.03,
    windBase: 0.3,
    windVariation: 0.15,
    sizeMin: 6,
    sizeMax: 14,
    rotationSpeed: 0.01,
    swayAmplitude: 0.5,
    swayFrequency: 0.02,
    mouseRadius: 120,
    mouseForce: 2,
  };

  // 樱花花瓣颜色（日间）
  const DAY_COLORS = [
    { fill: '#f2a6a6', stroke: '#e8738a' },
    { fill: '#f2d5d5', stroke: '#e8a0a0' },
    { fill: '#fff5f5', stroke: '#f2d5d5' },
    { fill: '#fce4e4', stroke: '#f2b5b5' },
    { fill: '#ffcdd2', stroke: '#ef9a9a' },
  ];

  // 月光银白颜色（午夜）
  const NIGHT_COLORS = [
    { fill: '#e8eaf6', stroke: '#c5cae9' },
    { fill: '#f3e5f5', stroke: '#ce93d8' },
    { fill: '#e0f2f1', stroke: '#80cbc4' },
    { fill: '#e8eaf6', stroke: '#9fa8da' },
    { fill: '#fce4ec', stroke: '#f48fb1' },
  ];

  function getColors() {
    return isMidnight ? NIGHT_COLORS : DAY_COLORS;
  }

  // 花瓣粒子
  class Petal {
    constructor() {
      this.reset();
    }

    reset() {
      const colors = getColors();
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.x = Math.random() * canvas.width;
      this.y = -20 - Math.random() * 100;
      this.size = CONFIG.sizeMin + Math.random() * (CONFIG.sizeMax - CONFIG.sizeMin);
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * CONFIG.rotationSpeed * 2;
      this.swayOffset = Math.random() * Math.PI * 2;
      this.swaySpeed = CONFIG.swayFrequency * (0.5 + Math.random());
      this.opacity = 0.6 + Math.random() * 0.4;
      this.fillColor = color.fill;
      this.strokeColor = color.stroke;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = CONFIG.gravity * (0.5 + Math.random());
    }

    update(now) {
      const wind = CONFIG.windBase + Math.sin(now * 0.001) * CONFIG.windVariation;
      this.vx += (wind - this.vx) * 0.01;
      this.vy += CONFIG.gravity;

      // 鼠标避让
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONFIG.mouseRadius) {
        const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius * CONFIG.mouseForce;
        this.vx += (dx / dist) * force * 0.1;
        this.vy += (dy / dist) * force * 0.1;
      }

      // 摇摆
      this.vx += Math.sin(now * this.swaySpeed + this.swayOffset) * CONFIG.swayAmplitude * 0.01;

      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;

      // 超出边界重置
      if (this.y > canvas.height + 20 || this.x < -40 || this.x > canvas.width + 40) {
        this.reset();
        this.y = -20 - Math.random() * 50;
        this.x = Math.random() * canvas.width;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      // 绘制花瓣（5个椭圆弧组成花瓣形状）
      ctx.beginPath();
      const s = this.size;
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s * 0.5, -s * 0.4, s * 0.8, -s * 0.1, s * 0.5, s * 0.3);
      ctx.bezierCurveTo(s * 0.2, s * 0.5, -s * 0.2, s * 0.5, -s * 0.5, s * 0.3);
      ctx.bezierCurveTo(-s * 0.8, -s * 0.1, -s * 0.5, -s * 0.4, 0, 0);

      ctx.fillStyle = this.fillColor;
      ctx.fill();
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
    }
  }

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);

    // 鼠标追踪
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => {
      mouseX = -1000;
      mouseY = -1000;
    });

    // 移动端触摸
    canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      mouseX = touch.clientX - rect.left;
      mouseY = touch.clientY - rect.top;
    }, { passive: true });
    canvas.addEventListener('touchend', () => {
      mouseX = -1000;
      mouseY = -1000;
    });

    // 初始化粒子池
    const isMobile = window.innerWidth < 768 || ('ontouchstart' in window);
    const effectiveBase = isMobile ? Math.floor(CONFIG.baseCount * 0.4) : CONFIG.baseCount;

    const count = Math.floor(effectiveBase * bloomMultiplier);
    particles = [];
    for (let i = 0; i < count; i++) {
      const p = new Petal();
      // 分散初始位置
      p.y = Math.random() * canvas.height;
      p.x = Math.random() * canvas.width;
      particles.push(p);
    }
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function animate() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();

    for (const p of particles) {
      p.update(now);
      p.draw(ctx);
    }

    animationId = requestAnimationFrame(animate);
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    animate();
  }

  function stop() {
    isRunning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // 彩蛋 A：樱花绽放
  function setBloom(active) {
    if (active) {
      bloomMultiplier = 3;
      const targetCount = CONFIG.bloomCount;
      while (particles.length < targetCount) {
        const p = new Petal();
        p.y = Math.random() * canvas.height;
        particles.push(p);
      }
      // 10 秒后恢复
      setTimeout(() => {
        setBloom(false);
      }, 10000);
    } else {
      bloomMultiplier = 1;
      const targetCount = CONFIG.baseCount;
      while (particles.length > targetCount) {
        particles.pop();
      }
    }
  }

  // 彩蛋 B：午夜模式
  function setMidnight(active) {
    isMidnight = active;
    // 重置所有花瓣颜色
    for (const p of particles) {
      const colors = getColors();
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.fillColor = color.fill;
      p.strokeColor = color.stroke;
    }
  }

  console.log('[particles] engine ready');
  return { init, start, stop, setBloom, setMidnight };
})();
