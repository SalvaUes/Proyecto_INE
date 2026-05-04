/* ==========================================================================
   DEV 3 (El Conector - DOM): 
   Tú eres el puente. Vas a escuchar cuando el usuario haga clic, leeras lo
   que escribieron en el HTML del DEV 1, se lo mandaras al DEV 2, y mostraras
   la respuesta en pantalla.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Capturar los elementos del HTML (Botones, inputs, divs de resultados)
    // Ejemplo: const btnCalcular = document.getElementById('btnCalcular');
    
    // 2. Escuchar eventos (Clics)
    /* btnCalcular.addEventListener('click', function(e) {
        e.preventDefault(); // Evita que la página se recargue

        // 3. Leer los datos del usuario (Asegurate de convertirlos a numeros)
        let costo = parseFloat(document.getElementById('costoInicial').value);
        let tasa = parseFloat(document.getElementById('tasa').value);

        // 4. Mandar a llamar al DEV 2
        let resultadoVPN = CalculosEconomicos.calcularVPN(costo, [1000, 2000], tasa);

        // 5. Imprimir en pantalla para que el usuario lo vea
        document.getElementById('resultadoPantalla').innerText = "$" + resultadoVPN;
    });
    */
});