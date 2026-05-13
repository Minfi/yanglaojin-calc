// ===== STATE =====
const COLORS=['#e0a040','#3daf68','#378add','#d85a30','#7f77dd'];
let plans=[{id:1,nm:'方案A',c:'#e0a040',r:null}];
let cpid=1,pcnt=1;
const PD={};
// ===== INIT =====
function init(){rp();lp(cpid);bindEvts();rh();}
function bindEvts(){
  ['vBy','vCy'].forEach(id=>{const e=ge(id);if(e)e.oninput=rh;});
}
function rh(){ // recalc all hints
  const by=parseInt(ge('vBy')?.value)||1971;
  const cy=parseInt(ge('vCy')?.value)||2026;
  const h=ge('hAge');
  if(h) h.innerHTML='&#x1F305; 60岁：'+(by+60)+'年 · 65岁：'+(by+65)+'年（当前为 '+(cy-by)+' 岁）';
  // 补缴年份跟随当前年份
  const hbgy=ge('hBgy'); if(hbgy) hbgy.textContent=cy+'年';
  const hsgy=ge('hSgy'); if(hsgy) hsgy.textContent=cy+'年';
  rcB(); rcS(); rcBF(); rcSF(); rsG(); rcC();
}
function ge(id){return document.getElementById(id);}
// ===== YEAR HELPERS =====
function rcB(){
  const s=parseInt(ge('vBhs')?.value)||0, e=parseInt(ge('vBhe')?.value)||0;
  const y=(s&&e&&e>=s)?(e-s+1):0;
  const h=ge('hByr');
  if(h) h.innerHTML=y>0?('&#x1F4CC; 正常缴费 '+y+' 年（'+s+'—'+e+'，不含断缴）'):'&#x1F4CC; 请输入开始/最晚缴费年份';
}
function rcS(){
  const s=parseInt(ge('vShs')?.value)||0, e=parseInt(ge('vShe')?.value)||0;
  const y=(s&&e&&e>=s)?(e-s+1):0;
  const h=ge('hSyr');
  if(h) h.innerHTML=y>0?('&#x1F4CC; 正常缴费 '+y+' 年（'+s+'—'+e+'，不含断缴）'):'&#x1F4CC; 请输入开始/最晚缴费年份';
}
function rcBF(){
  const by=parseInt(ge('vBy')?.value)||1971;
  const e=ge('hBfe'); if(e) e.textContent=(by+60)+'年（60岁所在年份）';
}
function rcSF(){
  const by=parseInt(ge('vBy')?.value)||1971;
  const e=ge('hSfe'); if(e) e.textContent=(by+65)+'年（65岁所在年份）';
}
// ===== SUBSIDY AUTO (BS/SS from calc.js) =====
function rsG(){
  const by=parseInt(ge('vBy')?.value)||1971;
  const bfy=Math.max(0,(by+59)-2026+1);
  const sfy=Math.max(0,(by+64)-2026+1);
  const ba=parseInt(ge('vBfa')?.value)||0;
  const sa=parseInt(ge('vSfa')?.value)||0;
  const bsub=BS[ba]||0, ssub=SS[sa]||0;
  const bh=ge('hBgs'); if(bh) bh.innerHTML='&#x1F4CC; 政府补贴：'+bsub+'元/年 × '+bfy+'年 = '+bsub*bfy+'元（已计入账户复利）';
  const sh=ge('hSgs'); if(sh) sh.innerHTML='&#x1F4CC; 政府补贴：'+ssub+'元/年 × '+sfy+'年 = '+ssub*sfy+'元（已计入账户复利）';
}
// ===== GAP TOGGLE =====
function tgGap(prefix){
  const cbId=prefix==='bg'?'cBg':'cSg';
  const cb=ge(cbId); const fld=ge(prefix+'Fld');
  if(cb&&fld) fld.style.display=cb.checked?'grid':'none';
}
// ===== TAB =====
function sw(tab){
  document.querySelectorAll('.tb button').forEach((b,i)=>b.classList.toggle('on',['input','result','compare'][i]===tab));
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('on'));
  ge('s-'+tab)?.classList.add('on');
}
// ===== PLAN MGMT =====
function rp(){
  const w=ge('ptabs'); if(!w)return; w.innerHTML='';
  plans.forEach(p=>{
    const b=document.createElement('button');
    b.className='ptab'+(p.id===cpid?' on':'');
    b.innerHTML=`<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:`+p.c+`;margin-right:4px;vertical-align:middle;"></span>`+p.nm;
    b.onclick=()=>{sv(cpid);cpid=p.id;rp();lp(p.id);};
    w.appendChild(b);
  });
  const d=ge('pdel'); if(d) d.style.display=plans.length>1?'':'none';
}
function addP(){
  if(plans.length>=3){t('最多3个方案');return;}
  pcnt++;
  const ns=['方案A','方案B','方案C'];
  plans.push({id:pcnt,nm:ns[plans.length]||'方案'+(plans.length+1),c:COLORS[plans.length%COLORS.length],r:null});
  cpid=pcnt; rp(); lpDflt(cpid); t('已新增方案');
}
function delP(){
  if(plans.length<=1){t('至少保留1个');return;}
  plans=plans.filter(p=>p.id!==cpid);
  cpid=plans[plans.length-1].id; rp(); lp(cpid); t('已删除方案');
}
// ===== FORM PERSISTENCE =====
function clt(){
  const ids=['vBy','vCy','vPn','vBhs','vBhe','vBha','cBg','vBgn','vBga','vBfs','vBfa','vBc','vShs','vShe','vSha','cSg','vSgn','vSga','vSfs','vSfa','vSc'];
  const d={};
  ids.forEach(id=>{
    const el=ge(id); if(!el)return;
    d[id]=el.type==='checkbox'?el.checked:el.value;
  });
  return d;
}
function apf(d){
  if(!d)return;
  Object.keys(d).forEach(id=>{
    const el=ge(id); if(!el)return;
    if(el.type==='checkbox')el.checked=!!d[id]; else el.value=d[id];
  });
  ['bg','sg'].forEach(p=>{
    const cbId=p==='bg'?'cBg':'cSg';
    const cb=ge(cbId),fld=ge(p+'Fld');
    if(cb&&fld)fld.style.display=cb.checked?'grid':'none';
  });
  rh();
}
function sv(pid){ const d=clt(); if(!d)return; PD[pid]=d;
  const nm=ge('vPn')?.value; const p=plans.find(x=>x.id===pid); if(p&&nm)p.nm=nm; rp();
}
function lp(pid){
  const d=PD[pid]; if(d) apf(d); else lpDflt(pid);
  const p=plans.find(x=>x.id===pid); if(p){const e=ge('vPn');if(e)e.value=p.nm;}
}
function lpDflt(pid){
  const p=plans.find(x=>x.id===pid);
  const nm=p?p.nm:'方案';
  apf({vBy:'1971',vCy:'2026',vPn:nm,vBhs:'2011',vBhe:'2022',vBha:'5000',cBg:true,vBgn:'3',vBga:'5000',vBfs:'2026',vBfa:'5000',vBc:'0',vShs:'2021',vShe:'2021',vSha:'5000',cSg:true,vSgn:'4',vSga:'5000',vSfs:'2026',vSfa:'5000',vSc:'0'});
}
// ===== CARD TOGGLE =====
function tgCard(id){ge(id)?.classList.toggle('closed');}
// ===== CHILD SUPPORT HINT =====
function rcC(){
  const by=parseInt(ge('vBy')?.value)||1971;
  const cy=parseInt(ge('vCy')?.value)||2026;
  const a60=by+60, a65=by+65;
  const bc=parseInt(ge('vBc')?.value)||0;
  const sc=parseInt(ge('vSc')?.value)||0;
  const hBc=ge('hBc'); if(hBc){
    const yrs=Math.max(0,a60-cy+1);
    hBc.innerHTML=bc>0
      ?'&#x1F4CC; 子女资助基本险：'+cy+'年至'+a60+'年（'+yrs+'年），每年'+bc+'元，无补贴；'+a60+'年生日当月前缴完，次月起领养老金'
      :'&#x1F4CC; 子女资助基本险：'+cy+'年起至60岁当年缴完，次月领养老金；';
  }
  const hSc=ge('hSc'); if(hSc){
    const yrs=Math.max(0,a65-cy+1);
    hSc.innerHTML=sc>0
      ?'&#x1F4CC; 子女资助补充险：'+cy+'年至'+a65+'年（'+yrs+'年），每年'+sc+'元，无补贴；'+a65+'年生日当月前缴完，次月起领养老金'
      :'&#x1F4CC; 子女资助补充险：'+cy+'年起至65岁当年缴完，次月领养老金；';
  }
}

// ===== YEAR VALIDATION =====
function vYr(input){
  const v=input.value.trim();
  if(v.length===0){input.classList.remove('ve');rmWh(input);return;}
  // Remove non-digits
  const clean=v.replace(/[^0-9]/g,'');
  if(clean!==v){input.value=clean;}
  // Validate: must be 4 digits starting with 19 or 20
  if(clean.length>=4){
    if(!/^(19|20)\d{2}$/.test(clean)){
      input.classList.add('ve');
      addWh(input,'年份需19/20开头的4位数');
    } else {
      input.classList.remove('ve');
      rmWh(input);
    }
  } else {
    // Less than 4 digits — not yet complete, clear error
    input.classList.remove('ve');
    rmWh(input);
  }
}
function addWh(input,msg){
  let h=input.parentElement.querySelector('.wh');
  if(!h){h=document.createElement('span');h.className='wh';input.parentElement.appendChild(h);}
  h.textContent=msg;
}
function rmWh(input){
  const h=input.parentElement.querySelector('.wh');
  if(h)h.remove();
}
// Check all year fields, return true if all valid
function chkYrs(){
  const ids=['vBy','vCy','vBhs','vBhe','vBfs','vShs','vShe','vSfs'];
  let ok=true,first=null;
  ids.forEach(id=>{
    const el=ge(id); if(!el||el.closest('[style*="display:none"]'))return; // skip hidden fields
    const v=(el.value||'').trim();
    if(v.length>0 && !/^(19|20)\d{2}$/.test(v)){
      el.classList.add('ve');addWh(el,'年份需19/20开头的4位数');
      if(!first)first=el; ok=false;
    }
  });
  if(!ok&&first){first.focus();t('请修正标红的年份字段');}
  return ok;
}
// ===== DATA LABEL PLUGIN (drawn after chart renders) =====
const _dlPlugin={
  id:'datalabels',
  afterDraw(chart){
    const ctx=chart.ctx;
    const xLabels=chart.data.labels||[];
    chart.data.datasets.forEach((ds,di)=>{
      const meta=chart.getDatasetMeta(di);
      if(meta.hidden)return;
      // Reference lines: show one label at the rightmost point
      if(ds._ref){
        const lastIdx=meta.data.length-1;
        if(lastIdx<0)return;
        const el=meta.data[lastIdx];
        const val=ds.data[lastIdx]; if(val==null)return;
        ctx.save();
        ctx.font='500 9px Noto Sans SC,sans-serif';
        ctx.fillStyle=ds.borderColor||'#9c9890';
        ctx.textAlign='right';
        ctx.textBaseline='bottom';
        const label=val>=10000?(val/10000).toFixed(1)+'万':val.toString();
        ctx.fillText(label,el.x-4,el.y-4);
        ctx.restore();
        return;
      }
      meta.data.forEach((el,idx)=>{
        const val=ds.data[idx]; if(val==null)return;
        // For line charts with many points, only label every 3rd + last
        if(chart.config.type==='line'){
          const isKey=idx%3===0||idx===meta.data.length-1;
          if(!isKey)return;
        }
        ctx.save();
        ctx.font='500 9px Noto Sans SC,sans-serif';
        ctx.fillStyle=ds.borderColor||'#706c64';
        ctx.textAlign='center';
        ctx.textBaseline='bottom';
        const label=val>=10000?(val/10000).toFixed(1)+'万':val.toString();
        // Bar: center above bar; Line: above point
        if(chart.config.type==='bar'){
          ctx.textBaseline='bottom';
          ctx.fillText(label,el.x,el.y-3);
        } else {
          ctx.fillText(label,el.x,el.y-5);
        }
        ctx.restore();
      });
    });
  }
};
// ===== FINANCE ENGINE (imported from calc.js) =====
// cg() and atpv() are defined in calc.js and available globally
// ===== CALCULATE (delegates to calc.js) =====
function calc(){
  sv(cpid); const d=PD[cpid]; if(!d){t('请填写信息');return;}
  if(!chkYrs())return;
  // 调用 calc.js 中的纯计算函数
  const r = calcAll(d);
  // 补充UI相关字段
  r.nm = plans.find(x=>x.id===cpid)?.nm||'';
  const cp=plans.find(x=>x.id===cpid); if(cp) cp.r=r;
  rndR(r); rndC(); sw('result');
}
// ===== FORMAT =====
function fmt(n,d=0){
  if(isNaN(n))return '—';
  return new Intl.NumberFormat('zh-CN',{minimumFractionDigits:d,maximumFractionDigits:d}).format(Math.round(n));
}
// ===== RENDER RESULT =====
function rndR(r){
  const cp=plans.find(x=>x.id===cpid); const c=cp?.c||'#e0a040';
  const mkF=(lb,ex)=>`<span class="ft">${lb}<span class="fp">${ex}</span></span>`;
  const d=PD[cpid]||{};
  // 实际值缩写
  const R=r.rate*100, A60=r.a60, A65=r.a65;
  const html=`
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px;">
    <h2 style="font-family:var(--font-t);font-size:14px;color:var(--g700);font-weight:500;margin:0;">测算结果</h2>
    <span style="padding:2px 8px;border-radius:8px;font-size:10px;font-weight:500;background:`+c+`20;color:`+c+`;">`+r.nm+`</span>
  </div>
  <div class="mg">
    <div class="mc hl"><span class="mc-l">60岁起月领 ${mkF('?','176 + '+fmt(r.bTot)+'÷139 + '+r.eYr)}</span><div class="mc-vr"><span class="mc-v">${fmt(r.m60)}</span><span class="mc-s">元/月（`+A60+`年起）</span></div></div>
    <div class="mc hl"><span class="mc-l">65岁起月领 ${mkF('?',fmt(r.m60)+' + '+fmt(r.sTot)+'÷120 + 20 + 5')}</span><div class="mc-vr"><span class="mc-v">${fmt(r.m65)}</span><span class="mc-s">元/月（`+A65+`年起）</span></div></div>
    <div class="mc"><span class="mc-l">回本年龄 ${mkF('?','从60岁起年领×12，累计≥'+fmt(r.tPp)+'的年份')}</span><div class="mc-vr"><span class="mc-v">${r.pba?r.pba+'岁':'>95岁'}</span><span class="mc-s">终身发放·身故可继承</span></div></div>
    <div class="mc"><span class="mc-l">80岁回报率 ${mkF('?','('+fmt(r.c80)+'-'+fmt(r.tPp)+')÷'+fmt(r.tPp)+'×100%')}</span><div class="mc-vr"><span class="mc-v" style="color:${r.roi>0?'#1d7a44':'#b83525'}">${r.roi>0?'+':''}${r.roi.toFixed(1)}%</span><span class="mc-s">领至80岁口径</span></div></div>
    <div class="mc"><span class="mc-l">总投入本金</span><div class="mc-vr"><span class="mc-v">${(r.tPp/10000).toFixed(1)}</span><span class="mc-s">万元</span></div></div>
    <div class="mc"><span class="mc-l">领至80岁累计</span><div class="mc-vr"><span class="mc-v">${(r.c80/10000).toFixed(1)}</span><span class="mc-s">万元（含补贴${fmt(r.tGs)}元）</span></div></div>
    <div class="mc"><span class="mc-l">正常缴费年数</span><div class="mc-vr"><span class="mc-v">${r.nYr||(r.byr+(r.bfe-r.bfs+1))}</span><span class="mc-s">年（补缴不计入年限养老金）</span></div></div>
    <div class="mc"><span class="mc-l">年限养老金加成</span><div class="mc-vr"><span class="mc-v">+${r.eYr}</span><span class="mc-s">元/月（超15年${r.eYr}年×1元）</span></div></div>
  </div>
  <div class="pg">
    <div class="phc">
      <div class="phh b"><div class="phb">&#x1F3E0;</div><div><div class="pht">基本险阶段（60—64岁）</div><div class="pha">`+A60+`—`+(A65-1)+`年</div></div></div>
      <div class="phm"><div class="phml">月领金额 ${mkF('?','176 + '+fmt(r.bTot)+'÷139 + '+r.eYr)}</div><div class="phmv">${fmt(r.m60)}</div><div class="phu">元/月</div></div>
      <div class="phd">
        <div class="pdr"><span class="pdr-l">基础养老金（政府发）</span><span class="pdr-r">${r.bPn} 元</span></div>
        <div class="pdr"><span class="pdr-l">个人账户养老金 ${mkF('?',fmt(r.bTot)+'÷139='+fmt(r.bAcct))}</span><span class="pdr-r">${fmt(r.bAcct)} 元</span></div>
        <div class="pdr"><span class="pdr-l">年限养老金（${r.eYr}年×1元）</span><span class="pdr-r sb">+${r.eYr} 元</span></div>
        <div class="pdr" style="background:var(--w50);margin:4px -12px 0;padding:4px 12px;border-radius:0 0 6px 6px;"><span class="pdr-l" style="color:var(--w600);">基本险账户总额 ${mkF('?','历史+补缴+未来+补贴+资助，复利至'+A60+'年')}</span><span class="pdr-r" style="color:var(--w600);">${fmt(r.bTot)} 元</span></div>
      </div>
    </div>
    <div class="phc">
      <div class="phh s"><div class="phb">&#x1F343;</div><div><div class="pht">基本险+补充险（65岁起）</div><div class="pha">`+A65+`年起</div></div></div>
      <div class="phm" style="background:linear-gradient(135deg,var(--gn50) 0%,#fff 100%);"><div class="phml">月领金额</div><div class="phmv" style="color:var(--gn600);">${fmt(r.m65)}</div><div class="phu">元/月</div></div>
      <div class="phd">
        <div class="pdr"><span class="pdr-l">基本险月领（同上）</span><span class="pdr-r">${fmt(r.m60)} 元</span></div>
        <div class="pdr"><span class="pdr-l">补充险个人账户 ${mkF('?',fmt(r.sTot)+'÷120='+fmt(r.sAcct))}</span><span class="pdr-r">${fmt(r.sAcct)} 元</span></div>
        <div class="pdr"><span class="pdr-l">补充险出口补贴</span><span class="pdr-r sb">+${r.eS} 元</span></div>
        <div class="pdr"><span class="pdr-l">高龄补贴（65岁后）</span><span class="pdr-r sb">+${r.eB} 元</span></div>
        <div class="pdr" style="background:var(--gn50);margin:4px -12px 0;padding:4px 12px;border-radius:0 0 6px 6px;"><span class="pdr-l" style="color:var(--gn600);">补充险账户总额 ${mkF('?','历史+补缴+未来+补贴+资助，复利至'+A65+'年')}</span><span class="pdr-r" style="color:var(--gn600);">${fmt(r.sTot)} 元</span></div>
      </div>
    </div>
  </div>
  <div class="aw"><div class="at">&#x1F4DE; 基本险账户积累明细（至`+A60+`年·60岁）</div><div class="as"><table class="tb2"><thead><tr><th>项目</th><th>本金（元）</th><th>复利后（元）</th></tr></thead><tbody>
    <tr><td>历史正常缴费（`+r.byr+`年×`+(parseInt(d.vBha)||0)+`）</td><td>${fmt(r.byr*(parseInt(d.vBha)||0))}</td><td class="pos">${fmt(r.bHistPV)} ${mkF('?',r.byr+'年×'+(parseInt(d.vBha)||0)+'元，各年×(1+'+R+'%)^('+A60+'-缴费年份) 求和')}</td></tr>
    ${r.bgn>0?`<tr><td>断缴补缴（`+r.bgn+`年×`+r.bga+`，无补贴）</td><td>${fmt(r.bgn*r.bga)}</td><td class="pos">${fmt(r.bGpv)} ${mkF('?',(r.bgn*r.bga)+'×(1+'+R+'%)^'+(A60-r.bgy)+'='+fmt(r.bGpv))}</td></tr>`:''}
    <tr><td>个人未来缴费（`+(r.bfe-r.bfs+1)+`年×`+r.bfa+`）</td><td>${fmt((r.bfe-r.bfs+1)*r.bfa)}</td><td class="pos">${fmt(r.bFpv)} ${mkF('?',(r.bfe-r.bfs+1)+'年×'+r.bfa+'元，各年×(1+'+R+'%)^('+A60+'-缴费年份) 求和')}</td></tr>
    <tr><td>政府缴费补贴（`+(r.bfe-r.bfs+1)+`年×`+r.bsub+`）</td><td>${fmt((r.bfe-r.bfs+1)*r.bsub)}</td><td class="pos">${fmt(r.bSpv)} ${mkF('?',(r.bfe-r.bfs+1)+'年×'+r.bsub+'元，各年×(1+'+R+'%)^('+A60+'-缴费年份) 求和')}</td></tr>
    ${r.bcam>0?`<tr><td>子女资助基本险（`+(r.bfe-r.bcStart+1)+`年×`+r.bcam+`）</td><td>${fmt((r.bfe-r.bcStart+1)*r.bcam)}</td><td class="pos">${fmt(r.bCpv)} ${mkF('?',(r.bfe-r.bcStart+1)+'年×'+r.bcam+'元，各年×(1+'+R+'%)^('+A60+'-缴费年份) 求和')}</td></tr>`:''}
    <tr class="tr"><td>合计</td><td>—</td><td>${fmt(r.bTot)}</td></tr>
  </tbody></table></div></div>
  <div class="aw"><div class="at">&#x1F4DE; 补充险账户积累明细（至`+A65+`年·65岁）</div><div class="as"><table class="tb2"><thead><tr><th>项目</th><th>本金（元）</th><th>复利后（元）</th></tr></thead><tbody>
    <tr><td>历史正常缴费（`+r.syr+`年×`+(parseInt(d.vSha)||0)+`）</td><td>${fmt(r.syr*(parseInt(d.vSha)||0))}</td><td class="pos">${fmt(r.sHistPV)} ${mkF('?',r.syr+'年×'+(parseInt(d.vSha)||0)+'元，各年×(1+'+R+'%)^('+A65+'-缴费年份) 求和')}</td></tr>
    ${r.sgn>0?`<tr><td>断缴补缴（`+r.sgn+`年×`+r.sga+`，无补贴）</td><td>${fmt(r.sgn*r.sga)}</td><td class="pos">${fmt(r.sGpv)} ${mkF('?',(r.sgn*r.sga)+'×(1+'+R+'%)^'+(A65-r.sgy)+'='+fmt(r.sGpv))}</td></tr>`:''}
    <tr><td>个人未来缴费（`+(r.sfe-r.sfs+1)+`年×`+r.sfa+`）</td><td>${fmt((r.sfe-r.sfs+1)*r.sfa)}</td><td class="pos">${fmt(r.sFpv)} ${mkF('?',(r.sfe-r.sfs+1)+'年×'+r.sfa+'元，各年×(1+'+R+'%)^('+A65+'-缴费年份) 求和')}</td></tr>
    <tr><td>政府缴费补贴（`+(r.sfe-r.sfs+1)+`年×`+r.ssub+`）</td><td>${fmt((r.sfe-r.sfs+1)*r.ssub)}</td><td class="pos">${fmt(r.sSpv)} ${mkF('?',(r.sfe-r.sfs+1)+'年×'+r.ssub+'元，各年×(1+'+R+'%)^('+A65+'-缴费年份) 求和')}</td></tr>
    ${r.scam>0?`<tr><td>子女资助补充险（`+(r.sfe-r.scs+1)+`年×`+r.scam+`）</td><td>${fmt((r.sfe-r.scs+1)*r.scam)}</td><td class="pos">${fmt(r.sCpv)} ${mkF('?',(r.sfe-r.scs+1)+'年×'+r.scam+'元，各年×(1+'+R+'%)^('+A65+'-缴费年份) 求和')}</td></tr>`:''}
    <tr class="tr"><td>合计</td><td>—</td><td>${fmt(r.sTot)}</td></tr>
  </tbody></table></div></div>
  <div class="rc"><div class="rct">&#x1F4C8; 投资回报分析</div><div class="rg">
    <div class="ri"><div class="rl">总投入本金 ${mkF('?','历史+补缴+未来+资助（不含政府补贴）')}</div><div class="rv">${(r.tPp/10000).toFixed(2)} 万</div><div class="rs">不含政府补贴</div></div>
    <div class="ri"><div class="rl">政府补贴本金</div><div class="rv">${fmt(r.tGs)} 元</div><div class="rs">已计入账户复利增值</div></div>
    <div class="ri"><div class="rl">预计回本年龄 ${mkF('?','年领×12累加≥'+fmt(r.tPp)+'的年份')}</div><div class="rv">${r.pba?r.pba+'岁':'>95岁'}</div><div class="rs">终身发放·身故余额可全额继承</div></div>
    <div class="ri"><div class="rl">领至80岁累计</div><div class="rv">${(r.c80/10000).toFixed(2)} 万</div><div class="rs">约 ${(r.c80/Math.max(1,r.tPp)).toFixed(1)} 倍本金</div></div>
    <div class="ri"><div class="rl">80岁综合回报率 ${mkF('?','('+fmt(r.c80)+'-'+fmt(r.tPp)+')÷'+fmt(r.tPp)+'×100%')}</div><div class="rv" style="color:${r.roi>0?'#1d7a44':'#b83525'}">${r.roi>0?'+':''}${r.roi.toFixed(1)}%</div><div class="rs">领至80岁口径</div></div>
    <div class="ri"><div class="rl">65岁月领增量</div><div class="rv">+${fmt(r.m65-r.m60)}</div><div class="rs">元/月（补充险贡献）</div></div>
  </div></div>
  <div class="cw2"><div class="ct">&#x1F4CA; 累计领取 vs 总投入（按年龄）</div><div style="position:relative;width:100%;height:220px;"><canvas id="cumC" role="img" aria-label="累计领取折线图"></canvas></div></div>`;
  const rc=ge('rContent'); if(rc) rc.innerHTML=html;
  setTimeout(()=>drCumC(r),50);
}
// ===== CUMULATIVE CHART =====
function drCumC(r){
  const ctx=ge('cumC'); if(!ctx)return;
  const lbs=[],cd=[],pl=[];
  let cum=0;
  for(let a=60;a<=85;a++){lbs.push(a+'岁');cum+=(a>=65?r.m65:r.m60)*12;cd.push(Math.round(cum));pl.push(Math.round(r.tPp));}
  if(window._ci)window._ci.destroy();
  window._ci=new Chart(ctx,{type:'line',plugins:[_dlPlugin],data:{labels:lbs,datasets:[
    {label:'累计领取',data:cd,borderColor:'#e0a040',backgroundColor:'rgba(224,160,64,0.08)',borderWidth:2,pointRadius:2.5,pointHoverRadius:4,fill:true,tension:0.3},
    {label:'总投入',data:pl,borderColor:'#9c9890',backgroundColor:'transparent',borderWidth:1.5,borderDash:[6,3],pointRadius:0,fill:false,_ref:true}
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:'top',labels:{font:{size:10,family:'Noto Sans SC'},color:'#706c64',boxWidth:14,boxHeight:2,padding:8}},tooltip:{callbacks:{label:ctx=>`${ctx.dataset.label}: ¥${ctx.parsed.y.toLocaleString('zh-CN')}`}}},scales:{x:{grid:{color:'#eee'},ticks:{font:{size:10},color:'#9c9890',autoSkip:true,maxTicksLimit:10}},y:{grid:{color:'#eee'},ticks:{font:{size:10},color:'#9c9890',callback:v=>v>=10000?(v/10000).toFixed(0)+'万':v}}}}});
}
// ===== RENDER COMPARE =====
function rndC(){
  const wr=plans.filter(p=>p.r);
  if(wr.length<2){const c=ge('cContent');if(c)c.innerHTML='<div class="nr"><span class="nr-i">&#x1F5EE;&#xFE0F;</span><p>需要至少2个已测算的方案</p><p style="margin-top:4px;color:var(--g300);">请填写并测算多个方案</p></div>';return;}
  const rows=[
    {g:'基本信息',lb:'方案名称',fn:r=>r.nm},
    {g:'总投入',lb:'总投入本金',fn:r=>'¥'+fmt(r.tPp),best:'min'},
    {g:'总投入',lb:'政府补贴',fn:r=>'¥'+fmt(r.tGs)},
    {g:'账户',lb:'60岁账户总额',fn:r=>'¥'+fmt(Math.round(r.bTot))},
    {g:'账户',lb:'65岁账户总额',fn:r=>'¥'+fmt(Math.round(r.sTot))},
    {g:'月领',lb:'60—64岁月领',fn:r=>'¥'+fmt(Math.round(r.m60)),best:'max',raw:r=>r.m60},
    {g:'月领',lb:'65岁起月领',fn:r=>'¥'+fmt(Math.round(r.m65)),best:'max',raw:r=>r.m65},
    {g:'回报',lb:'回本年龄',fn:r=>r.pba?r.pba+'岁':'>95岁',best:'min',raw:r=>r.pba||99},
    {g:'回报',lb:'领至80岁累计',fn:r=>'¥'+fmt(Math.round(r.c80)),best:'max',raw:r=>r.c80},
    {g:'回报',lb:'80岁回报率',fn:r=>((r.roi>0?'+':'')+r.roi.toFixed(1)+'%'),best:'max',raw:r=>r.roi}
  ];
  let lg='',trs='';
  rows.forEach(row=>{
    if(row.g!==lg){trs+=`<tr class="gh"><td colspan="${1+wr.length}">${row.g}</td></tr>`;lg=row.g;}
    let bi=-1;
    if(row.best&&row.raw){const vs=wr.map(p=>row.raw(p.r));bi=row.best==='max'?vs.indexOf(Math.max(...vs)):vs.indexOf(Math.min(...vs));}
    const cells=wr.map((p,i)=>`<td class="${bi===i?'bst':''}">${row.fn(p.r)}</td>`).join('');
    trs+=`<tr><td class="rh">${row.lb}</td>${cells}</tr>`;
  });
  const hcs=wr.map(p=>`<th><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${p.c};margin-right:4px;vertical-align:middle;"></span>${p.nm}</th>`).join('');
  const html=`
  <div class="ctw"><div class="as"><table class="ctb"><thead><tr><th class="rh">对比维度</th>${hcs}</tr></thead><tbody>${trs}</tbody></table></div></div>
  <div class="cw2"><div class="ct">&#x1F4CA; 各方案月领金额对比</div><div style="position:relative;width:100%;height:${wr.length*50+80}px;"><canvas id="barC" role="img" aria-label="月领对比条形图"></canvas></div></div>
  <div class="cw2"><div class="ct">&#x1F4C8; 各方案累计领取对比（至85岁）</div><div style="position:relative;width:100%;height:240px;"><canvas id="lineC" role="img" aria-label="累计对比折线图"></canvas></div></div>`;
  const cc=ge('cContent'); if(cc) cc.innerHTML=html;
  setTimeout(()=>drCC(wr),50);
}
function drCC(wr){
  // Bar
  const bc=ge('barC'); if(bc){
    if(window._bi)window._bi.destroy();
    window._bi=new Chart(bc,{type:'bar',plugins:[_dlPlugin],data:{labels:wr.map(p=>p.nm),datasets:[
      {label:'60—64岁月领',data:wr.map(p=>Math.round(p.r.m60)),backgroundColor:wr.map(p=>p.c+'aa'),borderColor:wr.map(p=>p.c),borderWidth:1.5,borderRadius:5},
      {label:'65岁起月领',data:wr.map(p=>Math.round(p.r.m65)),backgroundColor:wr.map(p=>p.c+'44'),borderColor:wr.map(p=>p.c),borderWidth:1.5,borderRadius:5,borderDash:[4,2]}
    ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:'top',labels:{font:{size:10,family:'Noto Sans SC'},color:'#706c64',boxWidth:14,boxHeight:8,padding:8}}},scales:{x:{grid:{display:false},ticks:{font:{size:11},color:'#706c64'}},y:{grid:{color:'#eee'},ticks:{font:{size:10},color:'#9c9890',callback:v=>'¥'+v}}}}});
  }
  // Line
  const lc=ge('lineC'); if(lc){
    if(window._li)window._li.destroy();
    const al=[]; for(let a=60;a<=85;a++) al.push(a+'岁');
    const dss=wr.map(p=>{
      const data=[]; let cum=0;
      for(let age=60;age<=85;age++){cum+=(age>=65?p.r.m65:p.r.m60)*12;data.push(Math.round(cum));}
      return {label:p.nm+' 累计领取',data,borderColor:p.c,backgroundColor:p.c+'15',borderWidth:2,pointRadius:2.5,pointHoverRadius:4,fill:false,tension:0.3};
    });
    // 每个方案加一条投入成本参考线（虚线）
    wr.forEach(p=>{
      const tPp=Math.round(p.r.tPp);
      const ref=al.map(()=>tPp);
      dss.push({label:p.nm+' 投入成本',data:ref,borderColor:p.c+'88',backgroundColor:'transparent',borderWidth:1.5,borderDash:[6,3],pointRadius:0,fill:false,_ref:true});
    });
    window._li=new Chart(lc,{type:'line',plugins:[_dlPlugin],data:{labels:al,datasets:dss},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:'top',labels:{font:{size:10,family:'Noto Sans SC'},color:'#706c64',boxWidth:14,boxHeight:2,padding:8}}},scales:{x:{grid:{color:'#eee'},ticks:{font:{size:10},color:'#9c9890',autoSkip:true,maxTicksLimit:10}},y:{grid:{color:'#eee'},ticks:{font:{size:10},color:'#9c9890',callback:v=>v>=10000?(v/10000).toFixed(0)+'万':v}}}}});
  }
}
// ===== TOAST =====
function t(msg){
  const el=ge('toast'); if(!el)return;
  el.textContent=msg; el.classList.add('on');
  setTimeout(()=>el.classList.remove('on'),2200);
}
document.addEventListener('DOMContentLoaded',init);
