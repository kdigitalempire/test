/*
  Kanubeen Construction - Core interactions
  - Accessible dropdown for Projects (hover desktop, tap/click mobile)
  - Keyboard controls and visible focus management
  - Projects filters (chips)
  - Project details modal (Esc and overlay close, focus restoration)
  - WebP/PNG placeholders generated locally via Canvas
  - SVG bar chart for Turnover with reveal animation
*/

(function () {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initHeaderMenu();
    initFeatureHover();
    initProjectsFilters();
    initProjectModals();
    initGeneratedPlaceholders();
    initTurnoverChart();
    initOrgChart();
  });

  function initHeaderMenu() {
    const burger = document.querySelector('[data-burger]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    const mobileOverlay = document.querySelector('[data-mobile-overlay]');
    const dropdown = document.querySelector('[data-dropdown]');
    const dropdownButton = dropdown ? dropdown.querySelector('[data-dropdown-button]') : null;
    const dropdownPanel = dropdown ? dropdown.querySelector('[data-dropdown-panel]') : null;

    // Mobile burger toggle
    if (burger && mobileMenu) {
      burger.addEventListener('click', () => {
        const expanded = burger.getAttribute('aria-expanded') === 'true';
        burger.setAttribute('aria-expanded', String(!expanded));
        mobileMenu.hidden = expanded;
        document.body.classList.toggle('mobile-open', !expanded);
      });
    }

    if (mobileOverlay && burger && mobileMenu) {
      mobileOverlay.addEventListener('click', () => {
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.hidden = true;
        document.body.classList.remove('mobile-open');
      });
    }

    // Dropdown open/close
    if (dropdown && dropdownButton && dropdownPanel) {
      const open = () => dropdown.setAttribute('aria-expanded', 'true');
      const close = () => dropdown.setAttribute('aria-expanded', 'false');

      dropdownButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const expanded = dropdown.getAttribute('aria-expanded') === 'true';
        dropdown.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        if (!expanded) {
          const first = dropdownPanel.querySelector('a');
          first && first.focus();
        }
      });

      // Hover open on desktop
      let hoverTimer;
      dropdown.addEventListener('mouseenter', () => { clearTimeout(hoverTimer); open(); });
      dropdown.addEventListener('mouseleave', () => { hoverTimer = setTimeout(close, 80); });

      // Keyboard nav in dropdown
      dropdown.addEventListener('keydown', (e) => {
        const items = Array.from(dropdownPanel.querySelectorAll('a'));
        const currentIndex = items.indexOf(document.activeElement);
        if (e.key === 'Escape') {
          close(); dropdownButton.focus();
        } else if ((e.key === 'ArrowDown' || e.key === 'Down') && items.length) {
          e.preventDefault();
          const next = items[(currentIndex + 1 + items.length) % items.length];
          (next || items[0]).focus();
        } else if ((e.key === 'ArrowUp' || e.key === 'Up') && items.length) {
          e.preventDefault();
          const prev = items[(currentIndex - 1 + items.length) % items.length];
          (prev || items[items.length - 1]).focus();
        }
      });

      // Global click/Esc to close
      document.addEventListener('click', (e) => { if (!dropdown.contains(e.target)) close(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    }
  }

  function initFeatureHover() {
    document.querySelectorAll('.feature-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    });
  }

  function initProjectsFilters() {
    const chips = document.querySelectorAll('[data-filter-chip]');
    const cards = document.querySelectorAll('[data-project-card]');
    if (!chips.length || !cards.length) return;

    const apply = (filter) => {
      cards.forEach((card) => {
        const cat = card.getAttribute('data-category');
        const show = filter === 'all' || cat === filter;
        card.hidden = !show;
      });
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
        chip.setAttribute('aria-pressed', 'true');
        apply(chip.getAttribute('data-filter'));
      });
      chip.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.click(); }
      });
    });

    // Optional: pre-select from URL hash (?cat=bridges)
    const url = new URL(window.location.href);
    const cat = (url.searchParams.get('cat') || 'all').toLowerCase();
    const target = Array.from(chips).find(c => c.getAttribute('data-filter') === cat) || chips[0];
    target && target.click();
  }

  function initProjectModals() {
    const cards = document.querySelectorAll('[data-project-card]');
    const backdrop = document.querySelector('[data-modal-backdrop]');
    const modal = document.querySelector('[data-modal]');
    if (!cards.length || !backdrop || !modal) return;

    const modalTitle = modal.querySelector('[data-modal-title]');
    const modalBody = modal.querySelector('[data-modal-body]');
    const closeBtn = modal.querySelector('[data-modal-close]');
    let lastFocused = null;

    const open = (title, desc) => {
      lastFocused = document.activeElement;
      modalTitle.textContent = title;
      modalBody.textContent = desc;
      backdrop.setAttribute('aria-hidden', 'false');
      closeBtn.focus();
    };
    const close = () => {
      backdrop.setAttribute('aria-hidden', 'true');
      lastFocused && lastFocused.focus();
    };

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const name = card.querySelector('.name')?.textContent?.trim() || 'Project';
        const blurb = card.querySelector('.blurb')?.textContent?.trim() || '';
        open(name, blurb);
      });
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } });
    });

    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  function initGeneratedPlaceholders() {
    const targets = document.querySelectorAll('img[data-placeholder]');
    if (!targets.length) return;

    targets.forEach((img, index) => {
      const type = img.getAttribute('data-placeholder');
      const w = Number(img.getAttribute('data-w') || 640);
      const h = Number(img.getAttribute('data-h') || 360);
      const text = img.getAttribute('data-text') || (type === 'equipment' ? 'EQUIPMENT' : 'PROJECT');
      const url = generateWebpPlaceholder(w, h, text, index);
      img.src = url;
      img.alt = img.alt || text + ' placeholder';
    });
  }

  function generateWebpPlaceholder(width, height, text, seed) {
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Electric blue/cyan gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, 'rgba(0,234,255,0.88)');
    grad.addColorStop(1, 'rgba(0,163,255,0.88)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height);

    // Hex grid pattern
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    const size = 22; const hStep = size * Math.sqrt(3);
    for (let y = 0; y < height + size; y += size * 1.5) {
      for (let x = 0; x < width + hStep; x += hStep) {
        drawHex(ctx, x + ((y / (size * 1.5)) % 2 ? hStep / 2 : 0), y, size * 0.5);
      }
    }

    ctx.font = `${Math.max(16, Math.round(width / 18))}px Poppins, Inter, sans-serif`;
    ctx.fillStyle = 'rgba(8,10,14,0.6)';
    ctx.fillRect(0, height - 48, width, 48);
    ctx.fillStyle = '#e6f1ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height - 24);

    try { return canvas.toDataURL('image/webp'); } catch (e) { return canvas.toDataURL('image/png'); }
  }

  function drawHex(ctx, cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
  }

  function initTurnoverChart() {
    const chartEl = document.querySelector('[data-chart]');
    if (!chartEl) return;

    // Match the reference chart (Million Naira)
    const data = [
      { year: 2015, value: 10000 },
      { year: 2016, value: 10000 },
      { year: 2017, value: 8000 },
      { year: 2018, value: 9000 },
      { year: 2019, value: 16000 },
      { year: 2020, value: 22000 }
    ];

    const width = chartEl.clientWidth;
    const height = 320;
    const margin = { top: 18, right: 12, bottom: 30, left: 56 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    // Neat axis: 0 - 26,000 in steps of 2,000
    const yMax = 26000;
    const yStep = 2000;
    const xStep = innerW / data.length;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const defs = document.createElementNS(svgNS, 'defs');
    const grad = document.createElementNS(svgNS, 'linearGradient');
    grad.setAttribute('id', 'gradBar'); grad.setAttribute('x1', '0%'); grad.setAttribute('x2', '0%'); grad.setAttribute('y1', '100%'); grad.setAttribute('y2', '0%');
    const stop1 = document.createElementNS(svgNS, 'stop'); stop1.setAttribute('offset', '0%'); stop1.setAttribute('stop-color', 'rgba(0,234,255,0.6)');
    const stop2 = document.createElementNS(svgNS, 'stop'); stop2.setAttribute('offset', '100%'); stop2.setAttribute('stop-color', 'rgba(0,163,255,0.7)');
    grad.append(stop1, stop2); defs.appendChild(grad); svg.appendChild(defs);

    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
    svg.appendChild(g);

    data.forEach((d, i) => {
      const x = i * xStep + xStep * 0.1;
      const w = xStep * 0.8;
      const h = Math.max(1, (d.value / yMax) * innerH);
      const y = innerH - h;

      const bar = document.createElementNS(svgNS, 'rect');
      bar.setAttribute('class', 'bar');
      bar.setAttribute('x', x);
      bar.setAttribute('width', w);
      bar.setAttribute('y', innerH);
      bar.setAttribute('height', 0);
      bar.setAttribute('rx', '8');
      bar.setAttribute('fill', 'url(#gradBar)');

      const title = document.createElementNS(svgNS, 'title');
      title.textContent = `${d.year}: ${formatNumber(d.value)}M`;
      bar.appendChild(title);
      g.appendChild(bar);

      if (!isReducedMotion) {
        requestAnimationFrame(() => { bar.setAttribute('y', y); bar.setAttribute('height', h); });
      } else { bar.setAttribute('y', y); bar.setAttribute('height', h); }

      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', x + w / 2); label.setAttribute('y', innerH + 22); label.setAttribute('fill', '#0c1220'); label.setAttribute('text-anchor', 'middle'); label.setAttribute('font-size', '12');
      label.textContent = d.year; g.appendChild(label);
    });

    for (let val = 0; val <= yMax; val += yStep) {
      const y = innerH - (val / yMax) * innerH;
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', 0); line.setAttribute('x2', innerW); line.setAttribute('y1', y); line.setAttribute('y2', y); line.setAttribute('stroke', 'rgba(15,23,42,0.18)'); line.setAttribute('stroke-dasharray', '4 6'); g.appendChild(line);
      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', -10); label.setAttribute('y', y - 2); label.setAttribute('fill', '#0c1220'); label.setAttribute('text-anchor', 'end'); label.setAttribute('font-size', '11'); label.textContent = formatNumber(val); g.appendChild(label);
    }

    chartEl.innerHTML = ''; chartEl.appendChild(svg);

    function formatNumber(n) { try { return Number(n).toLocaleString('en-US'); } catch { return String(n); } }
  }

  // Interactive Mermaid-like flow chart (client-only, no external deps)
  function initOrgChart() {
    const mount = document.querySelector('[data-org-chart]');
    if (!mount) return;

    // Render into SVG with pan/zoom
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 1600 900');

    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('x', 0); bg.setAttribute('y', 0); bg.setAttribute('width', '1600'); bg.setAttribute('height', '900');
    bg.setAttribute('fill', 'url(#orgGrid)');

    const defs = document.createElementNS(svgNS, 'defs');
    // Grid
    const pattern = document.createElementNS(svgNS, 'pattern');
    pattern.setAttribute('id', 'p'); pattern.setAttribute('width', '40'); pattern.setAttribute('height', '40'); pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    const ppath = document.createElementNS(svgNS, 'path');
    ppath.setAttribute('d', 'M40 0 H0 V40'); ppath.setAttribute('fill', 'none'); ppath.setAttribute('stroke', 'rgba(15,23,42,0.15)'); ppath.setAttribute('stroke-width', '1');
    pattern.appendChild(ppath);
    const grid = document.createElementNS(svgNS, 'pattern');
    grid.setAttribute('id', 'orgGrid'); grid.setAttribute('width', '1600'); grid.setAttribute('height', '900'); grid.setAttribute('patternUnits', 'userSpaceOnUse');
    const rect = document.createElementNS(svgNS, 'rect'); rect.setAttribute('width', '1600'); rect.setAttribute('height', '900'); rect.setAttribute('fill', 'url(#p)'); grid.appendChild(rect);
    defs.append(pattern, grid);

    // Node style
    const nodeFill = '#ffffff';
    const nodeStroke = 'rgba(0,119,255,0.45)';
    const linkStroke = 'rgba(15,23,42,0.4)';

    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('transform', 'translate(60,60)');

    svg.append(defs, bg, g);
    mount.innerHTML = '';
    mount.appendChild(svg);

    const NODE_W = 220, NODE_H = 56, H_GAP = 80, V_GAP = 100;

    const tree = {
      id: 'BoD', label: 'Board of Directors', children: [
        { id: 'Chairman', label: 'Chairman', children: [
          { id: 'ExecVice', label: 'Executive Vice', children: [
            { id: 'MD', label: 'Managing Director', children: [
              { id: 'DMD', label: 'Deputy MD', children: [
                { id: 'ConstrMgr', label: 'Construction Manager', children: [
                  { id: 'ProjMgrs', label: 'Project Managers', children: [
                    { id: 'ProjEng', label: 'Project Engineers' }
                  ]}
                ]},
                { id: 'SafetyMgr', label: 'Safety Manager', children: [
                  { id: 'SeniorSafety', label: 'Senior Safety', children: [
                    { id: 'SafetyOff', label: 'Safety Officers' }
                  ]}
                ]}
              ]},
              { id: 'CD', label: 'Contracts Director', children: [
                { id: 'CntrMgr', label: 'Contract Manager' },
                { id: 'BizDev', label: 'Business Devp.' },
                { id: 'QC', label: 'Q.C. Manager', children: [ { id: 'CostControl', label: 'Cost Control' } ] },
                { id: 'DesignEng', label: 'Design Engineer' },
                { id: 'TenderEng', label: 'Tendering Engineer' }
              ]},
              { id: 'PD', label: 'Plant Director', children: [
                { id: 'PlantMgr', label: 'Plant Manager', children: [
                  { id: 'AsstPlantMgr', label: 'Ass. Plant Manager', children: [
                    { id: 'PlantEng', label: 'Plant Engineers' }
                  ]}
                ]}
              ]},
              { id: 'DFA', label: 'Director Fin. & Admin.', children: [
                { id: 'ProcMgr', label: 'Procurement Manager', children: [
                  { id: 'Overseas', label: 'Overseas Procurement', children: [
                    { id: 'LocalProc', label: 'Local Procurement' }
                  ]}
                ]},
                { id: 'AuditMgr', label: 'Audit Manager' },
                { id: 'FinMgr', label: 'Finance Manager' },
                { id: 'AdminMgr', label: 'Admin. Manager' }
              ]},
              { id: 'DC', label: 'Director Corp.', children: [
                { id: 'PRMgr', label: 'P.R. Manager', children: [
                  { id: 'PROff', label: 'P.R. Officer', children: [
                    { id: 'LegalOff', label: 'Legal Officer' }
                  ]}
                ]}
              ]}
            ]}
          ]}
        ]}
      ]
    };

    // Measure subtree widths (tidy tree layout)
    function measure(node) {
      if (!node.children || !node.children.length) { node._w = NODE_W; return node._w; }
      let w = 0; node.children.forEach((c, i) => { const sw = measure(c); w += sw; if (i) w += H_GAP; });
      node._w = Math.max(NODE_W, w); return node._w;
    }
    measure(tree);

    // Assign positions
    function layout(node, x, y) {
      node.x = x + node._w / 2 - NODE_W / 2; node.y = y;
      if (!node.children || !node.children.length) return;
      let cx = x; const nextY = y + NODE_H + V_GAP;
      node.children.forEach((c) => {
        layout(c, cx, nextY);
        cx += c._w + H_GAP;
      });
    }
    layout(tree, 0, 0);

    // Draw links (orthogonal)
    function drawLinks(node) {
      if (!node.children || !node.children.length) return;
      node.children.forEach((c) => {
        const sx = node.x + NODE_W / 2, sy = node.y + NODE_H;
        const tx = c.x + NODE_W / 2, ty = c.y;
        const my = sy + V_GAP / 2;
        const d = `M ${sx} ${sy} L ${sx} ${my} L ${tx} ${my} L ${tx} ${ty}`;
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', d); path.setAttribute('fill', 'none'); path.setAttribute('stroke', linkStroke); path.setAttribute('stroke-width', '2'); path.setAttribute('stroke-linejoin', 'round'); path.setAttribute('stroke-linecap', 'round');
        g.appendChild(path);
        drawLinks(c);
      });
    }
    drawLinks(tree);

    // Draw nodes
    function drawNodes(node) {
      const group = document.createElementNS(svgNS, 'g');
      group.setAttribute('transform', `translate(${node.x},${node.y})`);
      const r = document.createElementNS(svgNS, 'rect');
      r.setAttribute('x', 0); r.setAttribute('y', 0); r.setAttribute('rx', 10); r.setAttribute('ry', 10);
      r.setAttribute('width', NODE_W); r.setAttribute('height', NODE_H);
      r.setAttribute('fill', nodeFill); r.setAttribute('stroke', nodeStroke); r.setAttribute('stroke-width', '1.5');
      const t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', NODE_W/2); t.setAttribute('y', NODE_H/2 + 6); t.setAttribute('text-anchor', 'middle'); t.setAttribute('fill', '#0c1220'); t.setAttribute('font-size', '14'); t.setAttribute('font-family', 'Inter, Poppins, sans-serif'); t.textContent = node.label;
      group.append(r, t); g.appendChild(group);
      (node.children||[]).forEach(drawNodes);
    }
    drawNodes(tree);

    // Pan/Zoom
    let scale = 1;
    let tx = 0, ty = 0;
    function applyTransform() { g.setAttribute('transform', `translate(${tx},${ty}) scale(${scale})`); }
    function clamp(val, min, max){ return Math.max(min, Math.min(max, val)); }

    // Center the diagram within the mount at current scale (default for reset)
    function center() {
      const bbox = g.getBBox();
      const vw = mount.clientWidth || 0;
      const vh = mount.clientHeight || 0;
      // Keep scale as is; compute translation to center bbox
      tx = (vw - bbox.width * scale) / 2 - bbox.x * scale;
      ty = (vh - bbox.height * scale) / 2 - bbox.y * scale;
      applyTransform();
    }

    mount.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = -e.deltaY; const factor = delta > 0 ? 1.1 : 0.9;
      scale = clamp(scale * factor, 0.4, 2.5);
      center();
    }, { passive: false });

    let dragging = false, lx = 0, ly = 0;
    mount.addEventListener('pointerdown', (e) => { dragging = true; lx = e.clientX; ly = e.clientY; mount.setPointerCapture(e.pointerId); });
    mount.addEventListener('pointermove', (e) => { if (!dragging) return; tx += (e.clientX - lx); ty += (e.clientY - ly); lx = e.clientX; ly = e.clientY; applyTransform(); });
    mount.addEventListener('pointerup', () => { dragging = false; });

    const zi = document.querySelector('[data-zoom-in]');
    const zo = document.querySelector('[data-zoom-out]');
    const zr = document.querySelector('[data-zoom-reset]');
    zi && zi.addEventListener('click', ()=>{ scale = clamp(scale*1.2, 0.4, 2.5); center(); });
    zo && zo.addEventListener('click', ()=>{ scale = clamp(scale/1.2, 0.4, 2.5); center(); });
    zr && zr.addEventListener('click', ()=>{ scale = 1; center(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ scale=1; center(); }});

    // Initial center after drawing
    center();
  }
})();

