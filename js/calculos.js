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
        if (!Number.isFinite(inversionInicial)) {
            return NaN;
        }

        if (!Array.isArray(flujosEfectivo) || flujosEfectivo.length === 0) {
            return NaN;
        }

        if (!Number.isFinite(tasaDescuento)) {
            return NaN;
        }

        let vpn = -Math.abs(inversionInicial);

        for (let t = 1; t <= flujosEfectivo.length; t++) {
            const flujo = Number(flujosEfectivo[t - 1]) || 0;
            vpn += flujo / Math.pow(1 + tasaDescuento, t);
        }

        return vpn;
    },

    /**
     * Calcula el Costo Anual Equivalente (CAE).
     * @param {number} vpn - Valor presente neto.
     * @param {number} tasaDescuento - Tasa de descuento en decimal.
     * @param {number} periodos - Número de periodos.
     * @returns {number} El CAE calculado.
     */
    calcularCAE: function(vpn, tasaDescuento, periodos) {
        if (!Number.isFinite(vpn) || !Number.isFinite(tasaDescuento) || !Number.isFinite(periodos) || periodos <= 0) {
            return NaN;
        }

        if (tasaDescuento === 0) {
            return vpn / periodos;
        }

        const factor = Math.pow(1 + tasaDescuento, periodos);
        const denominador = factor - 1;

        if (denominador === 0) {
            return NaN;
        }

        return vpn * (tasaDescuento * factor) / denominador;
    },

    /**
     * Calcula la Tasa Interna de Retorno (TIR).
     * @param {number} inversionInicial - Inversión inicial.
     * @param {array} flujosEfectivo - Arreglo de flujos por año.
     * @returns {number} La TIR en porcentaje.
     */
    calcularTIR: function(inversionInicial, flujosEfectivo) {
        if (!Number.isFinite(inversionInicial) || !Array.isArray(flujosEfectivo) || flujosEfectivo.length === 0) {
            return NaN;
        }

        const flujos = [-Math.abs(inversionInicial), ...flujosEfectivo.map(f => Number(f) || 0)];

        const vpn = (tasa) => {
            let suma = 0;
            for (let t = 0; t < flujos.length; t++) {
                suma += flujos[t] / Math.pow(1 + tasa, t);
            }
            return suma;
        };

        const derivadaVpn = (tasa) => {
            let suma = 0;
            for (let t = 1; t < flujos.length; t++) {
                suma -= (t * flujos[t]) / Math.pow(1 + tasa, t + 1);
            }
            return suma;
        };

        let tir = 0.1;
        const maxIteraciones = 100;
        const tolerancia = 0.0001;

        for (let i = 0; i < maxIteraciones; i++) {
            const vpnVal = vpn(tir);
            if (Math.abs(vpnVal) < tolerancia) {
                return tir * 100;
            }

            const vpnDer = derivadaVpn(tir);
            if (Math.abs(vpnDer) < 1e-10) {
                return NaN;
            }

            tir = tir - vpnVal / vpnDer;

            if (tir < -0.99) tir = -0.99;
            if (tir > 10) tir = 10;
        }

        return tir * 100;
    }
};