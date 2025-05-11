const canvas = document.getElementById('circleCanvas');
const ctx = canvas.getContext('2d');

const R = 180;
const padding = 60;
const cy = canvas.height / 2;
const cx1 = padding + R;
const cx2 = canvas.width - padding - R;

let dragging = false;
let phi1 = 0;

function interpolateColor(val) {
  const blue = [69, 117, 180];
  const white = [255, 255, 255];
  const red = [215, 48, 39];

  let result = [0, 0, 0];
  if (val < 0) {
    const t = (val + 1) / 1;
    for (let i = 0; i < 3; i++) result[i] = Math.round(blue[i] * (1 - t) + white[i] * t);
  } else {
    const t = val / 1;
    for (let i = 0; i < 3; i++) result[i] = Math.round(white[i] * (1 - t) + red[i] * t);
  }
  return `rgb(${result[0]},${result[1]},${result[2]})`;
}

function drawCircle(cx, title, isSum) {
  ctx.beginPath();
  ctx.moveTo(cx - R - 20, cy);
  ctx.lineTo(cx + R + 20, cy);
  ctx.moveTo(cx, cy - R - 20);
  ctx.lineTo(cx, cy + R + 20);
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.stroke();

  const segments = 180;
  for (let i = 0; i < segments; i++) {
    const phi2_start = (i * 2 * Math.PI) / segments;
    const phi2_end = ((i + 1) * 2 * Math.PI) / segments;
    const phi2_mid = (phi2_start + phi2_end) / 2;
    const cos_val = Math.cos(isSum ? (phi1 + phi2_mid) : (phi1 - phi2_mid));
    const color = interpolateColor(cos_val);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, phi2_start, phi2_end, false);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  const x = cx + R * Math.cos(phi1);
  const y = cy + R * Math.sin(phi1);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(x, y);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = 'black';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, cx, cy - R - 30);
}

function drawColorBar() {
  const x = 480, y = 50, w = 20, h = 400;
  const steps = 100;
  for (let i = 0; i < steps; i++) {
    const frac = i / (steps - 1);
    const cos_val = 1 - 2 * frac;
    ctx.fillStyle = interpolateColor(cos_val);
    ctx.fillRect(x, y + i * (h / steps), w, h / steps);
  }
  ctx.strokeStyle = 'black';
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = 'black';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('1.0', x + 25, y + 5);
  ctx.fillText('0.0', x + 25, y + h / 2 + 5);
  ctx.fillText('-1.0', x + 25, y + h - 2);
  ctx.fillText('cos(φ₁ ± φ₂)', x - 10, y - 10);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCircle(cx1, 'cos(φ₁ + φ₂)', true);
  drawCircle(cx2, 'cos(φ₁ - φ₂)', false);
  drawColorBar();

  ctx.fillStyle = 'black';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`ϕ₁ = ${-(phi1 * 180 / Math.PI).toFixed(1)}°`, 20, 30);
}

function getAngle(x, y, cx) {
  return Math.atan2(y - cy, x - cx);
}

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  if (Math.abs(my - cy) < R + 30) dragging = true;
  if (mx < canvas.width / 2) {
    phi1 = getAngle(mx, my, cx1);
  } else {
    phi1 = getAngle(mx, my, cx2);
  }
  draw();
});

canvas.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  if (mx < canvas.width / 2) {
    phi1 = getAngle(mx, my, cx1);
  } else {
    phi1 = getAngle(mx, my, cx2);
  }
  draw();
});

canvas.addEventListener('mouseup', () => dragging = false);
canvas.addEventListener('mouseleave', () => dragging = false);

draw();
