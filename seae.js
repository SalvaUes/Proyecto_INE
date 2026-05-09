'use strict';
const $=id=>document.getElementById(id);
const fmt$=v=>isFinite(v)?v.toLocaleString('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2}):'N/A';
const fmtP=v=>isFinite(v)?(v*100).toFixed(2)+'%':'N/A';
const fmtN=(v,d=4)=>isFinite(v)?v.toFixed(d):'N/A';
function toast(msg,err=false){
  $('tio').textContent=err?'❌':'✅';
  $('tmg').textContent=msg;
  $('toast').classList.add('on');
  setTimeout(()=>$('toast').classList.remove('on'),3500);
}

/* ── OJO PASSWORD ── */
$('eye-btn').addEventListener('click',()=>{
  const inp=$('lp');
  const showing=inp.type==='text';
  inp.type=showing?'password':'text';
  $('eye-btn').textContent=showing?'👁':'🙈';
});

/* ── ESTADO ── */
let MOD='vpn';
let NALTS=3;
let RES={};

const ALT_IDS=['a','b','c','d'];
const ALT_COLORS=['#1e3a8a','#b45309','#166534','#7c3aed'];
const ALT_PH={
  a:{name:'Ej: Compra de maquinaria',    flu:'15000, 18000, 20000'},
  b:{name:'Ej: Arrendamiento de equipo', flu:'12000, 15000, 17000'},
  c:{name:'Ej: Construcción propia',     flu:'10000, 13000, 16000'},
  d:{name:'Ej: Proyecto alternativo D',  flu:'11000, 14000, 18000'},
};

/* ── LOGIN ── */
const doLogin=()=>{
  if($('lu').value.trim()==='admin'&&$('lp').value==='1234'){
    $('ls').classList.add('h');
    $('app').classList.add('vis');
    buildAllForms();
  }else{
    $('lerr').classList.add('on');
    $('lp').value='';$('lp').focus();
    setTimeout(()=>$('lerr').classList.remove('on'),3000);
  }
};
$('btn-li').addEventListener('click',doLogin);
['lu','lp'].forEach(id=>$(id).addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();}));
$('btn-out').addEventListener('click',()=>{
  $('ls').classList.remove('h');$('app').classList.remove('vis');
  $('lu').value='';$('lp').value='';$('lp').type='password';$('eye-btn').textContent='👁';
});

/* ── CONSTRUIR FORMULARIOS ── */
/*
  CAMPOS POR MÓDULO — sin opciones de contado/crédito:
  VPN / VAN: inversión, tasa TMAR, vida útil, salvamento, flujos anuales
  CAE:       inversión, tasa TMAR, vida útil, salvamento, flujos anuales
             (el CAE se calcula a partir del VPN)
  TIR:       inversión, TMAR (referencia), flujos anuales
*/
function buildForm(mod,altId){
  const cls={a:'fca',b:'fcb',c:'fcc',d:'fcd'}[altId];
  const ph=ALT_PH[altId];
  const isTIR=mod==='tir';
  let html=`<div class="fc ${cls}" id="fc-${mod}-${altId}">
    <div class="fch">
      <div class="adot ${altId}">${altId.toUpperCase()}</div>
      <div class="fmeta">
        <span class="lbl">Nombre del proyecto</span>
        <input class="inn" id="${mod}-nom-${altId}" type="text" placeholder="${ph.name}"/>
      </div>
    </div>
    <div class="fgrid">`;

  /* Inversión Inicial */
  html+=field(`${mod}-inv-${altId}`,'Inversión Inicial (I₀)','$','left','number','0.00','requerido');

  /* Tasa */
  if(isTIR){
    html+=field(`${mod}-tmar-${altId}`,'Tasa Mín. Aceptable (TMAR)','%','right','number','0.00','referencia');
  }else{
    html+=field(`${mod}-tasa-${altId}`,'Tasa de Descuento (TMAR)','%','right','number','0.00','requerido');
  }

  /* Vida útil — no en TIR */
  if(!isTIR){
    html+=field(`${mod}-vida-${altId}`,'Vida Útil del Proyecto','años','right','number','0','requerido');
  }

  /* Salvamento — no en TIR */
  if(!isTIR){
    html+=field(`${mod}-sal-${altId}`,'Valor de Salvamento','$','left','number','0.00','opcional');
  }

  /* Flujos */
  html+=`<div class="f full">
    <label for="${mod}-flu-${altId}">Flujos de Caja Anuales <span class="hint">separados por coma${isTIR?' · incluye salvamento en último período':''}</span></label>
    <div class="iw" id="iw-${mod}-flu-${altId}">
      <span class="sym">$</span>
      <input class="fin" id="${mod}-flu-${altId}" type="text" placeholder="${ph.flu}"/>
    </div>
  </div>`;

  html+=`</div></div>`;
  return html;
}

function field(id,label,sym,pos,type,ph,hint){
  const symLeft=pos==='left';
  return `<div class="f">
    <label for="${id}">${label} <span class="hint">${hint}</span></label>
    <div class="iw" id="iw-${id}">
      ${symLeft?`<span class="sym">${sym}</span>`:''}
      <input class="fin" id="${id}" type="${type}" placeholder="${ph}" ${type==='number'?'step="any"':''}/>
      ${!symLeft?`<span class="sym r">${sym}</span>`:''}
    </div>
  </div>`;
}

function buildAllForms(){
  ['vpn','cae','tir','van'].forEach(m=>{
    const col=$(` #fcol-${m}`)||document.getElementById(`fcol-${m}`);
    if(!col)return;
    Array.from(col.querySelectorAll('.fc')).forEach(el=>el.remove());
    ALT_IDS.slice(0,NALTS).forEach(id=>col.insertAdjacentHTML('beforeend',buildForm(m,id)));
  });
}

/* ── TABS ── */
document.querySelectorAll('.mtab').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.mtab,.mtb').forEach(x=>x.classList.remove('on'));
    document.querySelectorAll('.mod').forEach(x=>x.classList.remove('on'));
    t.classList.add('on');
    MOD=t.dataset.m;
    document.getElementById(`mod-${MOD}`)?.classList.add('on');
    document.querySelector(`.mtb[data-mod="${MOD}"]`)?.classList.add('on');
    $('blbl').textContent={vpn:'VPN activo',cae:'CAE activo',tir:'TIR activo',van:'VAN activo'}[MOD];
  });
});
document.querySelectorAll('.mtb').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.mtab,.mtb').forEach(x=>x.classList.remove('on'));
    document.querySelectorAll('.mod').forEach(x=>x.classList.remove('on'));
    t.classList.add('on');
    MOD=t.dataset.mod;
    document.getElementById(`mod-${MOD}`)?.classList.add('on');
    document.querySelector(`.mtab[data-m="${MOD}"]`)?.classList.add('on');
    $('blbl').textContent={vpn:'VPN activo',cae:'CAE activo',tir:'TIR activo',van:'VAN activo'}[MOD];
  });
});
document.querySelectorAll('.atab').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.atab').forEach(x=>x.classList.remove('on'));
    t.classList.add('on');
    NALTS=parseInt(t.dataset.n);
    buildAllForms();
  });
});

/* ── CÁLCULOS ── */
const pF=str=>(!str||!str.trim())?[]:str.split(',').map(s=>parseFloat(s.trim())).filter(n=>!isNaN(n));

/* VPN = −I + Σ Ft/(1+i)^t */
function calcVPN(I,i,flujos){
  if(flujos.length===0)return NaN;
  return flujos.reduce((s,f,t)=>s+f/Math.pow(1+i,t+1),-I);
}

/* CAE = VPN × FRC   donde FRC = i(1+i)^n / ((1+i)^n − 1) */
function calcCAE(vpn,i,n){
  if(n<=0)return NaN;
  if(Math.abs(i)<1e-12)return vpn/n;          // caso i=0: CAE = VPN/n
  const frc=(i*Math.pow(1+i,n))/(Math.pow(1+i,n)-1);
  return vpn*frc;
}

/* Factor FRC (para mostrar en tabla) */
function frc(i,n){
  if(n<=0)return NaN;
  if(Math.abs(i)<1e-12)return 1/n;
  return(i*Math.pow(1+i,n))/(Math.pow(1+i,n)-1);
}

/* TIR — bisección robusta */
function calcTIR(I,flujos){
  if(!flujos.length)return null;
  const fn=r=>flujos.reduce((s,f,t)=>s+f/Math.pow(1+r,t+1),-I);
  let lo=-0.9999,hi=10;
  if(Math.sign(fn(lo))===Math.sign(fn(hi))){
    let found=false;
    for(let r=-0.9;r<=10;r+=0.005){
      if(Math.sign(fn(r))!==Math.sign(fn(r+0.005))){lo=r;hi=r+0.005;found=true;break;}
    }
    if(!found)return null;
  }
  for(let k=0;k<2000;k++){
    const m=(lo+hi)/2,fm=fn(m);
    if(Math.abs(fm)<1e-9||(hi-lo)/2<1e-10)return m;
    fn(lo)*fm<0?(hi=m):(lo=m);
  }
  return(lo+hi)/2;
}

/* ── LEER DATOS ── */
function readAlt(mod,altId){
  const g=fid=>{const el=$(fid);return el?parseFloat(el.value):NaN;};
  const s=fid=>{const el=$(fid);return el?el.value.trim():'';};
  const clrE=fid=>document.getElementById(`iw-${fid}`)?.classList.remove('err');
  const setE=fid=>document.getElementById(`iw-${fid}`)?.classList.add('err');
  let errs=[];

  const nom=s(`${mod}-nom-${altId}`)||`Alternativa ${altId.toUpperCase()}`;

  if(mod==='tir'){
    const inv=g(`${mod}-inv-${altId}`);
    const tmar=g(`${mod}-tmar-${altId}`)/100;
    const flu=pF(s(`${mod}-flu-${altId}`));
    [`${mod}-inv-${altId}`,`${mod}-tmar-${altId}`,`${mod}-flu-${altId}`].forEach(clrE);
    if(!(inv>0)){setE(`${mod}-inv-${altId}`);errs.push('inv');}
    if(!isFinite(tmar)){setE(`${mod}-tmar-${altId}`);errs.push('tmar');}
    if(!flu.length){setE(`${mod}-flu-${altId}`);errs.push('flu');}
    return{valido:!errs.length,datos:{nombre:nom,inv,tmar,flujos:flu},errores:errs};
  }

  /* vpn, cae, van */
  const inv=g(`${mod}-inv-${altId}`);
  const tasa=g(`${mod}-tasa-${altId}`)/100;
  const vida=Math.round(g(`${mod}-vida-${altId}`));
  const sal=isFinite(g(`${mod}-sal-${altId}`))?g(`${mod}-sal-${altId}`):0;
  let flujos=pF(s(`${mod}-flu-${altId}`));

  [`${mod}-inv-${altId}`,`${mod}-tasa-${altId}`,`${mod}-vida-${altId}`,`${mod}-flu-${altId}`].forEach(clrE);
  if(!(inv>0)){setE(`${mod}-inv-${altId}`);errs.push('inv');}
  if(!isFinite(tasa)||tasa<0){setE(`${mod}-tasa-${altId}`);errs.push('tasa');}
  if(!(vida>=1)){setE(`${mod}-vida-${altId}`);errs.push('vida');}
  if(!flujos.length){setE(`${mod}-flu-${altId}`);errs.push('flu');}

  /* Agregar salvamento al último flujo */
  if(flujos.length&&sal!==0){
    flujos=[...flujos];
    flujos[flujos.length-1]+=sal;
  }
  /* Completar hasta vida si faltan períodos */
  if(flujos.length&&flujos.length<vida){
    const ult=flujos[flujos.length-1];
    while(flujos.length<vida)flujos.push(ult);
  }
  return{valido:!errs.length,datos:{nombre:nom,inv,tasa,vida,sal,flujos},errores:errs};
}

/* ── TABLA ANUAL ── */
function buildTblAnual(datos){
  const{inv,tasa,flujos}=datos;
  let html=`<thead><tr>
    <th>Período</th><th>Flujo de Caja ($)</th>
    <th>Factor (1+i)^t</th><th>Valor Presente ($)</th><th>VP Acumulado ($)</th>
  </tr></thead><tbody>`;
  html+=`<tr><td>0 — Inversión</td><td class="nv">-${fmt$(inv)}</td><td>1.0000</td><td class="nv">-${fmt$(inv)}</td><td class="nv">-${fmt$(inv)}</td></tr>`;
  let ac=-inv;
  flujos.forEach((f,idx)=>{
    const t=idx+1,fac=Math.pow(1+tasa,t),vp=f/fac;
    ac+=vp;
    html+=`<tr><td>${t}</td>
      <td class="${f>=0?'pv':'nv'}">${fmt$(f)}</td>
      <td>${fac.toFixed(4)}</td>
      <td class="${vp>=0?'pv':'nv'}">${fmt$(vp)}</td>
      <td class="${ac>=0?'pv':'nv'}">${fmt$(ac)}</td>
    </tr>`;
  });
  const totalVP=flujos.reduce((s,f,t)=>s+f/Math.pow(1+tasa,t+1),0);
  html+=`<tr class="tot"><td>TOTAL</td><td></td><td></td>
    <td>${fmt$(totalVP)}</td>
    <td class="${-inv+totalVP>=0?'pv':'nv'}">${fmt$(-inv+totalVP)}</td>
  </tr></tbody>`;
  return html;
}

function buildTblTIR(datos,tir){
  const{inv,flujos}=datos;
  const fn=r=>flujos.reduce((s,f,t)=>s+f/Math.pow(1+r,t+1),-inv);
  const tasas=[0,0.05,0.10,0.15,0.20,0.25,0.30];
  if(tir!==null&&!tasas.some(t=>Math.abs(t-tir)<0.001)){tasas.push(tir);tasas.sort((a,b)=>a-b);}
  let html=`<thead><tr><th>Tasa de Descuento</th><th>VPN ($)</th><th>Interpretación</th></tr></thead><tbody>`;
  tasas.forEach(r=>{
    const v=fn(r),isTIR=tir!==null&&Math.abs(r-tir)<0.001;
    html+=`<tr style="${isTIR?'background:#fdf6e3;font-weight:700':''}">
      <td>${isTIR?'⭐ ':''}${(r*100).toFixed(2)}%${isTIR?' (TIR)':''}</td>
      <td class="${v>=0?'pv':'nv'}">${fmt$(v)}</td>
      <td>${v>1?'VPN positivo — proyecto viable':v===0?'VPN nulo — punto de indiferencia':'VPN negativo — no viable a esta tasa'}</td>
    </tr>`;
  });
  html+=`</tbody>`;return html;
}

/* ── TABLA COMPARATIVA ── */
function buildCtbl(lista,mod){
  const cc=['ta','tb','tc2','td2'];
  let head=`<thead><tr><th>Indicador</th>${lista.map(r=>`<th>${r.datos.nombre}</th>`).join('')}<th>Mejor</th></tr></thead>`;
  let body='<tbody>';

  if(mod==='vpn'||mod==='van'){
    const bVPN=lista.reduce((m,r)=>r.vpn>m.vpn?r:m,lista[0]);
    const bCAE=lista.reduce((m,r)=>r.cae>m.cae?r:m,lista[0]);
    const ctTIR=lista.filter(r=>r.tir!==null);
    body+=`<tr class="rw"><td class="ti">${mod.toUpperCase()} ($)</td>${lista.map((r,i)=>`<td class="${cc[i]}">${fmt$(r.vpn)}</td>`).join('')}<td>🏆 ${bVPN.datos.nombre}</td></tr>`;
    body+=`<tr><td class="ti">CAE ($)</td>${lista.map((r,i)=>`<td class="${cc[i]}">${fmt$(r.cae)}</td>`).join('')}<td>🏆 ${bCAE.datos.nombre}</td></tr>`;
    body+=`<tr><td class="ti">TIR</td>${lista.map(r=>`<td>${r.tir!==null?fmtP(r.tir):'N/A'}</td>`).join('')}<td>${ctTIR.length?'🏆 '+ctTIR.reduce((m,r)=>r.tir>m.tir?r:m,ctTIR[0]).datos.nombre:'—'}</td></tr>`;
    body+=`<tr><td class="ti">VP Total Flujos ($)</td>${lista.map((r,i)=>`<td class="${cc[i]}">${fmt$(r.vpn+r.datos.inv)}</td>`).join('')}<td>—</td></tr>`;
    body+=`<tr><td class="ti">Inversión ($)</td>${lista.map((r,i)=>`<td class="${cc[i]}">${fmt$(r.datos.inv)}</td>`).join('')}<td>↓ Menor: ${lista.reduce((m,r)=>r.datos.inv<m.datos.inv?r:m,lista[0]).datos.nombre}</td></tr>`;
    body+=`<tr><td class="ti">Vida Útil</td>${lista.map(r=>`<td>${r.datos.vida} años</td>`).join('')}<td>—</td></tr>`;
    body+=`<tr><td class="ti">Decisión</td>${lista.map((r,i)=>`<td class="${cc[i]}">${r.vpn>0?'✅ Aceptar':'❌ Rechazar'}</td>`).join('')}<td>🏆 ${bVPN.datos.nombre}</td></tr>`;
  }
  if(mod==='cae'){
    const bCAE=lista.reduce((m,r)=>r.cae>m.cae?r:m,lista[0]);
    const bVPN=lista.reduce((m,r)=>r.vpn>m.vpn?r:m,lista[0]);
    body+=`<tr class="rw"><td class="ti">CAE ($)</td>${lista.map((r,i)=>`<td class="${cc[i]}">${fmt$(r.cae)}</td>`).join('')}<td>🏆 ${bCAE.datos.nombre}</td></tr>`;
    body+=`<tr><td class="ti">VPN ($)</td>${lista.map((r,i)=>`<td class="${cc[i]}">${fmt$(r.vpn)}</td>`).join('')}<td>🏆 ${bVPN.datos.nombre}</td></tr>`;
    body+=`<tr><td class="ti">Factor FRC</td>${lista.map(r=>`<td>${fmtN(r.frcVal)}</td>`).join('')}<td>—</td></tr>`;
    body+=`<tr><td class="ti">Inversión ($)</td>${lista.map((r,i)=>`<td class="${cc[i]}">${fmt$(r.datos.inv)}</td>`).join('')}<td>—</td></tr>`;
    body+=`<tr><td class="ti">Vida Útil</td>${lista.map(r=>`<td>${r.datos.vida} años</td>`).join('')}<td>—</td></tr>`;
    body+=`<tr><td class="ti">Decisión</td>${lista.map((r,i)=>`<td class="${cc[i]}">${r.cae>0?'✅ Aceptar':'❌ Rechazar'}</td>`).join('')}<td>🏆 ${bCAE.datos.nombre}</td></tr>`;
  }
  if(mod==='tir'){
    const ctTIR=lista.filter(r=>r.tir!==null);
    const bTIR=ctTIR.length?ctTIR.reduce((m,r)=>r.tir>m.tir?r:m,ctTIR[0]):lista[0];
    body+=`<tr class="rw"><td class="ti">TIR (%)</td>${lista.map((r,i)=>`<td class="${cc[i]}">${r.tir!==null?fmtP(r.tir):'N/A'}</td>`).join('')}<td>${ctTIR.length?'🏆 '+bTIR.datos.nombre:'—'}</td></tr>`;
    body+=`<tr><td class="ti">TMAR (%)</td>${lista.map(r=>`<td>${fmtP(r.datos.tmar)}</td>`).join('')}<td>—</td></tr>`;
    body+=`<tr><td class="ti">Margen TIR−TMAR</td>${lista.map((r,i)=>`<td class="${cc[i]}">${r.tir!==null?fmtP(r.tir-r.datos.tmar):'N/A'}</td>`).join('')}<td>—</td></tr>`;
    body+=`<tr><td class="ti">VPN @ TMAR</td>${lista.map(r=>`<td>${fmt$(r.vpnAtTmar)}</td>`).join('')}<td>—</td></tr>`;
    body+=`<tr><td class="ti">Decisión</td>${lista.map((r,i)=>`<td class="${cc[i]}">${r.tir!==null&&r.tir>r.datos.tmar?'✅ Aceptar':'❌ Rechazar'}</td>`).join('')}<td>${ctTIR.length&&bTIR.tir>bTIR.datos.tmar?'🏆 '+bTIR.datos.nombre:'Ninguna viable'}</td></tr>`;
  }
  body+='</tbody>';
  return head+body;
}

/* ── ANÁLISIS PROFESIONAL ── */
function buildAnalisis(lista,mod){
  const metNom={vpn:'Valor Presente Neto (VPN)',cae:'Costo Anual Equivalente (CAE)',tir:'Tasa Interna de Retorno (TIR)',van:'Valor Actual Neto (VAN)'}[mod];
  const esViable=r=>{
    if(mod==='vpn'||mod==='van')return r.vpn>0;
    if(mod==='cae')return r.cae>0;
    if(mod==='tir')return r.tir!==null&&r.tir>r.datos.tmar;
  };
  const viables=lista.filter(esViable);
  const noViables=lista.filter(r=>!esViable(r));

  /* Caso: ninguna viable */
  if(!viables.length){
    const peores=lista.map(r=>({r,v:mod==='tir'?(r.tir??-Infinity):(mod==='cae'?r.cae:r.vpn)})).sort((a,b)=>b.v-a.v);
    const menos=peores[0].r;
    return `<div class="aw-none"><p>
      <strong>⚠ Ninguna alternativa es financieramente viable bajo el método ${metNom}.</strong><br/><br/>
      Con base en el análisis cuantitativo, las ${lista.length} alternativas evaluadas presentan valores por debajo del umbral de aceptación.
      ${mod==='tir'?`Ninguna TIR supera la TMAR mínima requerida del ${fmtP(lista[0].datos.tmar)}.`:
        mod==='cae'?'Todos los CAE calculados son negativos, indicando que los costos superan los beneficios en términos anuales equivalentes.':
        'Todos los VPN son negativos, lo que implica que ninguna alternativa recupera la inversión inicial a la tasa de descuento establecida.'}
      <br/><br/>
      <strong>Recomendación:</strong> Revise los supuestos de flujos de caja, renegocie las condiciones de financiamiento o evalúe reducir la tasa mínima de retorno requerida.
      La alternativa menos desfavorable es <strong>${menos.datos.nombre}</strong>
      ${mod==='vpn'||mod==='van'?` con VPN = ${fmt$(menos.vpn)}`:mod==='cae'?` con CAE = ${fmt$(menos.cae)}`:` con TIR = ${menos.tir!==null?fmtP(menos.tir):'N/A'}`}.
    </p></div>
    <div class="ar"><p>
      ${lista.map(r=>{
        const v=mod==='vpn'||mod==='van'?`VPN = ${fmt$(r.vpn)}`:mod==='cae'?`CAE = ${fmt$(r.cae)}`:`TIR = ${r.tir!==null?fmtP(r.tir):'Indeterminada'}`;
        return `• <strong>${r.datos.nombre}:</strong> ${v} — ❌ No viable`;
      }).join('<br/>')}
    </p></div>`;
  }

  /* Mejor alternativa */
  let mejor;
  if(mod==='vpn'||mod==='van') mejor=viables.reduce((m,r)=>r.vpn>m.vpn?r:m,viables[0]);
  else if(mod==='cae')         mejor=viables.reduce((m,r)=>r.cae>m.cae?r:m,viables[0]);
  else mejor=viables.sort((a,b)=>b.tir-a.tir)[0];

  /* Razonamiento profesional */
  let razon='';
  if(mod==='vpn'||mod==='van'){
    const v=mejor.vpn;
    const label=mod.toUpperCase();
    const seg=lista.filter(r=>r!==mejor).sort((a,b)=>b.vpn-a.vpn)[0];
    razon=`El análisis de ${metNom} identifica a <strong>${mejor.datos.nombre}</strong> como la alternativa de mayor creación de valor, con un ${label} de <strong>${fmt$(v)}</strong>. `;
    razon+=`Este resultado indica que, descontando los flujos de caja futuros a la tasa TMAR del ${fmtP(mejor.datos.tasa)}, el proyecto genera un excedente neto de <strong>${fmt$(v)}</strong> sobre la inversión inicial de ${fmt$(mejor.datos.inv)}, `;
    razon+=`recuperando el capital en el horizonte de evaluación de ${mejor.datos.vida} ${mejor.datos.vida===1?'año':'años'}. `;
    if(seg)razon+=`La segunda alternativa, <strong>${seg.datos.nombre}</strong>, registra un ${label} de ${fmt$(seg.vpn)}, con una brecha de valor de ${fmt$(Math.abs(v-seg.vpn))} respecto al escenario óptimo. `;
    razon+=`Desde la perspectiva del análisis financiero, un ${label} positivo y superior al de sus pares es condición suficiente para recomendar <strong>${mejor.datos.nombre}</strong> como la decisión de inversión más eficiente.`;
  }
  if(mod==='cae'){
    const c=mejor.cae,v=mejor.vpn,f=mejor.frcVal;
    const seg=lista.filter(r=>r!==mejor).sort((a,b)=>b.cae-a.cae)[0];
    razon=`El método del <strong>Costo Anual Equivalente (CAE)</strong> transforma el VPN en una anualidad uniforme que permite comparar proyectos de distinta duración en una base temporal homogénea. `;
    razon+=`<strong>${mejor.datos.nombre}</strong> presenta el CAE más alto con <strong>${fmt$(c)}</strong> por año, derivado de un VPN de ${fmt$(v)} y un factor de recuperación de capital (FRC) de ${fmtN(f)}, `;
    razon+=`aplicado sobre una vida útil de ${mejor.datos.vida} ${mejor.datos.vida===1?'año':'años'} a la tasa TMAR del ${fmtP(mejor.datos.tasa)}. `;
    if(seg)razon+=`Frente a <strong>${seg.datos.nombre}</strong> (CAE = ${fmt$(seg.cae)}), la ventaja anual equivalente de ${mejor.datos.nombre} es de <strong>${fmt$(Math.abs(c-seg.cae))}</strong> por período. `;
    razon+=`Esta metodología es especialmente robusta cuando los proyectos difieren en duración, ya que elimina el sesgo temporal al expresar los beneficios en unidades anuales comparables.`;
  }
  if(mod==='tir'){
    const t=mejor.tir,tm=mejor.datos.tmar,margen=t-tm;
    const seg=viables.filter(r=>r!==mejor).sort((a,b)=>b.tir-a.tir)[0];
    razon=`La <strong>Tasa Interna de Retorno (TIR)</strong> representa la rentabilidad intrínseca del proyecto, independiente de la tasa de mercado. `;
    razon+=`<strong>${mejor.datos.nombre}</strong> alcanza una TIR de <strong>${fmtP(t)}</strong>, superando la TMAR del ${fmtP(tm)} con un margen de seguridad de <strong>${fmtP(margen)}</strong>. `;
    razon+=`Este margen positivo confirma que el proyecto genera una rentabilidad por encima del costo de oportunidad del capital, justificando la asignación de recursos. `;
    if(seg)razon+=`La segunda opción viable, <strong>${seg.datos.nombre}</strong> (TIR = ${fmtP(seg.tir)}), presenta una diferencia de ${fmtP(Math.abs(t-seg.tir))} puntos porcentuales respecto al escenario recomendado. `;
    razon+=`A mayor margen TIR−TMAR, mayor tolerancia ante variaciones adversas en los flujos proyectados, lo que convierte a <strong>${mejor.datos.nombre}</strong> en la alternativa con mayor robustez financiera.`;
  }

  const critRows=lista.map(r=>{
    let val,ok=esViable(r);
    if(mod==='vpn'||mod==='van')val=fmt$(r.vpn);
    else if(mod==='cae')val=fmt$(r.cae);
    else val=r.tir!==null?fmtP(r.tir):'N/A';
    return `<div class="acb">
      <div class="aclb">${r===mejor?'🥇':ok?'✅':'❌'} ${r.datos.nombre}</div>
      <div class="acv">${mod.toUpperCase()} = ${val}</div>
      ${mod==='cae'?`<div class="acn">VPN = ${fmt$(r.vpn)} · FRC = ${fmtN(r.frcVal)}</div>`:''}
      ${mod==='tir'?`<div class="acn">TMAR = ${fmtP(r.datos.tmar)} · Margen = ${r.tir!==null?fmtP(r.tir-r.datos.tmar):'N/A'}</div>`:''}
      ${mod==='vpn'||mod==='van'?`<div class="acn">TIR = ${r.tir!==null?fmtP(r.tir):'N/A'} · CAE = ${fmt$(r.cae)}</div>`:''}
      <div class="acn" style="font-weight:600;color:${ok?'#15803d':'#dc2626'};margin-top:3px">${ok?'✅ VIABLE':'❌ NO VIABLE'}</div>
    </div>`;
  }).join('');

  const criterios={
    vpn:'• <strong>VPN &gt; 0</strong> → El proyecto crea valor para el inversionista.<br/>• <strong>VPN mayor entre viables</strong> → Criterio de selección óptima.<br/>• <strong>VPN = 0</strong> → El proyecto solo recupera la inversión.',
    cae:'• <strong>CAE &gt; 0</strong> → Beneficio neto anual equivalente positivo.<br/>• <strong>CAE mayor</strong> → Mayor generación de valor por período.<br/>• Útil para comparar proyectos de diferente duración (base homogénea).',
    tir:'• <strong>TIR &gt; TMAR</strong> → El proyecto es rentable: supera el costo de capital.<br/>• <strong>TIR mayor entre viables</strong> → Mayor rentabilidad y margen de seguridad.<br/>• <strong>TIR = TMAR</strong> → Punto de indiferencia financiera.',
    van:'• <strong>VAN &gt; 0</strong> → Creación neta de valor económico.<br/>• <strong>VAN mayor entre viables</strong> → Criterio de selección bajo NIIF/IFRS.<br/>• <strong>VAN &lt; 0</strong> → Destrucción de valor: no recomendado.',
  }[mod];

  return `
    <div class="aw">
      <div class="awt">🏆 Recomendación Ejecutiva: ${mejor.datos.nombre}</div>
      <div class="awt2">Con base en el método <strong>${metNom}</strong>, aplicado a ${lista.length} alternativa(s) de inversión bajo un análisis de ingeniería económica riguroso, <strong>${mejor.datos.nombre}</strong> representa la decisión financieramente óptima.</div>
    </div>
    <div class="ar"><p>${razon}</p></div>
    <div class="acg">${critRows}</div>
    <div class="ar"><p>
      <strong>Fundamento técnico — Método ${mod.toUpperCase()}:</strong><br/>${criterios}<br/><br/>
      <strong>Alternativas viables:</strong> ${viables.length?viables.map(r=>r.datos.nombre).join(', '):'Ninguna'}<br/>
      ${noViables.length?`<strong>Alternativas no viables:</strong> ${noViables.map(r=>r.datos.nombre).join(', ')}<br/>`:''}
      <strong>Conclusión:</strong> Se recomienda ejecutar <strong>${mejor.datos.nombre}</strong>${
        mod==='tir'&&mejor.tir!==null&&mejor.tir<mejor.datos.tmar?' (con reserva: TIR no supera la TMAR; revisar supuestos)':''
      }. La decisión está sustentada en criterios cuantitativos de ingeniería económica y maximización del valor para el inversionista.
    </p></div>`;
}

/* ── CALCULAR ── */
$('btn-calc').addEventListener('click',()=>{
  const m=MOD;
  const ids=ALT_IDS.slice(0,NALTS);
  const lecs=ids.map(id=>readAlt(m,id));
  if(lecs.some(l=>!l.valido)){toast('⚠ Corrige los campos marcados en rojo.',true);return;}
  const btn=$('btn-calc');btn.textContent='⏳...';btn.disabled=true;
  setTimeout(()=>{
    try{
      const lista=lecs.map((l,idx)=>{
        const d=l.datos,id=ids[idx];
        let r={id,datos:d};
        if(m==='tir'){
          r.tir=calcTIR(d.inv,d.flujos);
          r.vpnAtTmar=d.flujos.reduce((s,f,t)=>s+f/Math.pow(1+d.tmar,t+1),-d.inv);
          r.vpn=r.vpnAtTmar;r.cae=0;r.frcVal=0;
        }else{
          r.vpn=calcVPN(d.inv,d.tasa,d.flujos);
          r.frcVal=frc(d.tasa,d.vida);
          r.cae=calcCAE(r.vpn,d.tasa,d.vida);
          r.tir=calcTIR(d.inv,d.flujos);
        }
        return r;
      });

      RES[m]={lista,fecha:new Date()};

      /* KPIs */
      const kg=document.getElementById(`kg-${m}`);
      if(kg){
        kg.innerHTML='';
        const kpiCls=['ka','kb','kc','kd'];
        lista.forEach((r,i)=>{
          let val,ok;
          if(m==='vpn'||m==='van'){val=fmt$(r.vpn);ok=r.vpn>0;}
          else if(m==='cae'){val=fmt$(r.cae);ok=r.cae>0;}
          else{val=r.tir!==null?fmtP(r.tir):'N/A';ok=r.tir!==null&&r.tir>r.datos.tmar;}
          kg.innerHTML+=`<div class="kpi ${kpiCls[i]}">
            <div class="ktop"><span class="klbl">Alt. ${r.id.toUpperCase()}</span><span class="kproj">${r.datos.nombre}</span></div>
            <div class="kval">${val}</div>
            <div class="kdec ${ok?'ac':'re'}">${ok?'✅ VIABLE':'❌ NO VIABLE'}</div>
          </div>`;
        });
        /* Winner KPI */
        let mejor;
        if(m==='vpn'||m==='van')mejor=lista.reduce((x,r)=>r.vpn>x.vpn?r:x,lista[0]);
        else if(m==='cae')mejor=lista.reduce((x,r)=>r.cae>x.cae?r:x,lista[0]);
        else{const ct=lista.filter(r=>r.tir!==null);mejor=ct.length?ct.sort((a,b)=>b.tir-a.tir)[0]:lista[0];}
        const mVal=m==='vpn'||m==='van'?fmt$(mejor.vpn):m==='cae'?fmt$(mejor.cae):(mejor.tir!==null?fmtP(mejor.tir):'N/A');
        kg.innerHTML+=`<div class="kpi kw">
          <div class="ktop"><span class="klbl">🏆 Mejor Opción</span></div>
          <div class="kval gold">${mejor.datos.nombre}</div>
          <div class="kdec wi">${m.toUpperCase()}: ${mVal}</div>
        </div>`;
      }

      /* Tabla anual — mostrar solo de la alternativa A (o la primera) como referencia */
      const tblEl=document.getElementById(`tbl-${m}`);
      if(tblEl){
        if(m==='tir')tblEl.innerHTML=buildTblTIR(lista[0].datos,lista[0].tir);
        else tblEl.innerHTML=buildTblAnual(lista[0].datos);
      }

      /* Comparativa */
      const ctblEl=document.getElementById(`ctbl-${m}`);
      if(ctblEl)ctblEl.innerHTML=buildCtbl(lista,m);

      /* Análisis */
      const anEl=document.getElementById(`an-${m}`);
      if(anEl)anEl.innerHTML=buildAnalisis(lista,m);

      toast('✅ Cálculo completado con éxito.');
    }catch(e){console.error(e);toast('❌ Error: '+e.message,true);}
    finally{btn.innerHTML='⚡ Calcular';btn.disabled=false;}
  },120);
});

/* ── LIMPIAR ── */
$('btn-clr').addEventListener('click',()=>{
  const m=MOD;
  document.querySelectorAll(`#mod-${m} .fin,#mod-${m} .inn`).forEach(el=>el.value='');
  document.querySelectorAll(`#mod-${m} .iw`).forEach(el=>el.classList.remove('err'));
  const kg=document.getElementById(`kg-${m}`);if(kg)kg.innerHTML='';
  const tbl=document.getElementById(`tbl-${m}`);if(tbl)tbl.innerHTML='';
  const ctbl=document.getElementById(`ctbl-${m}`);if(ctbl)ctbl.innerHTML='';
  const an=document.getElementById(`an-${m}`);
  if(an)an.innerHTML='<div class="emp"><span>📊</span>Ingresa los datos y presiona Calcular.</div>';
  RES[m]=null;
  toast('🗑 Datos limpiados.');
});

/* ── EXPORTAR PDF ── */
window.exportPDF=function(mod){
  const r=RES[mod];
  if(!r){toast('Primero realiza un cálculo.',true);return;}
  const{lista,fecha}=r;
  const fech=fecha.toLocaleString('es-SV');
  const metNom={vpn:'Valor Presente Neto (VPN)',cae:'Costo Anual Equivalente (CAE)',tir:'Tasa Interna de Retorno (TIR)',van:'Valor Actual Neto (VAN)'}[mod];
  const cmap=ALT_COLORS;
  const esViable=r2=>{
    if(mod==='vpn'||mod==='van')return r2.vpn>0;
    if(mod==='cae')return r2.cae>0;
    if(mod==='tir')return r2.tir!==null&&r2.tir>r2.datos.tmar;
  };
  const viables=lista.filter(esViable);
  let mejor;
  if(mod==='vpn'||mod==='van')mejor=lista.reduce((x,r2)=>r2.vpn>x.vpn?r2:x,lista[0]);
  else if(mod==='cae')mejor=lista.reduce((x,r2)=>r2.cae>x.cae?r2:x,lista[0]);
  else{const ct=lista.filter(r2=>r2.tir!==null);mejor=ct.length?ct.sort((a,b)=>b.tir-a.tir)[0]:lista[0];}

  const logoSVG=`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100px;height:100px">
    <circle cx="100" cy="100" r="98" fill="#0d1b3e" stroke="#C9A84C" stroke-width="3"/>
    <circle cx="100" cy="100" r="84" fill="none" stroke="#C9A84C" stroke-width="1.2"/>
    <rect x="70" y="80" width="60" height="44" rx="3" fill="none" stroke="#C9A84C" stroke-width="2.2"/>
    <line x1="100" y1="80" x2="100" y2="124" stroke="#C9A84C" stroke-width="1.8"/>
    <line x1="76" y1="92" x2="96" y2="92" stroke="#C9A84C" stroke-width="1.1"/>
    <line x1="76" y1="99" x2="96" y2="99" stroke="#C9A84C" stroke-width="1.1"/>
    <line x1="76" y1="106" x2="96" y2="106" stroke="#C9A84C" stroke-width="1.1"/>
    <line x1="104" y1="92" x2="124" y2="92" stroke="#C9A84C" stroke-width="1.1"/>
    <line x1="104" y1="99" x2="124" y2="99" stroke="#C9A84C" stroke-width="1.1"/>
    <line x1="104" y1="106" x2="124" y2="106" stroke="#C9A84C" stroke-width="1.1"/>
    <ellipse cx="100" cy="70" rx="6" ry="9" fill="#C9A84C" opacity=".9"/>
    <text x="100" y="147" text-anchor="middle" fill="#C9A84C" font-size="8.5" font-family="Georgia,serif" font-weight="700" letter-spacing="1">UNIVERSIDAD</text>
    <text x="100" y="159" text-anchor="middle" fill="#C9A84C" font-size="9" font-family="Georgia,serif" font-weight="700" letter-spacing="1.5">DE EL SALVADOR</text>
  </svg>`;
  const mini=`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:26px;height:26px;opacity:.7;vertical-align:middle">
    <circle cx="100" cy="100" r="98" fill="#0d1b3e" stroke="#C9A84C" stroke-width="3"/>
    <text x="100" y="108" text-anchor="middle" fill="#C9A84C" font-size="50" font-family="Georgia,serif" font-weight="700">UES</text>
  </svg>`;

  /* Construir tabla de flujos PDF */
  const tblFlujoPDF=(alt)=>{
    const d=alt.datos;
    if(mod==='tir'){
      const fn=rate=>d.flujos.reduce((s,f,t)=>s+f/Math.pow(1+rate,t+1),-d.inv);
      const tasas=[0,0.05,0.10,0.15,0.20,0.25,0.30];
      if(alt.tir!==null&&!tasas.some(t=>Math.abs(t-alt.tir)<0.001)){tasas.push(alt.tir);tasas.sort((a,b)=>a-b);}
      return `<table><thead><tr><th>Tasa</th><th>VPN ($)</th><th>Interpretación</th></tr></thead><tbody>
        ${tasas.map(rate=>{const v=fn(rate),isTIR=alt.tir!==null&&Math.abs(rate-alt.tir)<0.001;
          return `<tr style="${isTIR?'background:#fdf6e3;font-weight:700':''}"><td>${isTIR?'⭐ ':''}${(rate*100).toFixed(2)}%${isTIR?' (TIR)':''}</td>
            <td style="color:${v>=0?'#15803d':'#dc2626'}">${fmt$(v)}</td>
            <td>${v>0?'Viable':v===0?'Indiferente':'No viable'}</td></tr>`;}).join('')}
      </tbody></table>`;
    }
    let rows='',ac=-d.inv;
    rows+=`<tr><td style="font-weight:600">0 — Inversión</td><td style="color:#dc2626">-${fmt$(d.inv)}</td><td>1.0000</td><td style="color:#dc2626">-${fmt$(d.inv)}</td><td style="color:#dc2626">-${fmt$(d.inv)}</td></tr>`;
    d.flujos.forEach((f,idx)=>{const t=idx+1,fac=Math.pow(1+d.tasa,t),vp=f/fac;ac+=vp;
      rows+=`<tr><td>${t}</td><td style="color:${f>=0?'#15803d':'#dc2626'}">${fmt$(f)}</td><td>${fac.toFixed(4)}</td>
        <td style="color:${vp>=0?'#15803d':'#dc2626'}">${fmt$(vp)}</td>
        <td style="color:${ac>=0?'#15803d':'#dc2626'};font-weight:${ac>=0?'600':'400'}">${fmt$(ac)}</td></tr>`;
    });
    const tp=d.flujos.reduce((s,f,t)=>s+f/Math.pow(1+d.tasa,t+1),0);
    rows+=`<tr style="background:#fdf6e3"><td><strong>TOTAL</strong></td><td></td><td></td>
      <td><strong>${fmt$(tp)}</strong></td>
      <td style="color:${-d.inv+tp>=0?'#15803d':'#dc2626'};font-weight:700">${fmt$(-d.inv+tp)}</td></tr>`;
    return `<table><thead><tr><th>Período</th><th>Flujo de Caja ($)</th><th>Factor (1+i)^t</th><th>VP del Flujo ($)</th><th>VP Acumulado ($)</th></tr></thead><tbody>${rows}</tbody></table>`;
  };

  /* Resumen indicadores PDF */
  const resumen=()=>{
    let rows='';
    if(mod==='tir'){
      const ct=lista.filter(r2=>r2.tir!==null);
      const bTIR=ct.length?ct.reduce((m,r2)=>r2.tir>m.tir?r2:m,ct[0]):lista[0];
      rows+=`<tr style="background:#fdf6e3"><td><strong>TIR (%)</strong></td>${lista.map((r2,i)=>`<td style="color:${cmap[i]};font-weight:700">${r2.tir!==null?fmtP(r2.tir):'N/A'}</td>`).join('')}<td>🏆 ${bTIR.datos.nombre}</td></tr>`;
      rows+=`<tr><td>TMAR (%)</td>${lista.map(r2=>`<td>${fmtP(r2.datos.tmar)}</td>`).join('')}<td>—</td></tr>`;
      rows+=`<tr><td>Margen TIR−TMAR</td>${lista.map((r2,i)=>`<td style="color:${r2.tir!==null&&r2.tir>r2.datos.tmar?'#15803d':'#dc2626'}">${r2.tir!==null?fmtP(r2.tir-r2.datos.tmar):'N/A'}</td>`).join('')}<td>—</td></tr>`;
      rows+=`<tr><td>VPN @ TMAR</td>${lista.map(r2=>`<td>${fmt$(r2.vpnAtTmar)}</td>`).join('')}<td>—</td></tr>`;
    }else if(mod==='cae'){
      const bCAE=lista.reduce((m,r2)=>r2.cae>m.cae?r2:m,lista[0]);
      const bVPN=lista.reduce((m,r2)=>r2.vpn>m.vpn?r2:m,lista[0]);
      rows+=`<tr style="background:#fdf6e3"><td><strong>CAE ($)</strong></td>${lista.map((r2,i)=>`<td style="color:${cmap[i]};font-weight:700">${fmt$(r2.cae)}</td>`).join('')}<td>🏆 ${bCAE.datos.nombre}</td></tr>`;
      rows+=`<tr><td>VPN ($)</td>${lista.map((r2,i)=>`<td style="color:${cmap[i]}">${fmt$(r2.vpn)}</td>`).join('')}<td>🏆 ${bVPN.datos.nombre}</td></tr>`;
      rows+=`<tr><td>Factor FRC</td>${lista.map(r2=>`<td>${fmtN(r2.frcVal)}</td>`).join('')}<td>—</td></tr>`;
      rows+=`<tr><td>Vida Útil</td>${lista.map(r2=>`<td>${r2.datos.vida} años</td>`).join('')}<td>—</td></tr>`;
    }else{
      const label=mod.toUpperCase();
      const bVPN=lista.reduce((m,r2)=>r2.vpn>m.vpn?r2:m,lista[0]);
      const bCAE=lista.reduce((m,r2)=>r2.cae>m.cae?r2:m,lista[0]);
      const ct=lista.filter(r2=>r2.tir!==null);
      rows+=`<tr style="background:#fdf6e3"><td><strong>${label} ($)</strong></td>${lista.map((r2,i)=>`<td style="color:${cmap[i]};font-weight:700">${fmt$(r2.vpn)}</td>`).join('')}<td>🏆 ${bVPN.datos.nombre}</td></tr>`;
      rows+=`<tr><td>CAE ($)</td>${lista.map((r2,i)=>`<td style="color:${cmap[i]}">${fmt$(r2.cae)}</td>`).join('')}<td>🏆 ${bCAE.datos.nombre}</td></tr>`;
      rows+=`<tr><td>TIR (%)</td>${lista.map(r2=>`<td>${r2.tir!==null?fmtP(r2.tir):'N/A'}</td>`).join('')}<td>${ct.length?'🏆 '+ct.reduce((m,r2)=>r2.tir>m.tir?r2:m,ct[0]).datos.nombre:'—'}</td></tr>`;
      rows+=`<tr><td>VP Total Flujos ($)</td>${lista.map(r2=>`<td>${fmt$(r2.vpn+r2.datos.inv)}</td>`).join('')}<td>—</td></tr>`;
      rows+=`<tr><td>Vida Útil</td>${lista.map(r2=>`<td>${r2.datos.vida} años</td>`).join('')}<td>—</td></tr>`;
    }
    rows+=`<tr><td>Inversión ($)</td>${lista.map(r2=>`<td>${fmt$(r2.datos.inv)}</td>`).join('')}<td>—</td></tr>`;
    rows+=`<tr><td><strong>Decisión</strong></td>${lista.map((r2,i)=>{const ok=esViable(r2);return `<td style="color:${ok?'#15803d':'#dc2626'};font-weight:700">${ok?'✅ ACEPTAR':'❌ RECHAZAR'}</td>`;}).join('')}<td>🏆 ${mejor.datos.nombre}</td></tr>`;
    return rows;
  };

  const html=`<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/>
<title>SEAE — Reporte ${mod.toUpperCase()}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Source Sans 3',sans-serif;color:#0d1b3e;background:#fff;font-size:12px}
.portada{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(160deg,#0d1b3e,#1a2d6d);text-align:center;padding:50px 36px;page-break-after:always;position:relative}
.pu{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;color:#C9A84C;margin:16px 0 3px}
.pf{font-size:.68rem;color:rgba(255,255,255,.38);margin-bottom:24px;letter-spacing:.05em}
.ps{width:60px;height:3px;background:#C9A84C;margin:0 auto 22px;border-radius:2px}
.pt{font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:800;color:#fff;line-height:1.2;margin-bottom:5px}
.psub{font-size:.88rem;color:#C9A84C;font-family:'Playfair Display',serif;font-weight:700;margin-bottom:24px}
.pm{font-size:.79rem;color:rgba(255,255,255,.7);line-height:2.3}
.pm strong{color:#C9A84C}
.pbadge{display:inline-block;background:rgba(201,168,76,.13);border:1.5px solid rgba(201,168,76,.42);color:#C9A84C;font-size:.74rem;font-weight:700;padding:6px 16px;border-radius:100px;margin-top:16px;letter-spacing:.06em}
.pfoot{position:absolute;bottom:22px;left:50%;transform:translateX(-50%);font-size:.59rem;color:rgba(255,255,255,.18);white-space:nowrap}
.page{padding:36px 44px}
.page+.page{page-break-before:always}
.ph{display:flex;align-items:center;justify-content:space-between;border-bottom:2.5px solid #C9A84C;padding-bottom:10px;margin-bottom:18px}
.phl{display:flex;align-items:center;gap:9px}
.pht{font-family:'Playfair Display',serif;font-size:.84rem;font-weight:700;color:#0d1b3e}
.phs{font-size:.59rem;color:#6b7280;margin-top:2px}
.phr{font-size:.61rem;color:#9ca3af;text-align:right;line-height:1.7}
.st{font-size:.55rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;border-bottom:1px solid #e5e7eb;padding-bottom:3px;margin:14px 0 8px}
.dg{display:grid;grid-template-columns:repeat(${lista.length},1fr);gap:9px;margin-bottom:14px}
.dc{background:#f8fafc;border:1px solid #e5ecf6;border-radius:7px;padding:10px;border-top:3px solid}
.dc h3{font-size:.74rem;font-weight:700;margin-bottom:7px;padding-bottom:4px;border-bottom:1px solid #e5ecf6}
.dr{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px dashed #e5e7eb;font-size:.71rem}
.dr:last-child{border-bottom:none}
.dr span:first-child{color:#6b7280}.dr span:last-child{font-weight:600}
table{width:100%;border-collapse:collapse;font-size:.74rem;margin-bottom:10px}
th{background:#0d1b3e;color:#C9A84C;padding:6px 10px;text-align:left;font-size:.59rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
td{padding:6px 10px;border-bottom:1px solid #e5ecf6;vertical-align:top}
tr:nth-child(even) td{background:#f8fafc}
.wb{background:linear-gradient(135deg,#0d1b3e,#1a2d6d);border-radius:8px;padding:13px 15px;color:#fff;margin-bottom:10px}
.wbt{font-family:'Playfair Display',serif;font-size:.98rem;font-weight:700;color:#C9A84C;margin-bottom:5px}
.wbs{font-size:.77rem;line-height:1.7;color:rgba(255,255,255,.83)}
.rb{background:#f8fafc;border-left:3px solid #C9A84C;padding:8px 11px;border-radius:0 5px 5px 0;margin-bottom:9px;font-size:.75rem;line-height:1.78;color:#374151}
.rb.warn{border-left-color:#dc2626;background:#fef2f2}
.cg{display:grid;grid-template-columns:repeat(${Math.min(lista.length,4)},1fr);gap:7px;margin-bottom:9px}
.ci{background:#f0f4fb;border-radius:6px;padding:8px 10px;border:1px solid #e5ecf6;border-top:3px solid}
.cin{font-size:.59rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px}
.civ{font-size:.82rem;font-weight:700;margin-bottom:2px}
.cin2{font-size:.66rem;color:#6b7280;margin-top:1px}
.cid{font-size:.67rem;font-weight:600;margin-top:4px}
.pf2{margin-top:20px;padding-top:8px;border-top:1px solid #e5ecf6;display:flex;align-items:center;justify-content:space-between;font-size:.6rem;color:#9ca3af}
@media print{.portada{page-break-after:always}.page+.page{page-break-before:always}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="portada">
  ${logoSVG}
  <div class="pu">Universidad de El Salvador</div>
  <div class="pf">Ingeniería Económica · Ciclo 2026</div>
  <div class="ps"></div>
  <div class="pt">SEAE</div>
  <div class="psub">Sistema de Evaluación de Alternativas Económicas</div>
  <div class="pm">
    <strong>Reporte Oficial — Módulo ${mod.toUpperCase()}: ${metNom}</strong><br/>
    Fecha: ${fech}<br/>
    Alternativas: <strong>${lista.map(r2=>r2.datos.nombre).join(' · ')}</strong>
  </div>
  <div class="pbadge">Ingeniería Económica · Ciclo 2026</div>
  <div class="pfoot">SEAE · Universidad de El Salvador · ${fech}</div>
</div>

<div class="page">
  <div class="ph">
    <div class="phl">${mini}<div><div class="pht">SEAE — Módulo ${mod.toUpperCase()}: ${metNom}</div><div class="phs">Universidad de El Salvador · Ingeniería Económica · ${fech}</div></div></div>
    <div class="phr">Método: ${mod.toUpperCase()}<br/>Pág. 1</div>
  </div>
  <div class="st">Datos de Entrada por Alternativa</div>
  <div class="dg">
    ${lista.map((r2,i)=>{
      const d=r2.datos;
      let rows='';
      if(mod==='tir'){
        rows+=`<div class="dr"><span>Inversión (I₀)</span><span>${fmt$(d.inv)}</span></div>`;
        rows+=`<div class="dr"><span>TMAR</span><span>${fmtP(d.tmar)}</span></div>`;
        rows+=`<div class="dr"><span>Flujos</span><span style="font-size:.65rem">${d.flujos.map(f=>fmt$(f)).join(' · ')}</span></div>`;
      }else{
        rows+=`<div class="dr"><span>Inversión (I₀)</span><span>${fmt$(d.inv)}</span></div>`;
        rows+=`<div class="dr"><span>Tasa TMAR</span><span>${fmtP(d.tasa)}</span></div>`;
        rows+=`<div class="dr"><span>Vida útil</span><span>${d.vida} años</span></div>`;
        rows+=`<div class="dr"><span>Salvamento</span><span>${fmt$(d.sal||0)}</span></div>`;
        rows+=`<div class="dr"><span>Flujos</span><span style="font-size:.65rem">${d.flujos.map(f=>fmt$(f)).join(' · ')}</span></div>`;
      }
      return `<div class="dc" style="border-top-color:${cmap[i]}"><h3 style="color:${cmap[i]}">${d.nombre}</h3>${rows}</div>`;
    }).join('')}
  </div>
  ${lista.map(r2=>`
  <div class="st">Tabla de Flujos Descontados — ${r2.datos.nombre}</div>
  ${tblFlujoPDF(r2)}`).join('')}
  <div class="pf2"><div>${mini} <strong>SEAE</strong> — Universidad de El Salvador</div><span>Pág. 1 · ${fech}</span></div>
</div>

<div class="page">
  <div class="ph">
    <div class="phl">${mini}<div><div class="pht">SEAE — Resultados y Análisis · ${mod.toUpperCase()}</div><div class="phs">Universidad de El Salvador · Ingeniería Económica · ${fech}</div></div></div>
    <div class="phr">Método: ${mod.toUpperCase()}<br/>Pág. 2</div>
  </div>

  <div class="st">Resumen Comparativo de Indicadores</div>
  <table>
    <thead><tr><th>Indicador</th>${lista.map(r2=>`<th>${r2.datos.nombre}</th>`).join('')}<th>Mejor Opción</th></tr></thead>
    <tbody>${resumen()}</tbody>
  </table>

  <div class="st">Análisis Financiero y Recomendación Ejecutiva</div>
  ${viables.length?`
  <div class="wb">
    <div class="wbt">🏆 Recomendación: ${mejor.datos.nombre}</div>
    <div class="wbs">Método <strong>${metNom}</strong> · ${lista.length} alternativa(s) evaluada(s)<br/>
    ${mod.toUpperCase()} del proyecto seleccionado: <strong>${mod==='vpn'||mod==='van'?fmt$(mejor.vpn):mod==='cae'?fmt$(mejor.cae):(mejor.tir!==null?fmtP(mejor.tir):'N/A')}</strong>
    ${mod!=='tir'?` · Inversión: ${fmt$(mejor.datos.inv)} · Vida: ${mejor.datos.vida} años · TMAR: ${fmtP(mejor.datos.tasa)}`:` · TMAR: ${fmtP(mejor.datos.tmar)}`}
    </div>
  </div>`:`
  <div class="rb warn"><p><strong>⚠ Ninguna alternativa es viable bajo el método ${metNom}.</strong><br/>Se recomienda revisar los supuestos antes de tomar una decisión de inversión.</p></div>`}

  <div class="st">Comparación Detallada por Alternativa</div>
  <div class="cg">
    ${lista.map((r2,i)=>{
      const ok=esViable(r2);
      const val=mod==='vpn'||mod==='van'?fmt$(r2.vpn):mod==='cae'?fmt$(r2.cae):(r2.tir!==null?fmtP(r2.tir):'N/A');
      return `<div class="ci" style="border-top-color:${cmap[i]}">
        <div class="cin">${r2===mejor?'🥇':ok?'✅':'❌'} ${r2.datos.nombre}</div>
        <div class="civ" style="color:${cmap[i]}">${mod.toUpperCase()} = ${val}</div>
        ${mod==='cae'?`<div class="cin2">VPN = ${fmt$(r2.vpn)}</div><div class="cin2">FRC = ${fmtN(r2.frcVal)}</div>`:''}
        ${mod==='tir'?`<div class="cin2">TMAR = ${fmtP(r2.datos.tmar)}</div><div class="cin2">Margen = ${r2.tir!==null?fmtP(r2.tir-r2.datos.tmar):'N/A'}</div>`:''}
        ${mod==='vpn'||mod==='van'?`<div class="cin2">TIR = ${r2.tir!==null?fmtP(r2.tir):'N/A'}</div><div class="cin2">CAE = ${fmt$(r2.cae)}</div>`:''}
        <div class="cid" style="color:${ok?'#15803d':'#dc2626'}">${ok?'✅ VIABLE':'❌ NO VIABLE'}</div>
      </div>`;
    }).join('')}
  </div>

  <div class="st">Criterios de Decisión y Fundamento Técnico</div>
  <div class="rb">
    ${mod==='vpn'?'<strong>VPN &gt; 0:</strong> El proyecto recupera la inversión y genera valor adicional. <strong>VPN mayor:</strong> Criterio de selección entre alternativas viables. Aplicable cuando los proyectos tienen similar horizonte temporal.':
      mod==='cae'?'<strong>CAE &gt; 0:</strong> El proyecto genera beneficio neto anual positivo en términos equivalentes. <strong>CAE mayor:</strong> La alternativa con mayor anualidad equivalente maximiza el valor por período. Método ideal para proyectos de distinta duración.':
      mod==='tir'?'<strong>TIR &gt; TMAR:</strong> La rentabilidad intrínseca supera el costo mínimo de capital. <strong>Mayor margen TIR−TMAR:</strong> Indica mayor robustez financiera ante variaciones de los flujos. Complementa al VPN para decisiones de inversión.':
      '<strong>VAN &gt; 0:</strong> El proyecto crea valor económico neto positivo (nomenclatura NIIF/IFRS). <strong>VAN mayor:</strong> Criterio de selección óptima bajo estándares financieros internacionales.'}<br/><br/>
    <strong>Alternativas viables:</strong> ${viables.length?viables.map(r2=>r2.datos.nombre).join(', '):'Ninguna'}<br/>
    <strong>Alternativas no viables:</strong> ${lista.filter(r2=>!esViable(r2)).map(r2=>r2.datos.nombre).join(', ')||'Ninguna'}<br/>
    <strong>Conclusión:</strong> ${viables.length?`Ejecutar <strong>${mejor.datos.nombre}</strong>. Decisión sustentada en análisis cuantitativo de ingeniería económica.`:'Ninguna alternativa supera el umbral de viabilidad. Revisar supuestos del proyecto.'}
  </div>

  <div class="pf2"><div>${mini} <strong>SEAE</strong> — Universidad de El Salvador · 2026</div><span>Pág. 2 · ${fech}</span></div>
</div>

<script>window.onload=function(){setTimeout(function(){window.print();},900);};<\/script>
</body></html>`;

  try{
    const blob=new Blob([html],{type:'text/html;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const win=window.open(url,'_blank');
    if(!win){
      const a=document.createElement('a');a.href=url;
      a.download=`SEAE_${mod.toUpperCase()}_${Date.now()}.html`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      toast('📥 Archivo descargado — ábrelo en el navegador e imprime como PDF.');
    }else{
      toast('📑 Reporte listo — presiona Ctrl+P para guardar como PDF.');
      setTimeout(()=>URL.revokeObjectURL(url),30000);
    }
  }catch(err){console.error(err);toast('❌ Error: '+err.message,true);}
};
