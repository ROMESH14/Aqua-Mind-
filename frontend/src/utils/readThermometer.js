function analogTempFromImageData(data, width, height) {
  const y1 = Math.floor(height * 0.12);
  const y2 = Math.ceil(height * 0.90);
  const x1 = Math.floor(width * 0.30);
  const x2 = Math.ceil(width * 0.70);
  const roiW = x2 - x1;
  const roiH = y2 - y1;
  const colHits = new Array(roiW).fill(0);
  const rowLiquid = new Array(roiH).fill(false);
  const contrast = new Array(roiH).fill(0);

  for (let y = 0; y < roiH; y += 1) {
    let sum = 0;
    let sumSq = 0;
    for (let x = 0; x < roiW; x += 1) {
      const i = ((y + y1) * width + (x + x1)) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = (r + g + b) / 3;
      sum += gray;
      sumSq += gray * gray;
      const red = r > 125 && r > g + 20 && r > b + 20;
      const blue = b > 110 && b > r + 18 && b > g + 8 && r < 140;
      if (red || blue) {
        colHits[x] += 1;
        rowLiquid[y] = true;
      }
    }
    const mean = roiW ? sum / roiW : 0;
    contrast[y] = roiW ? Math.sqrt(Math.max(0, sumSq / roiW - mean * mean)) : 0;
  }

  let peak = 0;
  for (let x = 1; x < roiW; x += 1) {
    if (colHits[x] > colHits[peak]) peak = x;
  }
  const band = Math.max(3, Math.floor(roiW * 0.08));
  const liquidRows = [];
  for (let y = 0; y < roiH; y += 1) {
    let hit = false;
    for (let x = Math.max(0, peak - band); x <= Math.min(roiW - 1, peak + band); x += 1) {
      const i = ((y + y1) * width + (x + x1)) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if ((r > 125 && r > g + 20 && r > b + 20) || (b > 110 && b > r + 18 && b > g + 8 && r < 140)) {
        hit = true;
        break;
      }
    }
    if (hit) liquidRows.push(y);
  }

  if (liquidRows.length < 8) return null;
  if (liquidRows[liquidRows.length - 1] - liquidRows[0] < roiH * 0.18) return null;

  let top = roiH;
  let bottom = 0;
  for (let y = 0; y < roiH; y += 1) {
    if (contrast[y] > 10) {
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
  if (bottom - top < 10) {
    top = roiH;
    bottom = 0;
    for (let y = 0; y < roiH; y += 1) {
      if (contrast[y] > 6 || rowLiquid[y]) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  const span = Math.max(bottom - top, 1);
  const value = ((bottom - liquidRows[0]) / span) * 50;
  if (value < 5 || value > 42) return null;
  return Math.round(value * 10) / 10;
}

export function readThermometerFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 700 / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const temperature = analogTempFromImageData(data, width, height);
      if (temperature == null) {
        reject(new Error('Could not read a temperature. Type the number you see into Temp °C.'));
        return;
      }
      resolve({ temperature, note: `Read ${temperature}°C from the thermometer photo.` });
    };
    img.onerror = () => reject(new Error('Could not read that image'));
    img.src = dataUrl;
  });
}
