const { jsPDF } = window.jspdf;

function generarPDF() {

    const doc = new jsPDF();

    const vpn = document.getElementById("vpn").textContent;

    // 🖼️ LOGO
    doc.addImage("logo_ues.png", "PNG", 10, 10, 25, 25);

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

    if (parseFloat(vpn) > 0) {
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
