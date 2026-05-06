/* ==========================================================================
   DEV 2 (El Cerebro - Logica Pura): 
   CERO HTML AQUI. Tu trabajo es recibir numeros, aplicar las formulas financieras 
   y devolver el resultado exacto. Si te mandan letras por error, manejalo.
   ========================================================================== */

const CalculosEconomicos = {

    /**
     * Calcula el Valor Presente Neto (VPN / NPV).
     * @param {number} inversionInicial - Costo en el año 0 (número positivo que se resta).
     * @param {number[]} flujosEfectivo - Arreglo con los flujos de cada año [año1, año2, ...].
     * @param {number} tasaDescuento - Tasa de descuento en decimal (ej: 0.15 para 15%).
     * @returns {number} El resultado del VPN. Retorna NaN si algún dato no es válido.
     */
    calcularVPN: function(inversionInicial, flujosEfectivo, tasaDescuento) {
        // Validación de tipos: si no son números, devolvemos NaN
        if (typeof inversionInicial !== 'number' || isNaN(inversionInicial)) return NaN;
        if (!Array.isArray(flujosEfectivo)) return NaN;
        if (typeof tasaDescuento !== 'number' || isNaN(tasaDescuento)) return NaN;

        // Verificar que todos los flujos sean números
        for (let flujo of flujosEfectivo) {
            if (typeof flujo !== 'number' || isNaN(flujo)) return NaN;
        }

        let vpn = -inversionInicial; // Costo en t=0

        for (let i = 0; i < flujosEfectivo.length; i++) {
            // El flujo del año (i+1) se descuenta con exponente (i+1)
            vpn += flujosEfectivo[i] / Math.pow(1 + tasaDescuento, i + 1);
        }

        return vpn;
    },

    /**
     * Calcula el Costo Anual Equivalente (CAE).
     * Convierte un valor presente en una anualidad constante durante n períodos.
     * @param {number} valorPresenteNeto - Valor presente de los costos (puede obtenerse con calcularVPN).
     * @param {number} numeroPeriodos - Cantidad de períodos (vida útil).
     * @param {number} tasaDescuento - Tasa de descuento en decimal (ej: 0.15 para 15%).
     * @returns {number} El CAE. Si la tasa es 0, retorna valorPresenteNeto/numeroPeriodos.
     *                   Retorna NaN si hay datos inválidos.
     */
    calcularCAE: function(valorPresenteNeto, numeroPeriodos, tasaDescuento) {
        // Validación
        if (typeof valorPresenteNeto !== 'number' || isNaN(valorPresenteNeto)) return NaN;
        if (typeof numeroPeriodos !== 'number' || isNaN(numeroPeriodos) || numeroPeriodos <= 0) return NaN;
        if (typeof tasaDescuento !== 'number' || isNaN(tasaDescuento)) return NaN;

        // Caso particular: tasa = 0 => cuota simple
        if (tasaDescuento === 0) {
            return valorPresenteNeto / numeroPeriodos;
        }

        // Factor de anualidad:  r*(1+r)^n / ((1+r)^n - 1)
        const factor = Math.pow(1 + tasaDescuento, numeroPeriodos);
        const cae = valorPresenteNeto * (tasaDescuento * factor) / (factor - 1);

        return cae;
    },

    /**
     * Calcula la Tasa Interna de Retorno (TIR / IRR) usando el método de Newton-Raphson.
     * @param {number[]} flujosCompletos - Arreglo con todos los flujos de caja:
     *        el primer elemento debe ser la inversión inicial (negativo),
     *        seguido de los flujos netos de cada período (positivos o negativos).
     * @param {number} [precision=0.00001] - Tolerancia para detener la iteración.
     * @param {number} [maxIter=1000] - Máximo de iteraciones permitidas.
     * @returns {number} La TIR expresada en **porcentaje** (ej: 15.2 para 15.2%).
     *                   Retorna NaN si los datos no son válidos o no converge.
     */
    calcularTIR: function(flujosCompletos, precision = 0.00001, maxIter = 1000) {
        // Validación de entrada
        if (!Array.isArray(flujosCompletos) || flujosCompletos.length < 2) return NaN;
        for (let flujo of flujosCompletos) {
            if (typeof flujo !== 'number' || isNaN(flujo)) return NaN;
        }

        // Función que calcula el VPN para una tasa r dada
        const vpn = (r) => {
            let total = 0;
            for (let t = 0; t < flujosCompletos.length; t++) {
                total += flujosCompletos[t] / Math.pow(1 + r, t);
            }
            return total;
        };

        // Derivada del VPN respecto a r
        const derivadaVpn = (r) => {
            let total = 0;
            for (let t = 0; t < flujosCompletos.length; t++) {
                total -= (t * flujosCompletos[t]) / Math.pow(1 + r, t + 1);
            }
            return total;
        };

        // Semilla inicial
        let r = 0.1; // 10% como punto de partida
        let iter = 0;

        while (iter < maxIter) {
            const f = vpn(r);
            const fPrime = derivadaVpn(r);

            // Si la derivada es muy pequeña, evitamos división por cero
            if (Math.abs(fPrime) < 1e-10) {
                // Podríamos intentar otra semilla, pero devolvemos NaN
                return NaN;
            }

            const rNuevo = r - f / fPrime;

            // Si la diferencia es menor que la precisión, terminamos
            if (Math.abs(rNuevo - r) < precision) {
                // Retornamos la tasa en porcentaje
                return rNuevo * 100;
            }

            r = rNuevo;
            iter++;
        }

        // Si no converge, devolvemos NaN
        return NaN;
    }
};