/* ==========================================================================
   DEV 2 (El Cerebro - Logica Pura): 
   CERO HTML AQUI. Tu trabajo es recibir numeros, aplicar las formulas financieras 
   y devolver el resultado exacto. Si te mandan letras por error, manejalo.
   ========================================================================== */

const CalculosEconomicos = {
    
    /**
     * Calcula el Valor Presente Neto (VPN)
     * Fórmula: VPN = -I0 + Σ(Ft / (1 + r)^t)
     * @param {number} inversionInicial - Inversión inicial (año 0)
     * @param {array} flujosEfectivo - Arreglo con los flujos de cada año
     * @param {number} tasaDescuento - Tasa de descuento en decimal (0.15 para 15%)
     * @returns {number} El VPN calculado
     */
    calcularVPN: function(inversionInicial, flujosEfectivo, tasaDescuento) {
        if (!Array.isArray(flujosEfectivo) || flujosEfectivo.length === 0) {
            return 0;
        }
        
        let vpn = -inversionInicial; // Año 0: inversión negativa
        
        // Sumar los flujos descontados
        for (let t = 1; t <= flujosEfectivo.length; t++) {
            let flujo = parseFloat(flujosEfectivo[t - 1]) || 0;
            vpn += flujo / Math.pow(1 + tasaDescuento, t);
        }
        
        return vpn;
    },

    /**
     * Calcula la Tasa Interna de Retorno (TIR)
     * Usa método de Newton-Raphson para encontrar la tasa donde VPN = 0
     * @param {number} inversionInicial - Inversión inicial
     * @param {array} flujosEfectivo - Arreglo de flujos por año
     * @returns {number} La TIR en porcentaje (ej: 15.5 para 15.5%)
     */
    calcularTIR: function(inversionInicial, flujosEfectivo) {
        if (!Array.isArray(flujosEfectivo) || flujosEfectivo.length === 0) {
            return 0;
        }

        const flujos = [-inversionInicial, ...flujosEfectivo.map(f => parseFloat(f) || 0)];
        
        // Función VPN para una tasa dada
        const vpn = (tasa) => {
            let suma = 0;
            for (let t = 0; t < flujos.length; t++) {
                suma += flujos[t] / Math.pow(1 + tasa, t);
            }
            return suma;
        };

        // Derivada del VPN (para Newton-Raphson)
        const vpnDerivada = (tasa) => {
            let suma = 0;
            for (let t = 1; t < flujos.length; t++) {
                suma -= (t * flujos[t]) / Math.pow(1 + tasa, t + 1);
            }
            return suma;
        };

        // Newton-Raphson: iterar hasta encontrar la raíz
        let tir = 0.1; // Estimación inicial: 10%
        let maxIteraciones = 100;
        let tolerancia = 0.0001;

        for (let i = 0; i < maxIteraciones; i++) {
            let vpnVal = vpn(tir);
            let vpnDer = vpnDerivada(tir);

            if (Math.abs(vpnVal) < tolerancia || vpnDer === 0) {
                break;
            }

            tir = tir - vpnVal / vpnDer;

            // Evitar valores negativos o muy altos
            if (tir < -0.99) tir = -0.99;
            if (tir > 10) tir = 10;
        }

        return tir * 100; // Retornar en porcentaje
    },

    /**
     * Calcula el Costo Anual Equivalente (CAE)
     * Fórmula: CAE = VPN * [r(1+r)^n] / [(1+r)^n - 1]
     * @param {number} vpn - El VPN ya calculado
     * @param {number} tasaDescuento - Tasa de descuento en decimal
     * @param {number} periodos - Número de períodos (años)
     * @returns {number} El CAE calculado
     */
    calcularCAE: function(vpn, tasaDescuento, periodos) {
        if (periodos <= 0 || tasaDescuento < 0) {
            return 0;
        }

        // CAE = VPN * [r(1+r)^n] / [(1+r)^n - 1]
        const potencia = Math.pow(1 + tasaDescuento, periodos);
        const numerador = tasaDescuento * potencia;
        const denominador = potencia - 1;

        if (denominador === 0) {
            return 0;
        }

        const cae = Math.abs(vpn) * (numerador / denominador);
        return vpn < 0 ? cae : -cae; // Mantener signo del VPN
    }
};