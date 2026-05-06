/* ==========================================================================
   DEV 3 (El Conector - DOM): 
   Tú eres el puente. Vas a escuchar cuando el usuario haga clic, leeras lo
   que escribieron en el HTML del DEV 1, se lo mandaras al DEV 2, y mostraras
   la respuesta en pantalla.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Capturar los elementos del HTML
    const btnCalcular = document.getElementById('btnCalcular');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const formCalculos = document.getElementById('formCalculos');
    
    // Elementos de entrada
    const inversionInicial = document.getElementById('inversionInicial');
    const tasaDescuento = document.getElementById('tasaDescuento');
    const flujosInputs = document.querySelectorAll('.flujo-input');
    
    // Elementos de salida
    const vpnSpan = document.getElementById('vpn');
    const tirSpan = document.getElementById('tir');
    const caeSpan = document.getElementById('cae');
    const vpnStatus = document.getElementById('vpnStatus');
    const tirStatus = document.getElementById('tirStatus');
    const caeStatus = document.getElementById('caeStatus');

    /**
     * Lee todos los flujos de efectivo del formulario
     * @returns {array} Arreglo con los flujos
     */
    function obtenerFlujos() {
        const flujos = [];
        flujosInputs.forEach(input => {
            const valor = parseFloat(input.value) || 0;
            flujos.push(valor);
        });
        return flujos;
    }

    /**
     * Valida que los datos sean correctos
     * @returns {boolean} True si son válidos
     */
    function validarDatos() {
        const inv = parseFloat(inversionInicial.value);
        const tasa = parseFloat(tasaDescuento.value);
        const flujos = obtenerFlujos();

        if (isNaN(inv) || inv < 0) {
            alert('❌ La inversión inicial debe ser un número positivo');
            return false;
        }

        if (isNaN(tasa) || tasa < 0 || tasa > 100) {
            alert('❌ La tasa de descuento debe estar entre 0 y 100%');
            return false;
        }

        if (flujos.length === 0 || flujos.every(f => f === 0)) {
            alert('❌ Debes ingresar al menos un flujo de efectivo');
            return false;
        }

        return true;
    }

    /**
     * Formatea un número a formato de moneda
     * @param {number} valor 
     * @returns {string} Valor formateado
     */
    function formatoMoneda(valor) {
        return new Intl.NumberFormat('es-SV', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(valor).replace('$', '').trim();
    }

    /**
     * Obtiene el status (viable o no viable)
     * @param {number} vpn 
     * @returns {string} Status formateado
     */
    function getStatus(vpn) {
        return vpn > 0 ? '✅ VIABLE' : vpn < 0 ? '❌ NO VIABLE' : '⚠️ NEUTRAL';
    }

    // 2. Evento: Calcular
    btnCalcular.addEventListener('click', function(e) {
        e.preventDefault();

        if (!validarDatos()) {
            return;
        }

        // 3. Leer los datos del usuario
        const inv = parseFloat(inversionInicial.value);
        const tasa = parseFloat(tasaDescuento.value) / 100; // Convertir a decimal
        const flujos = obtenerFlujos();

        // 4. Mandar a llamar al DEV 2 (Calculos)
        const vpn = CalculosEconomicos.calcularVPN(inv, flujos, tasa);
        const tir = CalculosEconomicos.calcularTIR(inv, flujos);
        const cae = CalculosEconomicos.calcularCAE(vpn, tasa, flujos.length);

        // 5. Imprimir en pantalla
        vpnSpan.textContent = formatoMoneda(vpn);
        tirSpan.textContent = tir.toFixed(2);
        caeSpan.textContent = formatoMoneda(Math.abs(cae));

        // Mostrar status
        vpnStatus.textContent = getStatus(vpn);
        tirStatus.textContent = tir > tasa * 100 ? '✅ RENTABLE' : '❌ NO RENTABLE';
        caeStatus.textContent = cae < 0 ? '✅ POSITIVO' : '❌ NEGATIVO';

        // Habilitar descarga de PDF
        const btnDescargar = document.getElementById('btnDescargar');
        btnDescargar.disabled = false;
        btnDescargar.style.opacity = '1';
    });

    // 3. Evento: Limpiar
    btnLimpiar.addEventListener('click', function() {
        formCalculos.reset();
        inversionInicial.value = '50000';
        tasaDescuento.value = '12';
        flujosInputs[0].value = '15000';
        flujosInputs[1].value = '18000';
        flujosInputs[2].value = '20000';

        vpnSpan.textContent = '0.00';
        tirSpan.textContent = '0.00';
        caeSpan.textContent = '0.00';
        vpnStatus.textContent = '—';
        tirStatus.textContent = '—';
        caeStatus.textContent = '—';

        document.getElementById('btnDescargar').disabled = true;
        document.getElementById('btnDescargar').style.opacity = '0.5';
    });

    // 4. Inicializar: desabilitar botón de descarga al cargar
    document.getElementById('btnDescargar').disabled = true;
    document.getElementById('btnDescargar').style.opacity = '0.5';
});