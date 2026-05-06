/* ==========================================================================
   REPORTE - Generador de PDF con jsPDF
   Extrae los resultados calculados y genera un reporte profesional
   ========================================================================== */

const { jsPDF } = window.jspdf || {};

async function generarPDF() {
    if (!window.jspdf) {
        alert('❌ jsPDF no está disponible. Intenta de nuevo.');
        console.error('jsPDF no cargó correctamente');
        return;
    }

    try {
        // Obtener datos de los spans en el HTML
        const vpnEl = document.getElementById("vpn");
        const tirEl = document.getElementById("tir");
        const caeEl = document.getElementById("cae");
        const inversionEl = document.getElementById("inversionInicial");
        const tasaEl = document.getElementById("tasaDescuento");

        const vpn = vpnEl ? vpnEl.textContent : '0.00';
        const tir = tirEl ? tirEl.textContent : '0.00';
        const cae = caeEl ? caeEl.textContent : '0.00';
        const inversion = inversionEl ? inversionEl.value : '0';
        const tasa = tasaEl ? tasaEl.value : '0';

        // Crear documento PDF
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'letter'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 15;

        // ═══════════════════════════════════════════════════════════════
        // HEADER
        // ═══════════════════════════════════════════════════════════════
        doc.setFillColor(0, 51, 102); // Azul UES
        doc.rect(0, 0, pageWidth, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('SEAE', 15, 18);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Sistema de Evaluación de Alternativas Económicas', 15, 25);
        doc.text('Universidad de El Salvador', 15, 31);

        yPosition = 45;

        // ═══════════════════════════════════════════════════════════════
        // DATOS DE ENTRADA
        // ═══════════════════════════════════════════════════════════════
        doc.setTextColor(0, 51, 102);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('DATOS DE ENTRADA', 15, yPosition);
        yPosition += 8;

        doc.setDrawColor(0, 51, 102);
        doc.setLineWidth(0.5);
        doc.line(15, yPosition - 2, pageWidth - 15, yPosition - 2);

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');

        yPosition += 6;
        doc.text(`Inversión Inicial: $${inversion}`, 15, yPosition);
        yPosition += 6;
        doc.text(`Tasa de Descuento: ${tasa}%`, 15, yPosition);

        yPosition += 12;

        // ═══════════════════════════════════════════════════════════════
        // RESULTADOS
        // ═══════════════════════════════════════════════════════════════
        doc.setTextColor(0, 51, 102);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('RESULTADOS DEL ANÁLISIS', 15, yPosition);
        yPosition += 8;

        doc.setLineWidth(0.5);
        doc.line(15, yPosition - 2, pageWidth - 15, yPosition - 2);

        yPosition += 8;

        // ─────────────────────────────────────────────────────────────
        // VPN
        // ─────────────────────────────────────────────────────────────
        doc.setFillColor(220, 230, 250); // Azul claro
        doc.rect(15, yPosition - 6, pageWidth - 30, 20, 'F');

        doc.setTextColor(0, 51, 102);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Valor Presente Neto (VPN)', 18, yPosition);

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(`$${vpn}`, 18, yPosition + 8);

        // Interpretación
        const vpnNum = parseFloat(vpn.replace(/[^0-9.-]/g, ''));
        const vpnInterpretacion = vpnNum > 0 
            ? '✓ El proyecto es viable (VPN positivo)' 
            : '✗ El proyecto no es viable (VPN negativo)';
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(vpnInterpretacion, 18, yPosition + 14);

        yPosition += 28;

        // ─────────────────────────────────────────────────────────────
        // TIR
        // ─────────────────────────────────────────────────────────────
        doc.setFillColor(254, 244, 220); // Ámbar claro
        doc.rect(15, yPosition - 6, pageWidth - 30, 20, 'F');

        doc.setTextColor(245, 158, 11);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Tasa Interna de Retorno (TIR)', 18, yPosition);

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(`${tir}%`, 18, yPosition + 8);

        const tirNum = parseFloat(tir);
        const tasaNum = parseFloat(tasa);
        const tirInterpretacion = tirNum > tasaNum
            ? `✓ Rentable (TIR ${tirNum.toFixed(2)}% > Tasa ${tasaNum}%)`
            : `✗ No rentable (TIR ${tirNum.toFixed(2)}% ≤ Tasa ${tasaNum}%)`;

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(tirInterpretacion, 18, yPosition + 14);

        yPosition += 28;

        // ─────────────────────────────────────────────────────────────
        // CAE
        // ─────────────────────────────────────────────────────────────
        doc.setFillColor(220, 250, 240); // Verde claro
        doc.rect(15, yPosition - 6, pageWidth - 30, 20, 'F');

        doc.setTextColor(16, 185, 129);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Costo Anual Equivalente (CAE)', 18, yPosition);

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(`$${cae}`, 18, yPosition + 8);

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Costo uniforme anual del proyecto', 18, yPosition + 14);

        yPosition = pageHeight - 30;

        // ═══════════════════════════════════════════════════════════════
        // FOOTER
        // ═══════════════════════════════════════════════════════════════
        doc.setDrawColor(0, 51, 102);
        doc.line(15, yPosition, pageWidth - 15, yPosition);

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');

        const fecha = new Date().toLocaleDateString('es-SV');
        const hora = new Date().toLocaleTimeString('es-SV');

        doc.text(`Fecha: ${fecha} | Hora: ${hora}`, 15, yPosition + 6);
        doc.text('SEAE © 2026 - Reporte generado automáticamente', 15, yPosition + 12);

        // Número de página
        doc.setFontSize(8);
        doc.text(`Página ${doc.internal.pages.length - 1}`, pageWidth - 20, yPosition + 12);

        // ═══════════════════════════════════════════════════════════════
        // GUARDAR
        // ═══════════════════════════════════════════════════════════════
        const nombreArchivo = `SEAE_Reporte_${new Date().getTime()}.pdf`;
        doc.save(nombreArchivo);

        console.log('✅ PDF generado correctamente:', nombreArchivo);

    } catch (error) {
        console.error('❌ Error generando PDF:', error);
        alert('❌ Error al generar el PDF. Verifica la consola para más detalles.');
    }
}
