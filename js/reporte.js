/* ==========================================================================
   DEV 4 (El Arquitecto del PDF): 
   Tu trabajo es tomar los resultados finales que están en la pantalla y 
   convertirlos en un PDF elegante. Usarás un boton para disparar esta accion.
   ========================================================================== */

// Nota: Para que esto funcione, en el index.html agregaremos una libreria como html2pdf.js

document.addEventListener("DOMContentLoaded", function() {
    
    // Capturas el boton que el DEV 1 diseño para exportar
    // const btnReporte = document.getElementById('btnGenerarReporte');

    /*
    btnReporte.addEventListener('click', function() {
        // 1. Seleccionas el area del HTML que quieres convertir en PDF
        const elementoAExportar = document.getElementById('areaDeResultados');

        // 2. Configuraciones de tu PDF (Márgenes, nombre del archivo, etc)
        var opciones = {
            margin:       1,
            filename:     'Reporte_Alternativas_Economicas.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // 3. Magia: Generar y descargar
        // html2pdf().set(opciones).from(elementoAExportar).save();
    });
    */
});