/* ============================================================
   VSX Top500 — скриншот карточки расширения.
   Рисует красивую карточку на canvas (1200×630) и скачивает PNG:
   иконка, название, издатель, место в рейтинге, установки,
   рейтинг, версия и команда установки.
   Работает без библиотек и без отправки данных куда-либо.
   Подключается на страницах с рейтингом: index.html.
   ============================================================ */

(() => {
  "use strict";

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const W = 1200;
  const H = 630;

  const fmt = (n) => {
    if (n == null || isNaN(n)) return "—";
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.?0+$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.?0+$/, "") + "K";
    return String(Math.round(n));
  };

  // Загрузка картинки с fallback (иконки маркетплейса могут не пустить по CORS)
  function loadImage(url) {
    return new Promise((resolve) => {
      if (!url) return resolve(null);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(ctx, text, x, y, maxW, lineH, maxLines) {
    const words = String(text || "").split(/\s+/);
    let line = "";
    let lines = 0;
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        lines++;
        if (lines >= maxLines) {
          ctx.fillText(line + "…", x, y);
          return y + lineH;
        }
        ctx.fillText(line, x, y);
        y += lineH;
        line = w;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, y);
    return y + lineH;
  }

  async function renderCard(e) {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    // Фон
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#12162a");
    bg.addColorStop(0.55, "#0b0d14");
    bg.addColorStop(1, "#131028");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Свечения-орбы
    const glow = (x, y, r, color) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    };
    glow(120, 60, 380, "rgba(124,92,255,0.22)");
    glow(1120, 600, 420, "rgba(34,211,238,0.14)");
    glow(700, -80, 320, "rgba(244,114,182,0.10)");

    // Рамка
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 2;
    roundRect(ctx, 16, 16, W - 32, H - 32, 28);
    ctx.stroke();

    const pad = 64;
    let y = 64;

    // Шапка: логотип сайта
    ctx.font = "700 26px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#7c5cff";
    ctx.fillText("VSX", pad, y + 20);
    const vsxW = ctx.measureText("VSX").width;
    ctx.fillStyle = "#22d3ee";
    ctx.fillText("Top500", pad + vsxW + 4, y + 20);
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(154,161,181,0.9)";
    ctx.font = "500 22px Inter, system-ui, sans-serif";
    const d = new Date();
    ctx.fillText(`${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`, W - pad, y + 20);
    ctx.textAlign = "left";
    y += 72;

    // Иконка расширения (или буква)
    const iconSize = 120;
    const icon = await loadImage(e.icon);
    const ix = pad;
    const iy = y;
    ctx.save();
    roundRect(ctx, ix, iy, iconSize, iconSize, 26);
    ctx.clip();
    if (icon) {
      ctx.drawImage(icon, ix, iy, iconSize, iconSize);
    } else {
      const g = ctx.createLinearGradient(ix, iy, ix + iconSize, iy + iconSize);
      g.addColorStop(0, "#7c5cff");
      g.addColorStop(1, "#22d3ee");
      ctx.fillStyle = g;
      ctx.fillRect(ix, iy, iconSize, iconSize);
      ctx.fillStyle = "#fff";
      ctx.font = "800 64px Inter, system-ui, sans-serif";
      const ch = (e.name || "?").trim().charAt(0).toUpperCase();
      ctx.fillText(ch, ix + iconSize / 2 - ctx.measureText(ch).width / 2, iy + 84);
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    roundRect(ctx, ix, iy, iconSize, iconSize, 26);
    ctx.stroke();

    // Название + издатель
    const tx = ix + iconSize + 28;
    ctx.fillStyle = "#e8eaf2";
    ctx.font = "800 44px Inter, system-ui, sans-serif";
    let name = e.name || "";
    while (ctx.measureText(name).width > W - tx - pad && name.length > 3) name = name.slice(0, -2);
    ctx.fillText(name, tx, iy + 46);

    ctx.font = "600 26px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#9aa1b5";
    const ver = e.verified ? "  ✓" : "";
    ctx.fillText(e.publisher + ver, tx, iy + 88);

    y = iy + iconSize + 40;

    // Описание
    ctx.font = "400 26px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(232,234,242,0.85)";
    y = wrapText(ctx, e.short || "", pad, y, W - pad * 2, 36, 2) + 24;

    // Статистика — карточки
    const stats = [
      { v: "#" + e.rank, l: "место в топе" },
      { v: fmt(e.installs), l: "установок" },
      { v: e.rating ? "★ " + e.rating.toFixed(1) : "★ —", l: `${fmt(e.ratingCount)} оценок` },
      { v: "v" + (e.version || "—"), l: "версия" },
    ];
    const gap = 20;
    const cw = (W - pad * 2 - gap * (stats.length - 1)) / stats.length;
    const ch2 = 120;
    stats.forEach((s, i) => {
      const x = pad + i * (cw + gap);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      roundRect(ctx, x, y, cw, ch2, 18);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.09)";
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, cw, ch2, 18);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = "#e8eaf2";
      ctx.font = "800 34px Inter, system-ui, sans-serif";
      ctx.fillText(s.v, x + cw / 2, y + 52);
      ctx.fillStyle = "#9aa1b5";
      ctx.font = "500 20px Inter, system-ui, sans-serif";
      ctx.fillText(s.l, x + cw / 2, y + 88);
      ctx.textAlign = "left";
    });
    y += ch2 + 30;

    // Команда установки
    const cmd = `code --install-extension ${e.id}`;
    ctx.font = "600 24px 'JetBrains Mono', ui-monospace, monospace";
    const cmdW = Math.min(ctx.measureText(cmd).width + 48, W - pad * 2);
    ctx.fillStyle = "rgba(124,92,255,0.14)";
    roundRect(ctx, pad, y, cmdW, 62, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(124,92,255,0.4)";
    ctx.lineWidth = 2;
    roundRect(ctx, pad, y, cmdW, 62, 14);
    ctx.stroke();
    ctx.fillStyle = "#c4b5ff";
    let cmdText = cmd;
    while (ctx.measureText(cmdText).width > cmdW - 48 && cmdText.length > 8) cmdText = cmdText.slice(0, -2);
    ctx.fillText(cmdText, pad + 24, y + 40);

    return canvas;
  }

  async function download(e) {
    const canvas = await renderCard(e);
    const a = document.createElement("a");
    a.download = `${e.id}-vsx.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  window.VSXShot = { renderCard, download };
})();
