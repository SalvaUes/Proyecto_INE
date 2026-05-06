const { jsPDF } = window.jspdf || {};

async function generarPDF() {
    if (!window.jspdf) {
        console.error('jsPDF no está disponible. Asegúrate de incluir la librería antes de este script.');
        return;
    }

    const doc = new jsPDF();

    // Obtener y sanear VPN
    const vpnEl = document.getElementById("vpn");
    const vpn = vpnEl ? vpnEl.textContent.trim() : '';
    const vpnNum = parseFloat(vpn.toString().replace(/\s+/g, '').replace(',', '.')) || 0;

    // Cargar logo como dataURL (misma origen recomendado)
    try {
        const resp = await fetch('logo_ues.png');
        if (resp.ok) {
            const blob = await resp.blob();
            const reader = new FileReader();
            const imgData = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            doc.addImage(imgData, 'PNG', 10, 10, 25, 25);
        } else {
            console.warn('No se pudo cargar logo_ues.png:', resp.status);
        }
    } catch (err) {
        console.warn('Error cargando logo:', err);
    }

    // 🏷️ TÍTULO
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text("Sistema de Evaluación de Alternativas Económicas", 40, 20);

    doc.setFontSize(12);
    doc.text("Universidad de El Salvador", 40, 28);

    // Línea
    doc.setDrawColor(0, 51, 102);
    doc.line(10, 40, 200, 40);

    // 📊 RESULTADOS
    doc.setFontSize(14);
    doc.text("Resultados del Análisis (VPN)", 10, 55);

    doc.setFontSize(12);
    doc.text("Valor Presente Neto:", 10, 70);

    // 💰 VALOR GRANDE
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text("$ " + vpn, 10, 85);

    // 📌 INTERPRETACIÓN
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Interpretación:", 10, 105);

    if (vpnNum > 0) {
        doc.text("El proyecto es viable (VPN positivo).", 10, 115);
    } else {
        doc.text("El proyecto no es viable.", 10, 115);
    }

    // 📅 FECHA
    const fecha = new Date().toLocaleDateString();
    doc.text("Fecha: " + fecha, 10, 140);

    // 📎 FOOTER
    doc.setFontSize(10);
    doc.text("SEAE - Reporte generado automáticamente", 10, 280);

    // 📥 DESCARGA
    doc.save("Reporte_SEAE.pdf");
}

// Vincular botón de descarga (si existe). Busca varios ids por compatibilidad.
document.addEventListener('DOMContentLoaded', () => {
    const candidates = ['btnDescargar', 'btnDescargaPDF', 'btnGenerarPDF', 'generarPDF'];
    let btn = null;
    for (const id of candidates) {
        btn = document.getElementById(id);
        if (btn) break;
    }
    if (btn) {
        btn.addEventListener('click', () => {
            generarPDF().catch(err => console.error('Error generando PDF:', err));
        });
    }
});
