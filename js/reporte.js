const { jsPDF } = window.jspdf;

function generarPDF() {

   const doc = new jsPDF();

    // LOGO
    doc.addImage("logo_ues.png", "PNG", 150, 10, 40, 20);

    doc.text("Universidad de El Salvador", 20, 20);

    doc.save("reporte.pdf");

    const vpn = document.getElementById("vpn").textContent;
    const tir = document.getElementById("tir").textContent;
    const cae = document.getElementById("cae").textContent;

    doc.setFontSize(16);
    doc.text("Universidad de El Salvador", 20, 20);
    doc.text("Reporte SEAE", 20, 30);

    doc.setFontSize(12);
    doc.text("Resultados:", 20, 50);
    doc.text("VPN: " + vpn, 20, 65);
    doc.text("TIR: " + tir, 20, 75);
    doc.text("CAE: " + cae, 20, 85);

    doc.save("Reporte_SEAE.pdf");
}
