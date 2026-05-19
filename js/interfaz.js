/* ============================================================
 * SEAE - interfaz.js
 * Manejo del DOM, navegación, tabs, periodos y cálculos UI
 * ============================================================ */

const SEAE = {
  state: {
    proyectos: JSON.parse(localStorage.getItem("seae_proyectos") || "[]"),
    actual: { vpn: null, cae: null, tir: null },
  },
  charts: {},
};

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const fmtMoney = (n) => "$" + (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPct = (n) => (Number(n) || 0).toFixed(2) + "%";

/* ---------- Navegación ---------- */
const coloresFondo = {
  inicio: "#eaecf0",
  vpn: "#e2ebf7",
  cae: "#e0f1e7",
  tir: "#fcf0e1",
  reportes: "#ece8f5"
};

function aplicarFondoContextual(view) {
  document.body.style.transition = "background-color 0.5s ease";
  document.body.style.backgroundColor = coloresFondo[view] || coloresFondo.inicio;
}

function navegar(view) {
  $$(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.view === view));
  
  $$(".view-content").forEach(s => {
    s.classList.remove("hidden");
    s.classList.toggle("active", s.dataset.viewContent === view);
  });
  
  aplicarFondoContextual(view);

  if (view === "inicio") renderDashboard();
  if (view === "reportes") renderReportes();
}

/* ---------- Persistencia ---------- */
function guardarProyecto(p) {
  SEAE.state.proyectos.push({ ...p, id: Date.now(), fecha: new Date().toISOString() });
  localStorage.setItem("seae_proyectos", JSON.stringify(SEAE.state.proyectos));
}

/* ---------- ELIMINAR PROYECTO ---------- */
function eliminarProyecto(id) {
  if (!confirm("¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.")) return;
  
  SEAE.state.proyectos = SEAE.state.proyectos.filter(p => p.id !== id);
  localStorage.setItem("seae_proyectos", JSON.stringify(SEAE.state.proyectos));
  
  renderDashboard();
  renderReportes();
}

/* ---------- Constructor de vistas de cálculo ---------- */
function buildCalcView(metodo, mountId) {
  const mount = $("#" + mountId);
  if (!mount) {
    console.error(`No se encontró el elemento con id: ${mountId}`);
    return;
  }
  
  const tpl = $("#tplCalculo");
  if (!tpl) {
    console.error("No se encontró el template tplCalculo");
    return;
  }
  
  const tplContent = tpl.content.cloneNode(true);
  mount.appendChild(tplContent);

  const root = mount;
  const tabsEl = $(".tabs", root);
  const panelsEl = $(".alt-panels", root);
  let alts = [];
  let active = 0;

  const isTIR = metodo === "TIR";

  function nuevaAlt() {
    const node = $("#tplAltPanel");
    if (!node) {
      console.error("No se encontró el template tplAltPanel");
      return;
    }
    
    const panel = node.content.cloneNode(true).querySelector(".alt-panel");
    panel.querySelector(".tasa-label").textContent = isTIR ? "Tasa mínima requerida (%)" : "Tasa de descuento (%)";
    //if (isTIR) panel.querySelector(".salvamento-wrap").style.display = "none";
    const periods = panel.querySelector(".periods");
    for (let i = 1; i <= 3; i++) periods.appendChild(crearPeriodo(i));
    panel.querySelector(".btn-add-period").addEventListener("click", () => {
      const idx = periods.children.length + 1;
      periods.appendChild(crearPeriodo(idx));
    });
    panelsEl.appendChild(panel);
    alts.push(panel);
    renderTabs();
    setActive(alts.length - 1);
  }

  function crearPeriodo(num) {
    const row = document.createElement("div");
    row.className = "period-row";
    row.innerHTML = `
      <div class="period-tag">PERIODO<br>${num}</div>
      <input type="number" class="inp" placeholder="0.00" data-periodo />
      <button class="btn-x" type="button" title="Eliminar">✕</button>`;
    row.querySelector(".btn-x").addEventListener("click", () => {
      row.remove();
      row.parentElement && Array.from(row.parentElement.children).forEach((r, i) => {
        r.querySelector(".period-tag").innerHTML = `PERIODO<br>${i + 1}`;
      });
    });
    return row;
  }

  function renderTabs() {
    tabsEl.innerHTML = "";
    alts.forEach((_, i) => {
      const t = document.createElement("button");
      t.className = "tab" + (i === active ? " active" : "");
      t.innerHTML = `Alternativa ${i + 1} <span class="x">✕</span>`;
      t.addEventListener("click", (e) => {
        if (e.target.classList.contains("x")) {
          if (alts.length === 1) return;
          alts[i].remove(); alts.splice(i, 1);
          if (active >= alts.length) active = alts.length - 1;
          renderTabs(); setActive(active);
        } else setActive(i);
      });
      tabsEl.appendChild(t);
    });
  }

  function setActive(i) {
    active = i;
    alts.forEach((p, idx) => p.style.display = idx === i ? "block" : "none");
    renderTabs();
  }

  function leerAlt(panel) {
    const get = (f) => panel.querySelector(`[data-f="${f}"]`).value;
    const flujos = $$("[data-periodo]", panel).map(i => Number(i.value || 0));
    return {
      nombre: get("nombre") || "Sin nombre",
      costo: Number(get("costo") || 0),
      tasa: Number(get("tasa") || 0),
      vida: Number(get("vida") || flujos.length),
      salvamento: Number(get("salvamento") || 0),
      flujos,
    };
  }

  function calcular() {
    console.log("Iniciando cálculo para método:", metodo);
    
    const proyectoNombre = (root.querySelector(".proyecto-nombre").value || "").trim();
    if (!proyectoNombre) {
      alert("Debes ingresar el Nombre del Proyecto antes de calcular.");
      root.querySelector(".proyecto-nombre").focus();
      return;
    }
    
    console.log("Proyecto:", proyectoNombre);
    console.log("Número de alternativas:", alts.length);
    
    const datos = alts.map(leerAlt);
    console.log("Datos leídos:", datos);
    
    const resultados = datos.map(d => {
      let val;
      if (metodo === "VPN") val = Finanzas.vpn(d);
      else if (metodo === "CAE") val = Finanzas.cae(d);
      else val = Finanzas.tir(d);
      const dec = Finanzas.decidir(metodo, val, d.tasa);
      console.log(`Resultado ${d.nombre}:`, val, dec);
      return { ...d, valor: val, decision: dec };
    });

    let mejorIdx = 0;
    resultados.forEach((r, i) => {
      const a = r.valor, b = resultados[mejorIdx].valor;
      if (a == null) return;
      if (metodo === "CAE") { if (b == null || a > b) mejorIdx = i; }
      else { if (b == null || a > b) mejorIdx = i; }
    });

    console.log("Mejor alternativa índice:", mejorIdx);

    const area = $(".results-area", root);
    area.innerHTML = `<div class="mb-3 pb-2 border-b border-gray-100">
        <div class="text-xs uppercase tracking-wider text-gray-400">Proyecto</div>
        <div class="font-semibold">${proyectoNombre}</div>
      </div>` + resultados.map((r, i) => `
      <div class="border border-gray-100 rounded-md p-3 mb-2 ${i === mejorIdx ? 'bg-emerald-50' : 'bg-white'}">
        <div class="flex justify-between items-center">
          <div class="font-semibold">${r.nombre}</div>
          <span class="badge ${r.decision.ok ? 'badge-accept' : 'badge-reject'}">${r.decision.texto}</span>
        </div>
        <div class="text-sm text-gray-600 mt-1">${metodo}: <strong>${metodo === 'TIR' ? fmtPct(r.valor) : fmtMoney(r.valor)}</strong></div>
      </div>`).join("") +
      `<div class="text-sm mt-2"><strong>Recomendación:</strong> Para el proyecto <em>${proyectoNombre}</em>, seleccionar <em>${resultados[mejorIdx].nombre}</em> por presentar el indicador más favorable bajo el criterio ${metodo}.</div>`;

    const canvas = $(".bar-chart", root);
    if (SEAE.charts[metodo]) SEAE.charts[metodo].destroy();
    SEAE.charts[metodo] = new Chart(canvas, {
      type: "bar",
      data: {
        labels: resultados.map(r => r.nombre),
        datasets: [{
          label: metodo,
          data: resultados.map(r => r.valor || 0),
          backgroundColor: resultados.map((_, i) => i === mejorIdx ? "#1e2022" : "#9ca3af"),
          borderRadius: 6,
        }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    SEAE.state.actual[metodo.toLowerCase()] = { metodo, proyecto: proyectoNombre, resultados, mejorIdx };
    console.log("Estado actualizado:", SEAE.state.actual);
    return resultados[mejorIdx];
  }

  const btnAddAlt = root.querySelector(".btn-add-alt");
  const btnClear = root.querySelector(".btn-clear");
  const btnCalc = root.querySelector(".btn-calc");
  const btnSave = root.querySelector(".btn-save");
  
  console.log("Botones encontrados:", { btnAddAlt, btnClear, btnCalc, btnSave });

  if (btnAddAlt) btnAddAlt.addEventListener("click", nuevaAlt);
  if (btnClear) btnClear.addEventListener("click", () => {
    panelsEl.innerHTML = ""; alts = []; active = 0; nuevaAlt();
    root.querySelector(".proyecto-nombre").value = "";
    $(".results-area", root).innerHTML = `<span class="text-gray-500">Aún no se ha calculado.</span>`;
  });
  if (btnCalc) btnCalc.addEventListener("click", calcular);
  if (btnSave) btnSave.addEventListener("click", () => {
    console.log("Botón guardar clickeado");
    const cur = SEAE.state.actual[metodo.toLowerCase()];
    console.log("Estado actual:", cur);
    if (!cur) { alert("Primero presiona Calcular y Comparar."); return; }
    const mejor = cur.resultados[cur.mejorIdx];
    guardarProyecto({
      metodo,
      proyecto: cur.proyecto,
      alternativas: cur.resultados,
      mejor: mejor.nombre,
      mejorValor: mejor.valor,
      decision: mejor.decision.texto,
      inversion: cur.resultados.reduce((s, r) => s + Number(r.costo || 0), 0),
    });
    alert(`Resultados del proyecto "${cur.proyecto}" guardados.`);
    renderDashboard();
  });

  nuevaAlt();
}

/* ---------- Dashboard ---------- */
function renderDashboard() {
  const ps = SEAE.state.proyectos;
  $("#kpiTotal").textContent = ps.length;
  $("#kpiVPN").textContent = ps.filter(p => p.metodo === "VPN").length;
  $("#kpiCAE").textContent = ps.filter(p => p.metodo === "CAE").length;
  $("#kpiTIR").textContent = ps.filter(p => p.metodo === "TIR").length;

  const acept = ps.filter(p => /Acept/i.test(p.decision)).length;
  const rech = ps.length - acept;
  $("#kpiAcept").textContent = acept;
  $("#kpiRech").textContent = rech;

  const inv = ps.reduce((s, p) => s + Number(p.inversion || 0), 0);
  $("#kpiInv").textContent = fmtMoney(inv);

  const mejor = [...ps].sort((a, b) => (b.mejorValor || 0) - (a.mejorValor || 0))[0];
  $("#kpiBestName").textContent = mejor ? mejor.mejor : "—";
  $("#kpiBestVal").textContent = mejor ? `${mejor.metodo} ${mejor.metodo === 'TIR' ? fmtPct(mejor.mejorValor) : fmtMoney(mejor.mejorValor)}` : "—";

  $("#balActual").textContent = `${acept} aceptados`;
  $("#balRech").textContent = `${rech} rechazados · ${ps.length} registros`;
  $("#invProm").textContent = ps.length ? fmtMoney(inv / ps.length) : "$0.00";

  const counts = { VPN: 0, CAE: 0, TIR: 0 };
  ps.forEach(p => counts[p.metodo]++);
  const dom = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  $("#metDom").textContent = ps.length ? `${dom[0]} (${dom[1]} proyectos)` : "—";

  const ctx = $("#donutChart");
  if (SEAE.charts.donut) SEAE.charts.donut.destroy();
  SEAE.charts.donut = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Aceptados", "Rechazados"],
      datasets: [{ data: [acept, rech], backgroundColor: ["#3f6b4a", "#7a2230"], borderWidth: 0 }]
    },
    options: { cutout: "65%", plugins: { legend: { position: "bottom" } } }
  });

  const ult = ps.slice(-3).reverse();
  $("#ultimosProy").innerHTML = ult.map(p => `
    <li class="proy-row">
      <div class="proy-meta">
        <span class="font-semibold text-sm">${p.proyecto || "(Sin proyecto)"}</span>
        <span class="text-xs text-gray-500">→ ${p.mejor}</span>
        <span class="badge badge-method">${p.metodo}</span>
        <span class="badge ${/Acept/i.test(p.decision) ? 'badge-accept' : 'badge-reject'}">${/Acept/i.test(p.decision) ? 'Aceptado' : 'Rechazado'}</span>
      </div>
      <div class="flex gap-2">
        <button class="btn-light text-xs" onclick="alert('Detalle del proyecto: ${p.proyecto}\\nMétodo: ${p.metodo}\\nResultado: ${p.metodo === 'TIR' ? fmtPct(p.mejorValor) : fmtMoney(p.mejorValor)}')">Ver detalle</button>
        <button class="btn-danger text-xs" onclick="SEAE.eliminarProyecto(${p.id})">Eliminar</button>
      </div>
    </li>`).join("") || `<li class="text-sm text-gray-500">Sin proyectos guardados.</li>`;
}

/* ---------- Reportes (interfaz) ---------- */
function renderReportes() {
  const ps = SEAE.state.proyectos;
  $("#rTotal").textContent = ps.length;

  
  // VPN promedio
  const vpns = ps.filter(p => p.metodo === "VPN").map(p => p.mejorValor);
  $("#rVPN").textContent = vpns.length ? fmtMoney(vpns.reduce((a, b) => a + b, 0) / vpns.length) : "$0.00";
  
  // CAE promedio (NUEVO)
  const caes = ps.filter(p => p.metodo === "CAE").map(p => p.mejorValor);
  const caeProm = caes.length ? caes.reduce((a, b) => a + b, 0) / caes.length : 0;
  $("#rCAE").textContent = fmtMoney(caeProm);
  
  // TIR promedio
  const tirs = ps.filter(p => p.metodo === "TIR").map(p => p.mejorValor);
  $("#rTIR").textContent = tirs.length ? fmtPct(tirs.reduce((a, b) => a + b, 0) / tirs.length) : "0%";

  $("#rLista").innerHTML = ps.map(p => `
    <div class="border border-gray-100 rounded-md p-3">
      <div class="flex justify-between">
        <div>
          <div class="font-semibold">${p.proyecto || "(Sin proyecto)"}</div>
          <div class="text-xs text-gray-500">Mejor alternativa: <strong>${p.mejor}</strong> <span class="badge badge-method ml-1">${p.metodo}</span></div>
        </div>
        <div class="flex items-center gap-2">
          <span class="badge ${/Acept/i.test(p.decision) ? 'badge-accept' : 'badge-reject'}">${p.decision}</span>
          <button class="btn-danger text-xs" onclick="SEAE.eliminarProyecto(${p.id})">Eliminar</button>
        </div>
      </div>
      <div class="text-sm text-gray-600 mt-1">Resultado: ${p.metodo === 'TIR' ? fmtPct(p.mejorValor) : fmtMoney(p.mejorValor)} · Inversión: ${fmtMoney(p.inversion)}</div>
    </div>`).join("") || `<div class="text-sm text-gray-500">Sin proyectos.</div>`;
}

/* ---------- Exponer función globalmente ---------- */
SEAE.eliminarProyecto = eliminarProyecto;

/* ---------- Modo Noche ---------- */
function inicializarModoNoche() {
  const body = document.body;
  const btn = $("#btnModoOscuro");
  const icono = $("#iconoModo");
  const texto = $("#textoModo");
  
  // Restaurar preferencia guardada
  const modoGuardado = localStorage.getItem("seae_dark_mode");
  if (modoGuardado === "true") {
    body.classList.add("dark-mode");
    actualizarTextoBoton(true);
  }
  
  // Manejar click del botón
  if (btn) {
    btn.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      const estaDark = body.classList.contains("dark-mode");
      localStorage.setItem("seae_dark_mode", estaDark);
      actualizarTextoBoton(estaDark);
    });
  }
  
  function actualizarTextoBoton(estaDark) {
    if (icono) icono.textContent = estaDark ? "☀️" : "🌙";
    if (texto) texto.textContent = estaDark ? "Modo Claro" : "Modo Noche";
  }
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado, inicializando...");
  inicializarModoNoche();
  $$(".nav-item").forEach(n => n.addEventListener("click", () => navegar(n.dataset.view)));
  buildCalcView("VPN", "vpn-layout");
  buildCalcView("CAE", "cae-layout");
  buildCalcView("TIR", "tir-layout");
  renderDashboard();

  const btnPDF = $("#btnPDF");
  const btnCSV = $("#btnCSV");
  if (btnPDF) btnPDF.addEventListener("click", () => {
    console.log("Exportar PDF");
    if (typeof Reporte !== 'undefined' && Reporte.exportarPDF) {
      Reporte.exportarPDF();
    } else {
      alert("Módulo de reporte no cargado");
    }
  });
  if (btnCSV) btnCSV.addEventListener("click", () => {
    console.log("Exportar CSV");
    if (typeof Reporte !== 'undefined' && Reporte.exportarCSV) {
      Reporte.exportarCSV();
    } else {
      alert("Módulo de reporte no cargado");
    }
  });
});