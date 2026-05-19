/* ============================================================
 * SEAE - calculos.js
 * Módulo de cálculos financieros - Objeto global Finanzas
 * Compatible con interfaz.js
 * ============================================================ */

const Finanzas = {

  /**
   * Calcula el Valor Presente Neto (VPN)
   * @param {Object} datos - { costo, tasa, flujos, vida, salvamento }
   * @returns {number} VPN calculado
   */
  vpn: (datos) => {
    const costo = Number(datos.costo) || 0;
    const tasa = (Number(datos.tasa) || 0) / 100;
    const flujos = Array.isArray(datos.flujos) ? datos.flujos : [];
    const vida = Number(datos.vida) || flujos.length;
    const salvamento = Number(datos.salvamento) || 0;

    let vpn = -costo;
    
    flujos.forEach((flujo, idx) => {
      const periodo = idx + 1;
      vpn += Number(flujo) / Math.pow(1 + tasa, periodo);
    });
    
    vpn += salvamento / Math.pow(1 + tasa, vida);
    return vpn;
  },

  /**
   * Calcula el Costo Anual Equivalente (CAE)
   * Detecta automáticamente el tipo de proyecto:
   * - Proyectos CON INGRESOS: CAE = VPN × (A/P,i%,n)
   * - Proyectos SOLO COSTOS: CAE = COA + I×(A/P,i%,n) - S×(A/F,i%,n)
   * @param {Object} datos - { costo, tasa, flujos, vida, salvamento }
   * @returns {number} CAE calculado
   */
  cae: (datos) => {
    const costo = Number(datos.costo) || 0;
    const tasa = (Number(datos.tasa) || 0) / 100;
    const vida = Number(datos.vida) || (Array.isArray(datos.flujos) ? datos.flujos.length : 1);
    const salvamento = Number(datos.salvamento) || 0;
    const flujos = Array.isArray(datos.flujos) ? datos.flujos : [];

    if (tasa === 0) {
      // Si tasa es 0, usar fórmula simplificada (respetando salidas de dinero negativas)
      const sumaFlujos = flujos.reduce((sum, f) => sum + Number(f), 0);
      const coaAnual = flujos.length > 0 ? sumaFlujos / flujos.length : sumaFlujos;
      return coaAnual - (costo / vida) + (salvamento / vida);
    }

    // Detectar si hay flujos positivos (ingresos) o si es un proyecto de solo costos
    const sumaFlujos = flujos.reduce((sum, f) => sum + Number(f), 0);
    const hayIngresos = sumaFlujos > 0; // Si la suma de flujos es positiva, hay ingresos

    // Factor de Recuperación de Capital (A/P,i%,n)
    const frc = (tasa * Math.pow(1 + tasa, vida)) / (Math.pow(1 + tasa, vida) - 1);

    if (hayIngresos) {
      // CASO 1: Proyecto con INGRESOS - Usar método VPN convertido a anualidad
      const vpn = Finanzas.vpn(datos);
      return vpn * frc;
    } else {
      // CASO 2: Proyecto de SOLO COSTOS - Modificado para retornar en negativo (salidas de efectivo)
      // Se promedian los flujos (que ya vienen negativos desde la interfaz)
      const coaAnual = flujos.length > 0 ? sumaFlujos / flujos.length : sumaFlujos;
      
      // Factor de Fondo de Amortización (A/F,i%,n)
      const ffa = tasa / (Math.pow(1 + tasa, vida) - 1);

      // Al ser egresos: El costo inicial resta, el COA resta y el salvamento suma.
      return coaAnual - (costo * frc) + (salvamento * ffa);
    }
  },

  /**
   * Calcula la Tasa Interna de Retorno (TIR)
   * @param {Object} datos - { costo, flujos, vida, salvamento }
   * @returns {number|null} TIR en porcentaje o null si no converge
   */
  tir: (datos) => {
    const costo = Number(datos.costo) || 0;
    const flujos = Array.isArray(datos.flujos) ? datos.flujos : [];
    const vida = Number(datos.vida) || flujos.length;
    const salvamento = Number(datos.salvamento) || 0;
    // Si no hay flujos positivos, no existe TIR significativa
    const anyPositive = flujos.some(f => Number(f) > 0) || salvamento > 0;
    if (!anyPositive) return null;

    const getNPV = (rate) => {
      if (rate <= -1) return NaN; // tasa inválida
      let val = -costo;
      for (let idx = 0; idx < flujos.length; idx++) {
        val += Number(flujos[idx]) / Math.pow(1 + rate, idx + 1);
      }
      val += salvamento / Math.pow(1 + rate, vida);
      return val;
    };

    // Bracketing: expandir límite superior hasta encontrar cambio de signo
    let lower = -0.999999; // limite inferior cercano a -1
    let upper = 0.1; // empezar con 10%
    let fLow = getNPV(lower);
    let fUp = getNPV(upper);

    let expandIter = 0;
    while (isFinite(fLow) && isFinite(fUp) && fLow * fUp > 0 && expandIter < 100) {
      upper *= 2;
      fUp = getNPV(upper);
      expandIter++;
    }

    if (!isFinite(fLow) || !isFinite(fUp) || fLow * fUp > 0) {
      // No fue posible acotar la raíz
      return null;
    }

    // Bisección
    let a = lower, b = upper, c = a;
    for (let i = 0; i < 200; i++) {
      c = (a + b) / 2;
      const fc = getNPV(c);
      if (!isFinite(fc)) return null;
      if (Math.abs(fc) < 1e-7) return c * 100;
      const fa = getNPV(a);
      if (fa * fc < 0) b = c; else a = c;
    }

    return ((a + b) / 2) * 100;
  },

  /**
   * Determina si el proyecto es aceptable según el método
   * @param {string} metodo - "VPN", "CAE" o "TIR"
   * @param {number} valor - Resultado del cálculo
   * @param {number} umbral - Tasa de referencia (para TIR)
   * @returns {Object} { ok: boolean, texto: string }
   */
  decidir: (metodo, valor, umbral) => {
    if (valor === null || valor === undefined || isNaN(valor)) {
      return { ok: false, texto: "Error de cálculo" };
    }

    switch (metodo) {
      case "VPN":
      case "CAE":
        const aceptado = valor >= 0;
        return {
          ok: aceptado,
          texto: aceptado ? "Aceptar" : "Rechazar"
        };
      case "TIR":
        const tasaRef = Number(umbral) || 0;
        const supera = valor >= tasaRef;
        return {
          ok: supera,
          texto: supera ? "Aceptar" : "Rechazar"
        };
      default:
        return { ok: false, texto: "Método desconocido" };
    }
  }

};