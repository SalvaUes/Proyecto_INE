/* ==========================================================================
   DEV 2 (El Cerebro - Logica Pura): 
   CERO HTML AQUI. Tu trabajo es recibir numeros, aplicar las formulas financieras 
   y devolver el resultado exacto. Si te mandan letras por error, manejalo.
   ========================================================================== */

const CalculosEconomicos = {
    
    /**
     * Calcula el Valor Presente Neto (VPN)
     * @param {number} inversionInicial - Costo en el año 0 (debe ser negativo o restarse)
     * @param {array} flujosEfectivo - Arreglo con los flujos de cada año [año1, año2, ...]
     * @param {number} tasaDescuento - Tasa en decimal (ej: 0.15 para 15%)
     * @returns {number} El resultado del VPN
     */
    calcularVPN: function(inversionInicial, flujosEfectivo, tasaDescuento) {
        let vpn = 0; // DEV 2: Aqui va tu formula matematica
        return vpn;
    },

    /**
     * Calcula el Costo Anual Equivalente (CAE)
     * @returns {number} El resultado del CAE
     */
    calcularCAE: function() {
        let cae = 0; // DEV 2: Aqui va tu formula matematica
        return cae;
    },

    /**
     * Calcula la Tasa Interna de Retorno (TIR)
     * @returns {number} El resultado de la TIR en porcentaje
     */
    calcularTIR: function() {
        let tir = 0; // DEV 2: Aqui va tu algoritmo para la TIR
        return tir;
    }
};