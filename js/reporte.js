/* ============================================================
 * SEAE - reporte.js
 * Generación de PDF y CSV optimizado para html2pdf
 * ============================================================ */

const Reporte = (() => {

  function fechaActual() {
    return new Date().toLocaleString("es-SV", { dateStyle: "long", timeStyle: "short" });
  }

  function fmtMoney(n) { return "$" + (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function fmtPct(n)   { return (Number(n) || 0).toFixed(2) + "%"; }

  function tablaAlt(alt, metodo) {
    const valor = alt.valor;
    const valorTxt = metodo === "TIR" ? fmtPct(valor) : fmtMoney(valor);
    return `
      <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:Arial,sans-serif;margin:8px 0;">
        <tr style="background:#f8fafc;"><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:600;width:45%;">Tasa de descuento</td><td style="padding:6px 8px;border:1px solid #e2e8f0;">${alt.tasa}%</td></tr>
        <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:600;">Vida útil</td><td style="padding:6px 8px;border:1px solid #e2e8f0;">${alt.vida} años</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:600;">Inversión inicial</td><td style="padding:6px 8px;border:1px solid #e2e8f0;">${fmtMoney(alt.costo)}</td></tr>
        <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:600;">Valor de salvamento</td><td style="padding:6px 8px;border:1px solid #e2e8f0;">${fmtMoney(alt.salvamento)}</td></tr>
        <tr style="background:#eff6ff;"><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:700;color:#0369a1;">Resultado (${metodo})</td><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:700;color:#0369a1;">${valorTxt}</td></tr>
        <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:600;">Decisión</td><td style="padding:6px 8px;border:1px solid #e2e8f0;">
          <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;background:${alt.decision.ok ? '#dcfce7' : '#fee2e2'};color:${alt.decision.ok ? '#15803d' : '#b91c1c'};">${alt.decision.texto}</span>
        </td></tr>
      </table>`;
  }

  function bloqueMetodo(metodo, registros, isFirst) {
    if (!registros.length) return "";
    
    const pageBreak = isFirst ? "page-break-before: auto;" : "page-break-before: always;";
    const colores = { VPN: '#1e40af', CAE: '#059669', TIR: '#7c3aed' };
    
    const html = registros.map(reg => {
      // Lógica corregida para seleccionar mejor alternativa
      const mejorAlt = reg.alternativas.reduce((mejor, actual) => {
        if (metodo === "CAE") return actual.valor > mejor.valor ? actual : mejor; // Menor costo = mayor valor matemático
        return actual.valor > mejor.valor ? actual : mejor;
      }, reg.alternativas[0]);

      const altsHTML = reg.alternativas.map(a => `
        <div style="page-break-inside: avoid; margin:10px 0; padding:10px; background:#ffffff; border:1px solid #e5e7eb; border-radius:6px;">
          <h3 style="font-size:12px; margin:0 0 8px 0; color:${colores[metodo]}; border-bottom:2px solid ${colores[metodo]}; padding-bottom:4px; font-weight:700;">
            Alternativa: ${a.nombre}
          </h3>
          ${tablaAlt(a, metodo)}
        </div>`).join("");

      const comparativo = reg.alternativas.length > 1
        ? `Al contrastar las alternativas se observa que <strong style="color:${colores[metodo]};">${mejorAlt.nombre}</strong> presenta el indicador ${metodo} más favorable (${metodo === 'TIR' ? fmtPct(mejorAlt.valor) : fmtMoney(mejorAlt.valor)}), optimizando la decisión económica.`
        : `Se evaluó una única alternativa, <strong>${mejorAlt.nombre}</strong>, con un resultado de ${metodo === 'TIR' ? fmtPct(mejorAlt.valor) : fmtMoney(mejorAlt.valor)}.`;

      return `
        <div style="page-break-inside: avoid; margin:16px 0; padding:14px; background:#fafafa; border-left:4px solid ${colores[metodo]}; border-radius:0 6px 6px 0;">
          <h3 style="font-size:14px; margin:0 0 10px 0; color:#111827; font-weight:800;">📁 ${reg.proyecto || "(Sin nombre)"}</h3>
          <p style="margin:0 0 10px 0; font-size:11px; color:#4b5563;"><strong>Alternativas:</strong> ${reg.alternativas.map(a => a.nombre).join(", ")}.</p>
          ${altsHTML}
          <div style="margin-top:10px; padding:10px; background:#ffffff; border:1px solid #e5e7eb; border-radius:4px;">
            <h4 style="font-size:11px; margin:0 0 4px 0; color:#374151; font-weight:700;">📊 Análisis Comparativo</h4>
            <p style="margin:0; font-size:11px; line-height:1.4; color:#4b5563;">${comparativo}</p>
          </div>
          <div style="page-break-inside: avoid; margin-top:10px; padding:10px; background:#ffffff; border:1px solid #d1d5db; border-radius:4px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
            <strong style="font-size:11px; color:#111827;">💡 RESOLUCIÓN DE INVERSIÓN:</strong>
            <span style="font-size:11px; color:#374151; display:block; margin-top:4px; line-height:1.4;">
              Para el proyecto <strong>${reg.proyecto || "(sin nombre)"}</strong>, bajo el método ${metodo}, se recomienda seleccionar <strong>${mejorAlt.nombre}</strong>. Cumple el criterio de aceptación (${mejorAlt.decision.texto}) y presenta el indicador económico más favorable.
            </span>
          </div>
        </div>`;
    }).join("");

    return `
      <div style="${pageBreak} background:#ffffff; padding:0 10px;">
        <h2 style="font-size:15px; margin:0 0 14px 0; padding:8px 12px; background:${colores[metodo]}; color:#fff; border-radius:6px; font-weight:800; text-align:center; letter-spacing:0.5px;">
          EVALUACIÓN POR MÉTODO: ${metodo}
        </h2>
        ${html}
      </div>`;
  }

  function exportarPDF() {
    const ps = SEAE.state.proyectos;
    if (!ps.length) { alert("No hay proyectos guardados para exportar."); return; }

    const grupos = { VPN: [], CAE: [], TIR: [] };
    ps.forEach(p => grupos[p.metodo].push(p));

    const doc = document.createElement("div");
    doc.style.fontFamily = "Arial, Helvetica, sans-serif";
    doc.style.color = "#111827";
    doc.style.background = "#ffffff";
    doc.style.padding = "0";
    doc.style.margin = "0";
    doc.style.width = "100%";
    
    // Estilos globales para controlar saltos de página en html2pdf
    const globalStyles = `
      <style>
        @page { size: A4; margin: 10mm; }
        body { background: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        div, p, table, td, tr, h1, h2, h3, h4, span { background: #ffffff !important; }
        .method-block { page-break-before: always; }
        .no-split { page-break-inside: avoid; }
      </style>
    `;

    doc.innerHTML = `
      ${globalStyles}
      <div style="background:#ffffff; padding:20px; max-width:210mm; margin:0 auto; box-sizing:border-box;">
        <!-- ENCABEZADO INSTITUCIONAL -->
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px; padding-bottom:16px; border-bottom:3px solid #1e2022; page-break-inside:avoid;">
          <img src="logo_ues.png" alt="UES" style="width:70px; height:70px; object-fit:contain;" onerror="this.style.display='none'"/>
          <div style="flex:1; text-align:center;">
            <h1 style="margin:0; font-size:18px; color:#111827; font-weight:800;">Universidad de El Salvador</h1>
            <div style="font-size:11px; color:#4b5563; margin:4px 0;">Facultad Multidisciplinaria de Occidente</div>
            <div style="font-size:13px; color:#111827; font-weight:700; margin-top:6px;">Sistema de Evaluación de Alternativas Económicas (SEAE)</div>
            <div style="font-size:12px; color:#059669; font-weight:800; margin-top:4px; letter-spacing:0.5px;">📋 REPORTE DE EVALUACIÓN ECONÓMICA</div>
          </div>
          <div style="width:70px; height:70px; background:#111827; color:#fff; display:flex; align-items:center; justify-content:center; border-radius:8px; font-weight:800; font-size:10px; text-align:center; line-height:1.2;">
            SEAE<br/>2026
          </div>
        </div>
        
        <div style="text-align:right; font-size:10px; color:#6b7280; margin-bottom:16px; padding:6px 10px; background:#f9fafb; border-radius:4px; border:1px solid #e5e7eb;">
          <strong>Fecha de generación:</strong> ${fechaActual()}
        </div>
        
        <!-- BLOQUES POR MÉTODO (Saltos de página controlados) -->
        ${bloqueMetodo("VPN", grupos.VPN, true)}
        ${bloqueMetodo("CAE", grupos.CAE, false)}
        ${bloqueMetodo("TIR", grupos.TIR, false)}
        
        <!-- PIE DE PÁGINA -->
        <div style="margin-top:30px; padding-top:14px; border-top:2px solid #e5e7eb; text-align:center; font-size:9px; color:#9ca3af; page-break-inside:avoid;">
          <div>Documento generado automáticamente por el Sistema de Evaluación de Alternativas Económicas (SEAE)</div>
          <div>Universidad de El Salvador - Ciclo I/2026 | Ingeniería de Negocios</div>
        </div>
      </div>
    `;

    const mount = document.getElementById("pdfTemplate");
    mount.classList.remove("hidden");
    mount.innerHTML = "";
    mount.appendChild(doc);

    // Configuración optimizada para html2pdf
    html2pdf().set({
      margin: [8, 8, 8, 8],
      filename: `SEAE_Reporte_${new Date().toISOString().slice(0,10)}.pdf`,
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        allowTaint: true,
        backgroundColor: "#ffffff" // Fuerza fondo blanco en el canvas
      },
      jsPDF: { 
        unit: "mm", 
        format: "a4", 
        orientation: "portrait",
        hotfixes: ["px_scaling"] // Mejora renderizado de tablas
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Respeta page-break-inside: avoid
    }).from(doc).save().then(() => {
      mount.classList.add("hidden"); 
      mount.innerHTML = "";
      console.log("PDF generado exitosamente.");
    }).catch(err => {
      console.error("Error generando PDF:", err);
      alert("Error al generar PDF. Revisa la consola.");
    });
  }

  function exportarCSV() {
    const ps = SEAE.state.proyectos;
    if (!ps.length) { alert("No hay proyectos guardados."); return; }
    
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; }
          th { background-color: #1e40af; color: white; font-weight: bold; border: 1px solid #111827; padding: 10px; text-align: center; }
          td { border: 1px solid #d1d5db; padding: 8px; text-align: center; vertical-align: middle; }
          .title { font-size: 20px; font-weight: bold; text-align: center; color: #ffffff; background-color: #111827; height: 40px; }
          .subtitle { font-size: 11px; text-align: right; color: #4b5563; }
          .project-header { background-color: #f3f4f6; font-weight: bold; color: #111827; font-size: 14px; text-align: left; }
          .win-row { background-color: #dcfce7; }
          .good { color: #15803d; font-weight: bold; }
          .bad { color: #b91c1c; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="7" class="title">REPORTE DE EVALUACIÓN ECONÓMICA - SEAE</td></tr>
          <tr><td colspan="7" class="subtitle">Generado: ${fechaActual()}</td></tr>
          <tr><td colspan="7"></td></tr>
    `;

    ps.forEach(p => {
      const metodo = p.metodo;
      const mejorAlt = p.alternativas.reduce((mejor, actual) => {
        return actual.valor > mejor.valor ? actual : mejor;
      }, p.alternativas[0]);
      
      html += `
          <tr>
            <td colspan="7" class="project-header">📁 Proyecto: ${p.proyecto || "(Sin nombre)"} | Método: ${metodo}</td>
          </tr>
          <tr>
            <th>Alternativa</th>
            <th>Tasa de descuento</th>
            <th>Vida útil</th>
            <th>Inversión inicial</th>
            <th>Valor de salvamento</th>
            <th>Resultado (${metodo})</th>
            <th>Decisión</th>
          </tr>
      `;

      p.alternativas.forEach((alt) => {
        const isMejor = alt.nombre === mejorAlt.nombre;
        const rowClass = isMejor ? 'win-row' : '';
        const valorTxt = metodo === "TIR" ? fmtPct(alt.valor) : fmtMoney(alt.valor);
        const decisionCls = alt.decision.ok ? 'good' : 'bad';
        const txtDec = alt.decision.texto + (isMejor ? " (RECOMENDADA ⭐)" : "");

        html += `
          <tr class="${rowClass}">
            <td style="text-align:left; font-weight:600;">${alt.nombre}</td>
            <td>${alt.tasa}%</td>
            <td>${alt.vida} años</td>
            <td>${fmtMoney(alt.costo)}</td>
            <td>${fmtMoney(alt.salvamento)}</td>
            <td style="font-weight:bold; color:#0369a1;">${valorTxt}</td>
            <td class="${decisionCls}">${txtDec}</td>
          </tr>
        `;
      });
      
      // Fila en blanco para separar proyectos
      html += `<tr><td colspan="7"></td></tr>`;
    });

    html += `
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SEAE_Reporte_${Date.now()}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return { exportarPDF, exportarCSV };
})();