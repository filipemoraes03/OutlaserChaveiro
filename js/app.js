
(() => {
'use strict';
const $ = (s, r=document) => r.querySelector(s);
const h = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const BRL = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const money = v => BRL.format(+v||0);
const num = v => { const n = parseFloat(String(v).replace(/\./g,'').replace(',','.')); return isFinite(n)?n:0; };
const numIn = v => { const s=String(v).trim(); if(/,/.test(s)) return num(s); const n=parseFloat(s); return isFinite(n)?n:0; };
const digits = s => (s||'').replace(/\D/g,'');
const uid = p => p + '_' + Math.random().toString(36).slice(2,9) + Date.now().toString(36).slice(-3);
const fmtDate = t => t ? new Date(t).toLocaleDateString('pt-BR') : '—';
const fmtDateISO = s => { if(!s) return '—'; const [y,m,d]=s.split('-'); return `${d}/${m}/${y}`; };
const today = () => { const d=new Date(); return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10); };
const addDays = (n) => { const d=new Date(Date.now()+n*864e5); return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10); };

/* ---------- Ícones ---------- */
const I = {
  dash:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  orders:'<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/>',
  nfc:'<path d="M7 15c2.8-2.8 7.2-2.8 10 0"/><path d="M4.5 12c4.2-4.1 10.8-4.1 15 0"/><path d="M9.5 18c1.4-1.3 3.6-1.3 5 0"/>',
  clients:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .7 3.2 2.5 3.6 5.2"/>',
  products:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
  cfg:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  wa:'<path d="M4 20l1.3-4A8 8 0 1 1 8.2 19z"/><path d="M9 9.5c.3 2 2.5 4.3 4.5 4.8l1-1.2 2 .9c-.3 1.3-1.3 2-2.6 1.8C11 15.4 8.7 13 8.2 10.3 8 9 8.7 8 10 7.7l.9 2z"/>',
  ig:'<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r=".6"/>',
  star:'<path d="M12 4l2.4 5 5.4.7-4 3.8 1 5.4L12 16.3 7.2 19l1-5.4-4-3.8 5.4-.7z"/>',
  mail:'<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M4 7l8 6 8-6"/>',
  tel:'<path d="M6 4h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2L16 13.5l4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 2-2z"/>',
  card:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16c.6-1.5 1.8-2.3 3.2-2.3s2.6.8 3.2 2.3M14.5 10h3.5M14.5 13h3.5"/>'
};
const svg = (k, extra='') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${I[k]}</svg>`;

/* ---------- Domínio ---------- */
const STATUS = ['Orçamento','Aprovado','Produção','Gravação NFC','Pronto','Entregue','Cancelado'];
const ST_CLS = {'Orçamento':'st-orc','Aprovado':'st-apr','Produção':'st-prod','Gravação NFC':'st-grav','Pronto':'st-pronto','Entregue':'st-ent','Cancelado':'st-canc'};
const stChip = s => `<span class="st ${ST_CLS[s]||'st-orc'}"><i></i>${h(s)}</span>`;
const TIPOS_CLI = ['Empresa','Profissional','Agência','Evento'];
const FORMAS = ['Pix','Boleto','Cartão','Dinheiro','Transferência'];
const CAP = {NTAG213:137, NTAG215:496, NTAG216:868};

const subtotal = p => (p.itens||[]).reduce((a,i)=>a + (+i.qtd||0)*(+i.preco||0), 0);
const total = p => Math.max(0, subtotal(p) - (+p.desconto||0) + (+p.frete||0));
const pago = p => +(p.pagamento&&p.pagamento.pago)||0;
const payState = p => { const t=total(p), g=pago(p); if(g<=0) return ['Pendente','pend']; if(g+0.005<t) return ['Sinal '+money(g),'sinal']; return ['Pago','pago']; };
const qtdNFC = p => (p.itens||[]).reduce((a,i)=>{ const pr=S.produtos[i.produtoId]; return a + ((pr?pr.nfc!==false:true)? (+i.qtd||0):0); }, 0);
const custo = p => (p.itens||[]).reduce((a,i)=>{ const pr=S.produtos[i.produtoId]; return a + (+i.qtd||0)*(pr?+pr.custo||0:0); }, 0);
const cliente = id => S.clientes[id] || {nome:'Cliente removido'};
const tierPrice = (pr, q) => { let v=+pr.preco||0; (pr.faixas||[]).slice().sort((a,b)=>a.min-b.min).forEach(f=>{ if(q>=f.min) v=+f.preco; }); return v; };
const isOpen = p => !['Entregue','Cancelado','Orçamento'].includes(p.status);
const isSale = p => !['Orçamento','Cancelado'].includes(p.status);

/* Destinos NFC */
const DEST = [
  {id:'link', label:'Site / link', icon:'link', fields:[{k:'url',label:'Endereço',type:'url',ph:'empresa.com.br',full:1}], build:v=>normUrl(v.url)},
  {id:'wa', label:'WhatsApp', icon:'wa', fields:[{k:'phone',label:'Número com DDD',type:'tel',ph:'(19) 99999-9999'},{k:'country',label:'País',type:'text',ph:'55',def:'55'},{k:'msg',label:'Mensagem pronta (opcional)',type:'textarea',full:1}],
    build:v=>{ if(digits(v.phone).length<10) return {err:'Informe o número com DDD.'}; return 'https://wa.me/'+digits(v.country||'55')+digits(v.phone)+(v.msg&&v.msg.trim()?'?text='+encodeURIComponent(v.msg.trim()):''); }},
  {id:'ig', label:'Instagram', icon:'ig', fields:[{k:'user',label:'Perfil',type:'text',ph:'@perfil',full:1}],
    build:v=>{ const u=(v.user||'').trim().replace(/^@/,'').replace(/^https?:\/\/(www\.)?instagram\.com\//,'').replace(/\/.*$/,''); return u?'https://instagram.com/'+u:{err:'Informe o @ do perfil.'}; }},
  {id:'review', label:'Avaliação Google', icon:'star', fields:[{k:'url',label:'Link de avaliação',type:'url',ph:'https://g.page/r/XXXX/review',full:1,hint:'Perfil da Empresa no Google → Pedir avaliações → copiar link.'}], build:v=>v.url?normUrl(v.url):{err:'Cole o link de avaliação do Google.'}},
  {id:'mail', label:'E-mail', icon:'mail', fields:[{k:'to',label:'E-mail',type:'email'},{k:'subject',label:'Assunto (opcional)',type:'text'}],
    build:v=>/.+@.+\..+/.test(v.to||'')?'mailto:'+v.to.trim()+(v.subject?'?subject='+encodeURIComponent(v.subject):''):{err:'E-mail inválido.'}},
  {id:'tel', label:'Ligação', icon:'tel', fields:[{k:'phone',label:'Telefone com DDD',type:'tel',full:1}], build:v=>digits(v.phone).length>=10?'tel:+55'+digits(v.phone):{err:'Informe o telefone com DDD.'}},
  {id:'vcard', label:'Cartão de contato', icon:'card', fields:[{k:'name',label:'Nome',type:'text'},{k:'org',label:'Empresa',type:'text'},{k:'phone',label:'Celular',type:'tel'},{k:'email',label:'E-mail',type:'email'},{k:'site',label:'Site (opcional)',type:'url',full:1}],
    build:v=>{ if(!v.name) return {err:'Informe o nome.'}; const L=['BEGIN:VCARD','VERSION:3.0','FN:'+v.name.trim()];
      if(v.org) L.push('ORG:'+v.org.trim()); if(digits(v.phone)) L.push('TEL;TYPE=CELL:+55'+digits(v.phone)); if(v.email) L.push('EMAIL:'+v.email.trim());
      if(v.site){ const s=normUrl(v.site); if(typeof s==='string') L.push('URL:'+s); } L.push('END:VCARD'); return {vcard:L.join('\n')}; }}
];
function normUrl(u){ u=(u||'').trim(); if(!u) return {err:'Informe o endereço.'}; if(!/^[a-z][a-z0-9+.-]*:/i.test(u)) u='https://'+u;
  try{ const x=new URL(u); if(!/\./.test(x.hostname)) return {err:'Endereço incompleto.'}; return x.href; }catch(e){ return {err:'Endereço inválido.'}; } }
function buildDest(tipo, campos){ const d=DEST.find(x=>x.id===tipo)||DEST[0]; const r=d.build(campos||{}); if(r&&r.err) return r; return typeof r==='string'?{valor:r}:{valor:r.vcard, vcard:true}; }
const PREFIX=['http://www.','https://www.','http://','https://','tel:','mailto:'];
function ndefBytes(valor, isV){ let payload,typeLen;
  if(isV){ payload=new TextEncoder().encode(valor).length; typeLen=10; }
  else { let s=valor; for(const p of PREFIX){ if(s.startsWith(p)){ s=s.slice(p.length); break; } } payload=1+new TextEncoder().encode(s).length; typeLen=1; }
  const rec=3+(payload>255?3:0)+typeLen+payload; return rec+(rec>254?4:2)+1; }
const isVcard = v => /^BEGIN:VCARD/.test(v||'');

/* ---------- Armazenamento: nuvem do artifact (db) ou aparelho (localStorage) ---------- */
const S = {clientes:{}, produtos:{}, pedidos:{}, config:{empresa:'OUTLASER', whatsapp:'', gravadorUrl:''}};
let mode = 'boot', DB = null, DL = null, readOnly = false;
const LS_KEY = 'outlaser_nfc_app_v1';
function saveLocal(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){} }
function loadLocal(){ let d=null; try{ d=JSON.parse(localStorage.getItem(LS_KEY)||'null'); }catch(e){}
  if(!d){ d=JSON.parse(JSON.stringify(SAMPLE)); }
  ['clientes','produtos','pedidos'].forEach(k=>S[k]=d[k]||{}); S.config=Object.assign(S.config, d.config||{}); saveLocal(); }
function dbErr(e){ const c=e&&e.code;
  if(c==='invalid_argument'){ readOnly=true; toast('Seu acesso é só de leitura. Peça acesso de edição ao dono.'); }
  else if(c==='quota_exceeded') toast('Limite de registros atingido. Apague pedidos antigos ou exemplos.');
  else toast('Não salvou. Verifique a conexão e tente de novo.'); }
const store = {
  async put(col, id, obj){ S[col][id]=obj; scheduleRender();
    if(mode==='db'){ try{ await DB.collection(col).doc(id).set(obj); }catch(e){ dbErr(e); } } else saveLocal(); },
  async del(col, id){ delete S[col][id]; scheduleRender();
    if(mode==='db'){ try{ await DB.collection(col).doc(id).delete(); }catch(e){ dbErr(e); } } else saveLocal(); },
  async config(obj){ S.config=obj; scheduleRender();
    if(mode==='db'){ try{ await DB.doc('config/geral').set(obj); }catch(e){ dbErr(e); } } else saveLocal(); }
};
function subscribe(){
  ['clientes','produtos','pedidos'].forEach(col=>{
    DB.collection(col).onSnapshot(snap=>{ const o={}; snap.docs.forEach(d=>{ o[d.id]=d.data(); }); S[col]=o; loaded[col]=true; scheduleRender(); },
      e=>{ if(e&&e.code==='revoked'){ toast('Acesso aos dados foi encerrado.'); } });
  });
  DB.doc('config/geral').onSnapshot(s=>{ if(s.exists) S.config=Object.assign({empresa:'OUTLASER',whatsapp:'',gravadorUrl:''}, s.data()); loaded.config=true; scheduleRender(); });
}
const loaded = {};

/* ---------- NFC ---------- */
const framed = (()=>{ try{ return window.self!==window.top; }catch(e){ return true; } })();
const hasNFC = 'NDEFReader' in window;
const nfcReal = hasNFC && !framed && window.isSecureContext;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);

/* ---------- Navegação ---------- */
const VIEWS = [
  {id:'painel', label:'Painel', icon:'dash'},
  {id:'pedidos', label:'Pedidos', icon:'orders'},
  {id:'gravar', label:'Gravar NFC', short:'Gravar', icon:'nfc'},
  {id:'clientes', label:'Clientes', icon:'clients'},
  {id:'produtos', label:'Produtos', icon:'products'},
  {id:'config', label:'Configurações', icon:'cfg', desktopOnly:true}
];
let view = 'painel';
const ui = {pedFiltro:'Abertos', pedBusca:'', cliBusca:'', gravPedido:'', gravAvulso:{tipo:'link',campos:{}}};
try{ const s=JSON.parse(localStorage.getItem('outlaser_ui')||'null'); if(s&&s.view) view=s.view; }catch(e){}
if(location.hash && VIEWS.some(v=>'#'+v.id===location.hash)) view=location.hash.slice(1);
function go(v){ if(gctrl){ gctrl.abort(); } if(rctrl){ stopRead(); } view=v; try{ localStorage.setItem('outlaser_ui', JSON.stringify({view})); }catch(e){} gravMounted=false; render(); window.scrollTo(0,0); }

function renderNav(){
  const open = Object.values(S.pedidos).filter(isOpen).length;
  const toGrav = Object.values(S.pedidos).filter(p=>['Aprovado','Produção','Gravação NFC'].includes(p.status) && (p.gravadas||0)<qtdNFC(p)).length;
  $('#nav').innerHTML = VIEWS.map(v=>`<button type="button" data-go="${v.id}" ${view===v.id?'aria-current="page"':''}>${svg(v.icon)}${v.label}${v.id==='pedidos'&&open?`<span class="badge">${open}</span>`:''}${v.id==='gravar'&&toGrav?`<span class="badge">${toGrav}</span>`:''}</button>`).join('');
  $('#bnav').innerHTML = VIEWS.filter(v=>!v.desktopOnly).map(v=>`<button type="button" data-go="${v.id}" ${view===v.id?'aria-current="page"':''}>${svg(v.icon)}${v.short||v.label}</button>`).join('');
  $('#modeLbl').innerHTML = mode==='db' ? '<span class="dot ok"></span>Dados salvos na nuvem' : mode==='local' ? '<span class="dot warn"></span>Dados salvos neste aparelho' : '<span class="dot"></span>Conectando…';
  $('#nfcLbl').innerHTML = nfcReal ? '<span class="dot ok"></span>NFC pronto para gravar' : '<span class="dot warn"></span>NFC em modo demonstração';
}
document.addEventListener('click', e=>{ const b=e.target.closest('[data-go]'); if(b){ go(b.dataset.go); } });
$('#cfgTop').onclick = ()=>go('config');

/* ---------- Render ---------- */
let rq=null;
function scheduleRender(){ if(rq) return; rq=requestAnimationFrame(()=>{ rq=null; render(); }); }
let gravMounted=false;
function render(){
  renderNav();
  if(mode==='boot'){ return; }
  const m=$('#main');
  if(view==='gravar'){ if(gravMounted){ refreshGravContext(); return; } m.innerHTML=vGravar(); mountGravar(); gravMounted=true; return; }
  gravMounted=false;
  m.innerHTML = ({painel:vPainel, pedidos:vPedidos, clientes:vClientes, produtos:vProdutos, config:vConfig}[view]||vPainel)();
  if(view==='config') mountConfig();
  if(view==='pedidos') mountPedidos();
  if(view==='clientes') mountClientes();
}

/* ---------- Painel ---------- */
function vPainel(){
  const P=Object.values(S.pedidos);
  const now=new Date(); const ym=now.getFullYear()*12+now.getMonth();
  const monthOf = t => { const d=new Date(t); return d.getFullYear()*12+d.getMonth(); };
  const mes = P.filter(p=>isSale(p) && monthOf(p.criado)===ym);
  const fat = mes.reduce((a,p)=>a+total(p),0);
  const receber = P.filter(isSale).reduce((a,p)=>a+Math.max(0,total(p)-pago(p)),0);
  const abertos = P.filter(isOpen);
  const aGravar = P.filter(p=>['Aprovado','Produção','Gravação NFC'].includes(p.status)).reduce((a,p)=>a+Math.max(0,qtdNFC(p)-(p.gravadas||0)),0);
  const mesNome = now.toLocaleDateString('pt-BR',{month:'long'});
  // gráfico 6 meses
  const months=[]; for(let i=5;i>=0;i--){ const k=ym-i; const y=Math.floor(k/12), mo=k%12; months.push({k,lbl:new Date(y,mo,1).toLocaleDateString('pt-BR',{month:'short'}).replace('.',''),v:0}); }
  P.filter(isSale).forEach(p=>{ const m=months.find(x=>x.k===monthOf(p.criado)); if(m) m.v+=total(p); });
  const max=Math.max(1,...months.map(m=>m.v)); const nice=niceMax(max);
  const W=560,H=210,pl=46,pb=26,pt=22,cw=(W-pl-10)/6;
  const y=v=>pt+(H-pt-pb)*(1-v/nice);
  let g=''; for(let i=0;i<=4;i++){ const v=nice*i/4; g+=`<line x1="${pl}" x2="${W-6}" y1="${y(v)}" y2="${y(v)}" stroke="#34302a" stroke-dasharray="${i?'2 4':''}"/><text x="${pl-8}" y="${y(v)+4}" text-anchor="end">${v>=1000?(v/1000).toLocaleString('pt-BR',{maximumFractionDigits:1})+'k':Math.round(v)}</text>`; }
  months.forEach((m,i)=>{ const x=pl+i*cw+cw*0.2, w=cw*0.6, last=i===5; const top=y(m.v);
    g+=`<rect x="${x}" y="${top}" width="${w}" height="${Math.max(0,H-pb-top)}" rx="3" fill="${last?'#E8C474':'#C99D43'}" opacity="${last?1:.55}"/>`;
    g+=`<text x="${x+w/2}" y="${H-8}" text-anchor="middle">${m.lbl}</text>`;
    if(m.v>0) g+=`<text class="val" x="${x+w/2}" y="${top-6}" text-anchor="middle">${m.v>=1000?(m.v/1000).toLocaleString('pt-BR',{maximumFractionDigits:1})+'k':Math.round(m.v)}</text>`; });
  const pipe = ['Orçamento','Aprovado','Produção','Gravação NFC','Pronto'].map(s=>({s,n:P.filter(p=>p.status===s).length}));
  const prox = abertos.filter(p=>p.status!=='Pronto'||true).sort((a,b)=>(a.prazo||'9').localeCompare(b.prazo||'9')).slice(0,6);
  const hasEx = [...Object.values(S.pedidos),...Object.values(S.clientes),...Object.values(S.produtos)].some(x=>x.ex);
  return `
  <div class="phead"><div><h1>Painel</h1><p>${h(S.config.empresa||'OUTLASER')} · ${new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</p></div>
    <div class="btns"><button class="btn" data-go="gravar">${svg('nfc')}Gravar NFC</button><button class="btn gold" id="newOrder">${svg('plus')}Novo pedido</button></div></div>
  ${hasEx?`<div class="notice info" style="margin-bottom:16px">Os registros marcados como <span class="ex" style="margin:0">exemplo</span> são fictícios, para você ver o app funcionando. Apague todos em <a href="#config" data-go="config">Configurações</a>.</div>`:''}
  <div class="kpis">
    <div class="kpi hi"><div class="l">Vendas em ${h(mesNome)}</div><div class="v">${money(fat)}</div><div class="s">${mes.length} pedido${mes.length===1?'':'s'} fechado${mes.length===1?'':'s'}</div></div>
    <div class="kpi"><div class="l">A receber</div><div class="v">${money(receber)}</div><div class="s">de pedidos fechados</div></div>
    <div class="kpi"><div class="l">Pedidos em aberto</div><div class="v">${abertos.length}</div><div class="s">aprovados até pronto</div></div>
    <div class="kpi"><div class="l">Chaveiros a gravar</div><div class="v">${aGravar}</div><div class="s">tags NFC pendentes</div></div>
  </div>
  <div class="card" style="margin-bottom:16px"><h3>Funil de pedidos</h3>
    <div class="pipe" style="grid-template-columns:repeat(5,minmax(0,1fr))">${pipe.map(x=>`<button type="button" data-filter="${h(x.s)}"><div class="n">${x.n}</div><div class="t">${stChip(x.s).replace('class="st','class="st" style="padding:0;background:none;border:0" data-x="')}</div></button>`).join('')}</div>
  </div>
  <div class="grid2">
    <div class="card chart"><h3>Vendas por mês (R$)</h3><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Vendas dos últimos 6 meses">${g}</svg></div>
    <div class="card"><h3>Próximas entregas</h3>
      ${prox.length?`<div class="rows">${prox.map(p=>`<div class="r" data-order="${h(p._id)}"><span class="cell-main">${h(p.numero)} · ${h(cliente(p.clienteId).nome)}</span><span class="mono" style="font-size:12.5px">${fmtDateISO(p.prazo)}</span><span class="cell-sub">${qtdNFC(p)} chaveiros · ${money(total(p))}</span><span>${stChip(p.status)}</span></div>`).join('')}</div>`
      :`<div class="empty"><b>Nada em aberto</b>Pedidos aprovados aparecem aqui por data de entrega.</div>`}
    </div>
  </div>`;
}
function niceMax(v){ const p=Math.pow(10,Math.floor(Math.log10(v))); for(const m of [1,2,2.5,5,10]){ if(m*p>=v) return m*p; } return 10*p; }
document.addEventListener('click', e=>{
  const f=e.target.closest('[data-filter]'); if(f){ ui.pedFiltro=f.dataset.filter; go('pedidos'); return; }
  const o=e.target.closest('[data-order]'); if(o){ openOrder(o.dataset.order); return; }
  if(e.target.closest('#newOrder')){ orderForm(); return; }
});

/* ---------- Pedidos ---------- */
function withIds(col){ return Object.entries(S[col]).map(([id,v])=>Object.assign({_id:id}, v)); }
// garante _id nos pedidos
function P(){ return withIds('pedidos'); }
function vPedidos(){
  const all=P();
  const filtros=['Abertos','Todos',...STATUS];
  const cnt=f=> f==='Todos'?all.length : f==='Abertos'?all.filter(isOpen).length : all.filter(p=>p.status===f).length;
  return `
  <div class="phead"><div><h1>Pedidos</h1><p>Vendas, produção e gravação de cada lote.</p></div>
    <div class="btns"><button class="btn" id="csvOrders">Exportar CSV</button><button class="btn gold" id="newOrder">${svg('plus')}Novo pedido</button></div></div>
  <div class="toolbar"><div class="search">${svg('search')}<input type="search" id="pedBusca" placeholder="Buscar por número, cliente ou link" value="${h(ui.pedBusca)}" aria-label="Buscar pedidos"></div></div>
  <div class="chips" id="pedChips" style="margin-bottom:14px">${filtros.map(f=>`<button type="button" data-f="${h(f)}" aria-pressed="${ui.pedFiltro===f}">${h(f)}<span class="c">${cnt(f)}</span></button>`).join('')}</div>
  <div id="pedList">${pedidosList()}</div>`;
}
function pedidosFiltered(){
  const q=ui.pedBusca.trim().toLowerCase();
  return P().filter(p=> ui.pedFiltro==='Todos' ? true : ui.pedFiltro==='Abertos' ? isOpen(p) : p.status===ui.pedFiltro)
    .filter(p=>!q || [p.numero, cliente(p.clienteId).nome, p.destino&&p.destino.valor].join(' ').toLowerCase().includes(q))
    .sort((a,b)=>(b.criado||0)-(a.criado||0));
}
function progHTML(p){ const t=qtdNFC(p), g=Math.min(p.gravadas||0,t); const pct=t?g/t*100:0;
  return `<div class="prog"><div class="bar"><span class="${g>=t&&t?'full':''}" style="width:${pct}%"></span></div><span class="t">${g}/${t}</span></div>`; }
function pedidosList(){
  const L=pedidosFiltered();
  if(!L.length) return `<div class="card empty"><b>Nenhum pedido aqui</b>Crie um pedido em “Novo pedido” ou mude o filtro.</div>`;
  return `<div class="tbl-wrap resp"><table><thead><tr><th>Pedido</th><th>Cliente</th><th>Status</th><th>Gravação</th><th>Entrega</th><th class="num">Total</th><th>Pagamento</th></tr></thead><tbody>
  ${L.map(p=>{ const [pl,pc]=payState(p); return `<tr data-order="${h(p._id)}"><td style="white-space:nowrap"><span class="cell-main mono">${h(p.numero)}</span><div class="cell-sub">${fmtDate(p.criado)}${p.ex?'<span class="ex">exemplo</span>':''}</div></td>
    <td><span class="cell-main">${h(cliente(p.clienteId).nome)}</span><div class="cell-sub">${(p.itens||[]).map(i=>i.qtd+'× '+h(i.nome)).join(', ')}</div></td>
    <td>${stChip(p.status)}</td><td>${progHTML(p)}</td><td class="mono" style="white-space:nowrap">${fmtDateISO(p.prazo)}</td>
    <td class="num">${money(total(p))}</td><td><span class="pay ${pc}">${h(pl)}</span></td></tr>`; }).join('')}
  </tbody></table></div>
  <div class="mlist">${L.map(p=>{ const [pl,pc]=payState(p); return `<div class="mrow" data-order="${h(p._id)}">
    <div><span class="cell-main mono">${h(p.numero)}</span>${p.ex?'<span class="ex">exemplo</span>':''}<div class="cell-main" style="font-family:var(--f-body)">${h(cliente(p.clienteId).nome)}</div></div>
    <div class="r"><div class="mono cell-main">${money(total(p))}</div><span class="pay ${pc}">${h(pl)}</span></div>
    <div>${stChip(p.status)}</div><div class="r mono cell-sub">entrega ${fmtDateISO(p.prazo)}</div>
    <div style="grid-column:1/-1">${progHTML(p)}</div></div>`; }).join('')}</div>`;
}
function mountPedidos(){
  $('#pedBusca').oninput=e=>{ ui.pedBusca=e.target.value; $('#pedList').innerHTML=pedidosList(); };
  $('#pedChips').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; ui.pedFiltro=b.dataset.f; render(); };
  $('#csvOrders').onclick=()=>{ const rows=[['pedido','data','cliente','status','itens','qtd_nfc','gravadas','total','pago','forma','entrega','destino_nfc']];
    P().sort((a,b)=>(a.criado||0)-(b.criado||0)).forEach(p=>rows.push([p.numero,fmtDate(p.criado),cliente(p.clienteId).nome,p.status,(p.itens||[]).map(i=>i.qtd+'x '+i.nome).join(' + '),qtdNFC(p),p.gravadas||0,total(p).toFixed(2).replace('.',','),pago(p).toFixed(2).replace('.',','),(p.pagamento||{}).forma||'',fmtDateISO(p.prazo),(p.destino||{}).valor||'']));
    saveFile('pedidos-outlaser.csv', '﻿'+rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(';')).join('\n'), 'text/csv'); };
}

/* ---------- Drawer ---------- */
function drawer(title, body, foot){  const root=$('#drawerRoot');
  root.innerHTML=`<div class="scrim" id="scrim"><div class="drawer" role="dialog" aria-modal="true" aria-label="${h(title)}">
    <div class="dhead"><h2>${h(title)}</h2><button class="iconbtn" id="dClose" aria-label="Fechar">${svg('x')}</button></div>
    <div class="dbody" id="dBody">${body}</div>${foot?`<div class="dfoot" id="dFoot">${foot}</div>`:''}</div></div>`;
  $('#dClose').onclick=closeDrawer; $('#scrim').addEventListener('mousedown',e=>{ if(e.target.id==='scrim') closeDrawer(); });
  document.body.style.overflow='hidden';
  return root;
}
function closeDrawer(){ $('#drawerRoot').innerHTML=''; document.body.style.overflow=''; }
document.addEventListener('keydown',e=>{ if(e.key==='Escape' && $('#scrim')) closeDrawer(); });

/* ---------- Detalhe do pedido ---------- */
function openOrder(id){
  const p=S.pedidos[id]; if(!p) return;
  const c=cliente(p.clienteId); const t=total(p), g=pago(p); const [pl,pc]=payState(p);
  const cu=custo(p), rec=subtotal(p)-(+p.desconto||0); const mg=rec>0?(rec-cu)/rec*100:0;
  const idx=STATUS.indexOf(p.status);
  const d=p.destino||{};
  const body=`
    <div class="btns" style="justify-content:space-between">${stChip(p.status)}<span class="pay ${pc}">${h(pl)}</span></div>
    <div class="sec"><div class="lbl">Etapa</div>
      <div class="stepper" id="stepper">${STATUS.filter(s=>s!=='Cancelado').map((s,i)=>`<button type="button" data-st="${h(s)}" class="${s===p.status?'cur':(i<idx&&p.status!=='Cancelado'?'done':'')}">${h(s)}</button>`).join('')}</div>
    </div>
    <div class="sec"><div class="lbl">Cliente</div>
      <dl class="kv"><dt>Nome</dt><dd><b>${h(c.nome)}</b> <span class="muted">· ${h(c.tipo||'')}</span></dd>
      ${c.contato?`<dt>Contato</dt><dd>${h(c.contato)}</dd>`:''}${c.whatsapp?`<dt>WhatsApp</dt><dd class="mono">${h(c.whatsapp)}</dd>`:''}${c.email?`<dt>E-mail</dt><dd>${h(c.email)}</dd>`:''}</dl>
    </div>
    <div class="sec"><div class="lbl">Itens e valores</div>
      <div class="totals">${(p.itens||[]).map(i=>`<span>${i.qtd}× ${h(i.nome)} <span class="dim">(${money(i.preco)})</span></span><span class="v">${money(i.qtd*i.preco)}</span>`).join('')}
        ${+p.desconto?`<span class="dim">Desconto</span><span class="v dim">− ${money(p.desconto)}</span>`:''}${+p.frete?`<span class="dim">Frete</span><span class="v dim">${money(p.frete)}</span>`:''}
        <span class="big">Total</span><span class="v big">${money(t)}</span>
        <span class="dim">Pago (${h((p.pagamento||{}).forma||'—')})</span><span class="v dim">${money(g)}</span>
        <span class="dim">Custo estimado · margem bruta</span><span class="v dim">${money(cu)} · ${mg.toFixed(0)}%</span></div>
      ${g+0.005<t && isSale(p)?`<div class="btns"><button class="btn sm" id="markPaid">Registrar pagamento total</button></div>`:''}
    </div>
    <div class="sec"><div class="lbl">Chaveiro NFC</div>
      <dl class="kv"><dt>Destino</dt><dd class="mono" style="font-size:12.5px;color:var(--gold-hi);white-space:pre-wrap">${h(d.valor||'—')}</dd>
        <dt>Tag</dt><dd>${h(p.tagModelo||'NTAG213')}${p.bloquear?' · bloquear após gravar':''}</dd>
        <dt>Gravação</dt><dd>${progHTML(p)}</dd><dt>Entrega</dt><dd>${fmtDateISO(p.prazo)}</dd></dl>
      <div class="btns"><button class="btn gold" id="gravThis">${svg('nfc')}Gravar chaveiros deste pedido</button>${d.valor&&!isVcard(d.valor)?`<a class="btn" href="${h(d.valor)}" target="_blank" rel="noopener">Testar link ↗</a>`:''}</div>
    </div>
    <div class="sec"><div class="lbl">Mensagem para o cliente</div>
      <textarea id="clientMsg" rows="7" aria-label="Mensagem para o cliente">${h(clientMessage(p))}</textarea>
      <div class="btns"><button class="btn sm" id="copyMsg">${svg('copy')}Copiar mensagem</button>${c.whatsapp?`<a class="btn sm" id="waLink" target="_blank" rel="noopener" href="https://wa.me/55${digits(c.whatsapp)}?text=${encodeURIComponent(clientMessage(p))}">Abrir WhatsApp ↗</a><span class="hint mono">${h(c.whatsapp)}</span>`:''}</div>
    </div>
    ${p.obs?`<div class="sec"><div class="lbl">Observações</div><p style="margin:0;white-space:pre-wrap">${h(p.obs)}</p></div>`:''}
    <div class="sec"><div class="lbl">Histórico</div><ul class="hist">${(p.historico||[]).slice().reverse().map(x=>`<li><span class="mono">${new Date(x.t).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</span> · <b>${h(x.status||x.nota)}</b>${x.nota&&x.status?' — '+h(x.nota):''}</li>`).join('')}</ul></div>`;
  const foot=`<div class="btns">${p.status!=='Cancelado'?`<button class="btn danger sm" id="cancelO">Cancelar pedido</button>`:''}<button class="btn danger sm" id="delO">Excluir</button></div>
    <div class="btns"><button class="btn" id="dupO">Duplicar</button><button class="btn gold" id="editO">${svg('edit')}Editar</button></div>`;
  drawer(`Pedido ${p.numero}`, body, foot);
  $('#stepper').onclick=e=>{ const b=e.target.closest('button'); if(!b||readOnly) return; setStatus(id,b.dataset.st); };
  const mp=$('#markPaid'); if(mp) mp.onclick=async()=>{ const n=clone(S.pedidos[id]); n.pagamento=Object.assign({},n.pagamento,{pago:total(n)}); n.historico=(n.historico||[]).concat({t:Date.now(),nota:'Pagamento total registrado'}); await store.put('pedidos',id,n); openOrder(id); toast('Pagamento registrado'); };
  $('#gravThis').onclick=()=>{ closeDrawer(); ui.gravPedido=id; go('gravar'); };
  $('#copyMsg').onclick=()=>copy($('#clientMsg').value,'Mensagem copiada');
  $('#clientMsg').oninput=e=>{ const a=$('#waLink'); if(a) a.href=`https://wa.me/55${digits(c.whatsapp)}?text=${encodeURIComponent(e.target.value)}`; };
  $('#editO').onclick=()=>orderForm(id);
  $('#dupO').onclick=()=>{ const n=clone(p); delete n._id; orderForm(null,n); };
  const co=$('#cancelO'); if(co) co.onclick=()=>confirmInline(co.parentElement,'Cancelar este pedido? Ele sai do funil e das vendas.','Cancelar pedido',()=>setStatus(id,'Cancelado'));
  $('#delO').onclick=()=>confirmInline($('#delO').parentElement,`Excluir o pedido ${p.numero} para sempre?`,'Excluir',async()=>{ closeDrawer(); await store.del('pedidos',id); toast('Pedido excluído'); });
}
function confirmInline(host, msg, okLbl, fn){
  const box=document.createElement('div'); box.className='confirm'; box.style.width='100%';
  box.innerHTML=`<span>${h(msg)}</span><div class="btns"><button class="btn danger sm" type="button">${h(okLbl)}</button><button class="btn sm" type="button">Voltar</button></div>`;
  host.replaceWith(box); const [ok,no]=box.querySelectorAll('button'); ok.onclick=fn; no.onclick=()=>box.replaceWith(host);
}
async function setStatus(id, st){ const n=clone(S.pedidos[id]); if(n.status===st) return; n.status=st; n.historico=(n.historico||[]).concat({t:Date.now(),status:st});
  await store.put('pedidos',id,n); toast('Status: '+st); if($('#scrim')) openOrder(id); }
function clientMessage(p){ const c=cliente(p.clienteId);
  const first=(c.contato||c.nome||'').split(' ')[0];
  const lines=[`Olá, ${first}! Aqui é da ${S.config.empresa||'OUTLASER'}.`, '', `*Pedido ${p.numero}* — ${p.status}`];
  (p.itens||[]).forEach(i=>lines.push(`• ${i.qtd}× ${i.nome} — ${money(i.qtd*i.preco)}`));
  if(+p.desconto) lines.push(`Desconto: − ${money(p.desconto)}`); if(+p.frete) lines.push(`Frete: ${money(p.frete)}`);
  lines.push(`*Total: ${money(total(p))}*`); const rest=total(p)-pago(p); if(rest>0.005 && pago(p)>0) lines.push(`Já recebido: ${money(pago(p))} · Falta: ${money(rest)}`);
  if(p.prazo) lines.push(`Entrega prevista: ${fmtDateISO(p.prazo)}`);
  if(p.destino&&p.destino.valor&&!isVcard(p.destino.valor)) lines.push('', `Os chaveiros vão abrir: ${p.destino.valor}`);
  return lines.join('\n'); }
const clone = o => JSON.parse(JSON.stringify(o));

/* ---------- Formulário de pedido ---------- */
function nextNumero(){ const n=Object.values(S.pedidos).map(p=>parseInt(String(p.numero||'').replace(/\D/g,''))||0); return 'OL-'+String((Math.max(0,...n)+1)).padStart(4,'0'); }
function orderForm(id, preset){
  const editing=!!id; const src=editing?clone(S.pedidos[id]):(preset||null);
  const prods=withIds('produtos').filter(p=>p.ativo!==false);
  const f = src || {numero:nextNumero(), clienteId:'', status:'Orçamento', itens:[], desconto:0, frete:0, pagamento:{forma:'Pix',pago:0}, destino:{tipo:'link',campos:{},valor:''}, tagModelo:'NTAG213', bloquear:false, gravadas:0, prazo:addDays(10), obs:'', criado:Date.now(), historico:[]};
  if(!editing && preset){ f.numero=nextNumero(); f.status='Orçamento'; f.gravadas=0; f.criado=Date.now(); f.historico=[]; f.pagamento={forma:(preset.pagamento||{}).forma||'Pix',pago:0}; delete f.ex; }
  if(!f.itens.length && prods[0]) f.itens=[{produtoId:prods[0]._id, nome:prods[0].nome, qtd:50, preco:tierPrice(prods[0],50)}];
  f.destino=f.destino||{tipo:'link',campos:{}}; f.destino.campos=f.destino.campos||{};
  const clis=withIds('clientes').sort((a,b)=>a.nome.localeCompare(b.nome));
  const body=`
    <div class="sec"><div class="lbl">Cliente</div>
      <div class="fields"><label class="f full" for="oCli">Cliente
        <select id="oCli"><option value="">Selecione…</option>${clis.map(c=>`<option value="${h(c._id)}" ${c._id===f.clienteId?'selected':''}>${h(c.nome)}${c.tipo?' · '+h(c.tipo):''}</option>`).join('')}<option value="__new">+ Cadastrar novo cliente</option></select></label>
      </div>
      <div class="fields" id="newCliBox" hidden>
        <label class="f" for="ncNome">Nome / empresa<input type="text" id="ncNome"></label>
        <label class="f" for="ncTipo">Tipo<select id="ncTipo">${TIPOS_CLI.map(t=>`<option>${t}</option>`).join('')}</select></label>
        <label class="f" for="ncWa">WhatsApp<input type="tel" id="ncWa" placeholder="(19) 99999-9999"></label>
        <label class="f" for="ncContato">Contato<input type="text" id="ncContato"></label>
      </div>
    </div>
    <div class="sec"><div class="lbl">Itens</div>
      <div class="items" id="oItems"></div>
      <div class="btns"><button type="button" class="btn sm" id="addItem">${svg('plus')}Adicionar item</button></div>
      <div class="fields">
        <label class="f" for="oDesc">Desconto (R$)<input type="number" step="0.01" min="0" id="oDesc" value="${+f.desconto||0}"></label>
        <label class="f" for="oFrete">Frete (R$)<input type="number" step="0.01" min="0" id="oFrete" value="${+f.frete||0}"></label>
      </div>
      <div class="totals" id="oTotals"></div>
    </div>
    <div class="sec"><div class="lbl">Pagamento e prazo</div>
      <div class="fields">
        <label class="f" for="oForma">Forma<select id="oForma">${FORMAS.map(x=>`<option ${x===(f.pagamento||{}).forma?'selected':''}>${x}</option>`).join('')}</select></label>
        <label class="f" for="oPago">Valor já pago (R$)<input type="number" step="0.01" min="0" id="oPago" value="${pago(f)}"><span class="hint">Sinal ou pagamento total.</span></label>
        <label class="f" for="oPrazo">Entrega<input type="date" id="oPrazo" value="${h(f.prazo||'')}"></label>
        <label class="f" for="oStatus">Status<select id="oStatus">${STATUS.map(s=>`<option ${s===f.status?'selected':''}>${s}</option>`).join('')}</select></label>
      </div>
    </div>
    <div class="sec"><div class="lbl">Destino do NFC</div>
      <div class="types" id="oTypes"></div>
      <div class="fields" id="oDestFields"></div>
      <div class="result"><div class="top"><span class="lbl">Será gravado</span><div class="segs" id="oTag">${Object.keys(CAP).map(k=>`<button type="button" data-t="${k}" aria-pressed="${k===f.tagModelo}">${k}</button>`).join('')}</div></div>
        <div class="url" id="oUrl">—</div><div class="meter"><div class="bar"><span id="oBar"></span></div><span id="oBytes"></span></div></div>
      <label class="opt"><input type="checkbox" id="oLock" ${f.bloquear?'checked':''}><span>Bloquear tags após gravar<small>Ninguém mais altera o link. Use só com o link final aprovado pelo cliente.</small></span></label>
    </div>
    <div class="sec"><div class="lbl">Observações</div><textarea id="oObs" aria-label="Observações" placeholder="Cor do acrílico, arte aprovada, local de entrega…">${h(f.obs||'')}</textarea></div>`;
  const foot=`<span class="mono muted" style="align-self:center">${h(f.numero)}</span><div class="btns"><button class="btn" id="oCancel">Cancelar</button><button class="btn gold" id="oSave">${editing?'Salvar alterações':'Criar pedido'}</button></div>`;
  drawer(editing?`Editar ${f.numero}`:'Novo pedido', body, foot);

  const cliSel=$('#oCli'); cliSel.onchange=()=>{ $('#newCliBox').hidden=cliSel.value!=='__new'; if(cliSel.value==='__new') $('#ncNome').focus(); };
  // itens
  function drawItems(){ $('#oItems').innerHTML=f.itens.map((it,i)=>{ const pr=S.produtos[it.produtoId]; const tp=pr?tierPrice(pr,it.qtd):null;
    return `<div class="item" data-i="${i}">
      <label class="f">Produto<select data-k="produtoId">${prods.map(p=>`<option value="${h(p._id)}" ${p._id===it.produtoId?'selected':''}>${h(p.nome)}</option>`).join('')}${pr?'':`<option selected value="${h(it.produtoId)}">${h(it.nome)}</option>`}</select></label>
      <label class="f">Qtd<input type="number" min="1" step="1" data-k="qtd" value="${+it.qtd||0}"></label>
      <label class="f">Preço un.<input type="number" min="0" step="0.01" data-k="preco" value="${+it.preco||0}"></label>
      <button type="button" class="rm" data-rm="${i}" aria-label="Remover item">${svg('x','style="width:14px;height:14px"')}</button>
      ${pr&&tp!==+it.preco?`<span class="sub">Tabela para ${it.qtd} un.: ${money(tp)} <button type="button" class="btn sm ghost" data-tp="${i}" style="padding:1px 6px">usar</button></span>`:pr&&(pr.faixas||[]).length?`<span class="sub">${faixasTxt(pr)}</span>`:''}
    </div>`; }).join('') || '<div class="hint">Nenhum item. Cadastre produtos em Produtos.</div>'; drawTotals(); }
  $('#oItems').addEventListener('change',e=>{ const row=e.target.closest('.item'); if(!row) return; const i=+row.dataset.i, k=e.target.dataset.k; const it=f.itens[i];
    if(k==='produtoId'){ const pr=S.produtos[e.target.value]; it.produtoId=e.target.value; it.nome=pr.nome; it.preco=tierPrice(pr,it.qtd); if(pr.tag) setTag(pr.tag); }
    if(k==='qtd'){ const old=S.produtos[it.produtoId]? tierPrice(S.produtos[it.produtoId], it.qtd):null; const wasTable= old===+it.preco; it.qtd=Math.max(1,parseInt(e.target.value)||1); if(wasTable&&S.produtos[it.produtoId]) it.preco=tierPrice(S.produtos[it.produtoId],it.qtd); }
    if(k==='preco') it.preco=Math.max(0,numIn(e.target.value));
    drawItems(); });
  $('#oItems').addEventListener('input',e=>{ const row=e.target.closest('.item'); if(!row) return; const it=f.itens[+row.dataset.i];
    if(e.target.dataset.k==='preco'){ it.preco=Math.max(0,numIn(e.target.value)); drawTotals(); } if(e.target.dataset.k==='qtd'){ it.qtd=Math.max(0,parseInt(e.target.value)||0); drawTotals(); } });
  $('#oItems').addEventListener('click',e=>{ const r=e.target.closest('[data-rm]'); if(r){ f.itens.splice(+r.dataset.rm,1); drawItems(); return; }
    const t=e.target.closest('[data-tp]'); if(t){ const it=f.itens[+t.dataset.tp]; it.preco=tierPrice(S.produtos[it.produtoId],it.qtd); drawItems(); } });
  $('#addItem').onclick=()=>{ const p=prods.find(x=>x.nfc===false)||prods[0]; if(!p) return toast('Cadastre um produto primeiro.'); const q=qtdNFC(f)||1; f.itens.push({produtoId:p._id,nome:p.nome,qtd:q,preco:tierPrice(p,q)}); drawItems(); };
  ['oDesc','oFrete','oPago'].forEach(k=>$('#'+k).oninput=drawTotals);
  function drawTotals(){ f.desconto=Math.max(0,numIn($('#oDesc').value)); f.frete=Math.max(0,numIn($('#oFrete').value)); const cu=custo(f), rec=subtotal(f)-f.desconto;
    $('#oTotals').innerHTML=`<span class="dim">Subtotal</span><span class="v dim">${money(subtotal(f))}</span><span class="big">Total</span><span class="v big">${money(total(f))}</span>
      <span class="dim">${qtdNFC(f)} chaveiros NFC · custo estimado</span><span class="v dim">${money(cu)}</span><span class="dim">Margem bruta</span><span class="v dim">${rec>0?((rec-cu)/rec*100).toFixed(0)+'%':'—'}</span>`; }
  // destino
  const dtypes=$('#oTypes');
  dtypes.innerHTML=DEST.map(d=>`<button type="button" data-d="${d.id}" aria-pressed="${d.id===f.destino.tipo}">${svg(d.icon)}${d.label}</button>`).join('');
  dtypes.onclick=e=>{ const b=e.target.closest('button'); if(!b) return; f.destino.tipo=b.dataset.d; [...dtypes.children].forEach(x=>x.setAttribute('aria-pressed',x===b)); drawDestFields(); };
  function drawDestFields(){ const d=DEST.find(x=>x.id===f.destino.tipo)||DEST[0];
    $('#oDestFields').innerHTML=d.fields.map(fd=>{ const v=f.destino.campos[fd.k] ?? fd.def ?? ''; const id='od_'+fd.k;
      return `<label class="f ${fd.full?'full':''}" for="${id}">${fd.label}${fd.type==='textarea'?`<textarea id="${id}" data-k="${fd.k}">${h(v)}</textarea>`:`<input type="${fd.type}" id="${id}" data-k="${fd.k}" placeholder="${h(fd.ph||'')}" value="${h(v)}">`}${fd.hint?`<span class="hint">${fd.hint}</span>`:''}</label>`; }).join('');
    d.fields.forEach(fd=>{ if(f.destino.campos[fd.k]==null && fd.def) f.destino.campos[fd.k]=fd.def; });
    // sugestões a partir do cliente
    drawDest(); }
  $('#oDestFields').addEventListener('input',e=>{ const k=e.target.dataset.k; if(!k) return; f.destino.campos[k]=e.target.value; drawDest(); });
  function drawDest(){ const r=buildDest(f.destino.tipo,f.destino.campos); const u=$('#oUrl');
    if(r.err){ u.textContent=r.err; u.classList.add('bad'); f.destino.valor=''; setBytes(0); return; }
    u.classList.remove('bad'); u.textContent=r.valor; f.destino.valor=r.valor; setBytes(ndefBytes(r.valor,r.vcard)); }
  function setBytes(n){ const cap=CAP[f.tagModelo]||137, pct=Math.min(100,n/cap*100); const b=$('#oBar'); b.style.width=pct+'%'; b.className=n>cap?'err':pct>85?'warn':'';
    $('#oBytes').textContent=n?`${n} / ${cap} bytes${n>cap?' — não cabe':''}`:''; }
  function setTag(t){ f.tagModelo=t; [...$('#oTag').children].forEach(x=>x.setAttribute('aria-pressed',x.dataset.t===t)); drawDest(); }
  $('#oTag').onclick=e=>{ const b=e.target.closest('button'); if(b) setTag(b.dataset.t); };
  drawItems(); drawDestFields();

  $('#oCancel').onclick=closeDrawer;
  $('#oSave').onclick=async()=>{
    let cid=cliSel.value;
    if(cid==='__new'){ const nome=$('#ncNome').value.trim(); if(!nome){ $('#ncNome').focus(); return toast('Informe o nome do cliente.'); }
      cid=uid('c'); await store.put('clientes',cid,{nome,tipo:$('#ncTipo').value,whatsapp:$('#ncWa').value.trim(),contato:$('#ncContato').value.trim(),doc:'',email:'',cidade:'',obs:'',criado:Date.now()}); }
    if(!cid){ cliSel.focus(); return toast('Escolha o cliente.'); }
    if(!f.itens.length || f.itens.some(i=>!(i.qtd>0))) return toast('Confira os itens e quantidades.');
    const out=clone(f); delete out._id;
    out.clienteId=cid; out.pagamento={forma:$('#oForma').value, pago:Math.max(0,numIn($('#oPago').value))}; out.prazo=$('#oPrazo').value; out.obs=$('#oObs').value.trim(); out.bloquear=$('#oLock').checked;
    const newSt=$('#oStatus').value; if(newSt!==out.status || !editing){ out.historico=(out.historico||[]).concat({t:Date.now(),status:newSt, nota: editing?'':'Pedido criado'}); }
    out.status=newSt;
    if(out.ex) delete out.ex;
    const oid=id||uid('o'); await store.put('pedidos',oid,out); closeDrawer(); toast(editing?'Pedido salvo':'Pedido '+out.numero+' criado'); if(!editing) openOrder(oid); else openOrder(oid);
  };
}
function faixasTxt(pr){ const fx=(pr.faixas||[]).slice().sort((a,b)=>a.min-b.min); if(!fx.length) return money(pr.preco)+' / un.';
  return `1+ ${money(pr.preco)} · `+fx.map(x=>`${x.min}+ ${money(x.preco)}`).join(' · '); }

/* ---------- Clientes ---------- */
function vClientes(){
  return `<div class="phead"><div><h1>Clientes</h1><p>Empresas, profissionais, agências e eventos.</p></div><div class="btns"><button class="btn gold" id="newCli">${svg('plus')}Novo cliente</button></div></div>
  <div class="toolbar"><div class="search">${svg('search')}<input type="search" id="cliBusca" placeholder="Buscar por nome, contato ou cidade" value="${h(ui.cliBusca)}" aria-label="Buscar clientes"></div></div>
  <div id="cliList">${clientesList()}</div>`;
}
function cliStats(id){ const ps=Object.values(S.pedidos).filter(p=>p.clienteId===id); const vend=ps.filter(isSale);
  return {n:ps.length, total:vend.reduce((a,p)=>a+total(p),0), chav:vend.reduce((a,p)=>a+qtdNFC(p),0), ult:Math.max(0,...ps.map(p=>p.criado||0))}; }
function clientesList(){ const q=ui.cliBusca.trim().toLowerCase();
  const L=withIds('clientes').filter(c=>!q||[c.nome,c.contato,c.cidade,c.email].join(' ').toLowerCase().includes(q)).map(c=>Object.assign(c,{st:cliStats(c._id)})).sort((a,b)=>b.st.total-a.st.total);
  if(!L.length) return `<div class="card empty"><b>Nenhum cliente</b>Cadastre em “Novo cliente” ou direto ao criar um pedido.</div>`;
  return `<div class="tbl-wrap resp"><table><thead><tr><th>Cliente</th><th>Tipo</th><th>Contato</th><th>Cidade</th><th class="num">Pedidos</th><th class="num">Chaveiros</th><th class="num">Comprado</th></tr></thead><tbody>
  ${L.map(c=>`<tr data-cli="${h(c._id)}"><td><span class="cell-main">${h(c.nome)}</span>${c.ex?'<span class="ex">exemplo</span>':''}<div class="cell-sub">${h(c.doc||'')}</div></td><td>${h(c.tipo||'')}</td>
    <td>${h(c.contato||'')}<div class="cell-sub mono">${h(c.whatsapp||'')}</div></td><td>${h(c.cidade||'')}</td><td class="num">${c.st.n}</td><td class="num">${c.st.chav}</td><td class="num">${money(c.st.total)}</td></tr>`).join('')}
  </tbody></table></div>
  <div class="mlist">${L.map(c=>`<div class="mrow" data-cli="${h(c._id)}"><div><span class="cell-main">${h(c.nome)}</span>${c.ex?'<span class="ex">exemplo</span>':''}<div class="cell-sub">${h(c.tipo||'')} · ${h(c.cidade||'')}</div></div><div class="r"><div class="mono cell-main">${money(c.st.total)}</div><div class="cell-sub">${c.st.n} pedidos</div></div></div>`).join('')}</div>`;
}
function mountClientes(){ $('#cliBusca').oninput=e=>{ ui.cliBusca=e.target.value; $('#cliList').innerHTML=clientesList(); }; }
document.addEventListener('click',e=>{ const c=e.target.closest('[data-cli]'); if(c){ openClient(c.dataset.cli); return; } if(e.target.closest('#newCli')) clientForm(); });
function openClient(id){ const c=S.clientes[id]; if(!c) return; const st=cliStats(id);
  const ps=withIds('pedidos').filter(p=>p.clienteId===id).sort((a,b)=>(b.criado||0)-(a.criado||0));
  const body=`<dl class="kv"><dt>Tipo</dt><dd>${h(c.tipo||'—')}</dd><dt>CNPJ/CPF</dt><dd class="mono">${h(c.doc||'—')}</dd><dt>Contato</dt><dd>${h(c.contato||'—')}</dd>
    <dt>WhatsApp</dt><dd class="mono">${h(c.whatsapp||'—')}</dd><dt>E-mail</dt><dd>${h(c.email||'—')}</dd><dt>Cidade</dt><dd>${h(c.cidade||'—')}</dd></dl>
    ${c.obs?`<p class="muted" style="margin:0;white-space:pre-wrap">${h(c.obs)}</p>`:''}
    <div class="kpis" style="grid-template-columns:repeat(3,minmax(0,1fr));margin:0"><div class="kpi"><div class="l">Pedidos</div><div class="v">${st.n}</div></div><div class="kpi"><div class="l">Chaveiros</div><div class="v">${st.chav}</div></div><div class="kpi hi"><div class="l">Comprado</div><div class="v" style="font-size:17px">${money(st.total)}</div></div></div>
    <div class="sec"><div class="lbl">Pedidos</div>${ps.length?`<div class="rows">${ps.map(p=>`<div class="r" data-order="${h(p._id)}"><span class="cell-main mono">${h(p.numero)}</span><span class="mono">${money(total(p))}</span><span class="cell-sub">${fmtDate(p.criado)} · ${qtdNFC(p)} chaveiros</span><span>${stChip(p.status)}</span></div>`).join('')}</div>`:'<div class="hint">Nenhum pedido ainda.</div>'}</div>`;
  drawer(c.nome, body, `<button class="btn danger sm" id="delC">Excluir</button><div class="btns"><button class="btn" id="ordC">${svg('plus')}Novo pedido</button><button class="btn gold" id="editC">${svg('edit')}Editar</button></div>`);
  $('#editC').onclick=()=>clientForm(id);
  $('#ordC').onclick=()=>orderForm(null,{clienteId:id,itens:[],destino:{tipo:'link',campos:{}},tagModelo:'NTAG213',desconto:0,frete:0,pagamento:{forma:'Pix',pago:0},prazo:addDays(10),obs:''});
  $('#delC').onclick=()=>{ if(ps.length){ return toast('Este cliente tem pedidos. Exclua ou transfira os pedidos antes.'); } confirmInline($('#delC'),'Excluir este cliente?','Excluir',async()=>{ closeDrawer(); await store.del('clientes',id); toast('Cliente excluído'); }); };
}
function clientForm(id){ const c=id?clone(S.clientes[id]):{nome:'',tipo:'Empresa',doc:'',contato:'',whatsapp:'',email:'',cidade:'',obs:''};
  const F=(k,l,t='text',full)=>`<label class="f ${full?'full':''}" for="cf_${k}">${l}<input type="${t}" id="cf_${k}" value="${h(c[k]||'')}"></label>`;
  drawer(id?'Editar cliente':'Novo cliente', `<div class="fields">${F('nome','Nome / empresa','text',1)}
    <label class="f" for="cf_tipo">Tipo<select id="cf_tipo">${TIPOS_CLI.map(t=>`<option ${t===c.tipo?'selected':''}>${t}</option>`).join('')}</select></label>
    ${F('doc','CNPJ / CPF')}${F('contato','Pessoa de contato')}${F('whatsapp','WhatsApp','tel')}${F('email','E-mail','email')}${F('cidade','Cidade/UF')}
    <label class="f full" for="cf_obs">Observações<textarea id="cf_obs">${h(c.obs||'')}</textarea></label></div>`,
    `<span></span><div class="btns"><button class="btn" id="cfC">Cancelar</button><button class="btn gold" id="cfS">Salvar cliente</button></div>`);
  $('#cfC').onclick=closeDrawer;
  $('#cfS').onclick=async()=>{ const o=Object.assign({},c); ['nome','doc','contato','whatsapp','email','cidade','obs'].forEach(k=>o[k]=$('#cf_'+k).value.trim()); o.tipo=$('#cf_tipo').value;
    if(!o.nome){ $('#cf_nome').focus(); return toast('Informe o nome.'); } delete o.ex; if(!o.criado) o.criado=Date.now();
    const cid=id||uid('c'); await store.put('clientes',cid,o); toast('Cliente salvo'); openClient(cid); };
}

/* ---------- Produtos ---------- */
function vProdutos(){ const L=withIds('produtos').sort((a,b)=>(b.ativo!==false)-(a.ativo!==false)||a.nome.localeCompare(b.nome));
  return `<div class="phead"><div><h1>Produtos</h1><p>Catálogo com custo, preço e desconto por quantidade.</p></div><div class="btns"><button class="btn gold" id="newProd">${svg('plus')}Novo produto</button></div></div>
  ${L.length?`<div class="prodcards">${L.map(p=>{ const mg=p.preco>0?((p.preco-p.custo)/p.preco*100):0; const vend=Object.values(S.pedidos).filter(isSale).reduce((a,o)=>a+(o.itens||[]).filter(i=>i.produtoId===p._id).reduce((s,i)=>s+(+i.qtd||0),0),0);
    return `<div class="pcard" data-prod="${h(p._id)}" style="${p.ativo===false?'opacity:.5':''}"><div class="btns" style="justify-content:space-between"><span class="nm">${h(p.nome)}${p.ex?'<span class="ex">exemplo</span>':''}</span>${p.nfc!==false?`<span class="tag">${h(p.tag||'NFC')}</span>`:'<span class="tag">sem NFC</span>'}</div>
    <span class="muted" style="font-size:13px">${h(p.descricao||'')}</span>
    <div class="pr"><b>${money(p.preco)}</b><span class="muted" style="font-size:12px">custo ${money(p.custo)} · ${mg.toFixed(0)}%</span></div>
    <span class="faixas">${faixasTxt(p)}</span><span class="hint">${vend} vendidos${p.ativo===false?' · inativo':''}</span></div>`; }).join('')}</div>`
  :`<div class="card empty"><b>Catálogo vazio</b>Cadastre o primeiro chaveiro em “Novo produto”.</div>`}`; }
document.addEventListener('click',e=>{ const p=e.target.closest('[data-prod]'); if(p){ productForm(p.dataset.prod); return; } if(e.target.closest('#newProd')) productForm(); });
function productForm(id){ const p=id?clone(S.produtos[id]):{nome:'',descricao:'',preco:19.9,custo:8.96,nfc:true,tag:'NTAG213',faixas:[{min:100,preco:16.9}],ativo:true};
  p.faixas=p.faixas||[];
  drawer(id?'Editar produto':'Novo produto', `<div class="fields">
    <label class="f full" for="pf_nome">Nome<input type="text" id="pf_nome" value="${h(p.nome)}"></label>
    <label class="f full" for="pf_desc">Descrição<input type="text" id="pf_desc" value="${h(p.descricao||'')}" placeholder="Material, tamanho, acabamento"></label>
    <label class="f" for="pf_preco">Preço unitário (R$)<input type="number" step="0.01" min="0" id="pf_preco" value="${p.preco}"></label>
    <label class="f" for="pf_custo">Custo unitário (R$)<input type="number" step="0.01" min="0" id="pf_custo" value="${p.custo}"><span class="hint">Tag + base + argola + mão de obra.</span></label>
    <label class="f" for="pf_tag">Tag NFC<select id="pf_tag"><option value="">Sem NFC</option>${Object.keys(CAP).map(k=>`<option ${p.nfc!==false&&k===p.tag?'selected':''}>${k}</option>`).join('')}</select></label>
    <label class="f" style="justify-content:flex-end"><span class="opt" style="text-transform:none;letter-spacing:0;color:var(--cream)"><input type="checkbox" id="pf_ativo" ${p.ativo!==false?'checked':''}>Ativo no catálogo</span></label>
    </div>
    <div class="sec"><div class="lbl">Desconto por quantidade</div><div id="tiers" class="items"></div><div class="btns"><button type="button" class="btn sm" id="addTier">${svg('plus')}Adicionar faixa</button></div><div class="hint" id="mgInfo"></div></div>`,
    `${id?'<button class="btn danger sm" id="pfD">Excluir</button>':'<span></span>'}<div class="btns"><button class="btn" id="pfC">Cancelar</button><button class="btn gold" id="pfS">Salvar produto</button></div>`);
  const drawT=()=>{ $('#tiers').innerHTML=p.faixas.map((f,i)=>`<div class="tierrow"><label class="f">A partir de (un.)<input type="number" min="2" data-i="${i}" data-k="min" value="${f.min}"></label><label class="f">Preço (R$)<input type="number" step="0.01" data-i="${i}" data-k="preco" value="${f.preco}"></label><button type="button" class="rm iconbtn" style="height:40px" data-rmt="${i}" aria-label="Remover faixa">${svg('x','style="width:14px;height:14px"')}</button></div>`).join('')||'<span class="hint">Sem desconto por volume.</span>'; mg(); };
  const mg=()=>{ const pr=numIn($('#pf_preco').value), cu=numIn($('#pf_custo').value); $('#mgInfo').textContent= pr>0?`Margem bruta no preço cheio: ${((pr-cu)/pr*100).toFixed(0)}%`+(p.faixas.length?` · na maior faixa: ${(()=>{const f=p.faixas.slice().sort((a,b)=>b.min-a.min)[0]; return f.preco>0?((f.preco-cu)/f.preco*100).toFixed(0)+'%':'—';})()}`:''):''; };
  $('#tiers').addEventListener('input',e=>{ const i=e.target.dataset.i; if(i==null) return; p.faixas[+i][e.target.dataset.k]=numIn(e.target.value); mg(); });
  $('#tiers').addEventListener('click',e=>{ const r=e.target.closest('[data-rmt]'); if(r){ p.faixas.splice(+r.dataset.rmt,1); drawT(); } });
  $('#addTier').onclick=()=>{ const last=p.faixas[p.faixas.length-1]; p.faixas.push({min:last?last.min*2:50, preco:+(numIn($('#pf_preco').value)*0.9).toFixed(2)}); drawT(); };
  $('#pf_preco').oninput=mg; $('#pf_custo').oninput=mg; drawT();
  $('#pfC').onclick=closeDrawer;
  const d=$('#pfD'); if(d) d.onclick=()=>confirmInline(d,'Excluir este produto? Pedidos antigos mantêm o nome e o preço.','Excluir',async()=>{ closeDrawer(); await store.del('produtos',id); toast('Produto excluído'); });
  $('#pfS').onclick=async()=>{ const o=Object.assign({},p); o.nome=$('#pf_nome').value.trim(); if(!o.nome){ $('#pf_nome').focus(); return toast('Informe o nome.'); }
    o.descricao=$('#pf_desc').value.trim(); o.preco=numIn($('#pf_preco').value); o.custo=numIn($('#pf_custo').value); const t=$('#pf_tag').value; o.nfc=!!t; o.tag=t; o.ativo=$('#pf_ativo').checked;
    o.faixas=p.faixas.filter(f=>f.min>1&&f.preco>0).sort((a,b)=>a.min-b.min); delete o.ex; if(!o.criado) o.criado=Date.now();
    await store.put('produtos',id||uid('p'),o); closeDrawer(); toast('Produto salvo'); };
}

/* ---------- Gravar NFC ---------- */
const params = new URLSearchParams(location.search);
const ext = params.get('url') ? {numero:params.get('pedido')||'', cliente:params.get('cliente')||'', valor:params.get('url'), qtd:parseInt(params.get('qtd'))||1, tag:params.get('tag')||'NTAG213', lock:params.get('lock')==='1'} : null;
if(ext){ view='gravar'; const local=Object.entries(S.pedidos).find(([k,p])=>p.numero===ext.numero); }
let gctrl=null, gdone=0, lockOk=false;
function gravCandidates(){ return withIds('pedidos').filter(p=>['Aprovado','Produção','Gravação NFC','Pronto'].includes(p.status)).sort((a,b)=>(a.prazo||'9').localeCompare(b.prazo||'9')); }
function gravContext(){
  if(ui.gravPedido==='__ext' && ext) return {kind:'ext', numero:ext.numero, cliente:ext.cliente, valor:ext.valor, total:ext.qtd, feitas:gdone, tag:ext.tag, lock:ext.lock};
  if(ui.gravPedido && ui.gravPedido!=='__avulsa' && S.pedidos[ui.gravPedido]){ const p=S.pedidos[ui.gravPedido]; return {kind:'pedido', id:ui.gravPedido, p, numero:p.numero, cliente:cliente(p.clienteId).nome, valor:(p.destino||{}).valor||'', total:qtdNFC(p), feitas:p.gravadas||0, tag:p.tagModelo||'NTAG213', lock:!!p.bloquear}; }
  const r=buildDest(ui.gravAvulso.tipo, ui.gravAvulso.campos); return {kind:'avulsa', valor:r.err?'':r.valor, err:r.err, total:0, feitas:0, tag:ui.gravAvulso.tag||'NTAG213', lock:false};}
function vGravar(){
  if(!ui.gravPedido){ if(ext) ui.gravPedido='__ext'; else { const c=gravCandidates().find(p=>(p.gravadas||0)<qtdNFC(p)); ui.gravPedido=c?c._id:'__avulsa'; } }
  const cands=gravCandidates();
  let notice='';
  if(!nfcReal){
    if(framed) notice=`<div class="notice"><b>Modo demonstração.</b> Dentro desta janela o celular não libera o NFC, então a gravação é simulada e não altera o pedido. Para gravar de verdade, abra o gravador no Chrome do Android${S.config.gravadorUrl?' pelo QR ao lado':''}.</div>`;
    else if(isIOS) notice=`<div class="notice"><b>iPhone não grava NFC pelo navegador.</b> Copie o link e grave com o app NFC Tools (Escrever → Adicionar registro → URL).</div>`;
    else if(!hasNFC) notice=`<div class="notice"><b>Este navegador não tem Web NFC.</b> Use o Chrome de um Android com NFC ligado. Aqui a gravação é simulada.</div>`;
    else notice=`<div class="notice"><b>Abra o app em um endereço https://</b> para liberar o NFC.</div>`;
  }
  return `<div class="phead"><div><h1>Gravar NFC</h1><p>Escolha o pedido, encoste cada chaveiro no celular e acompanhe a contagem.</p></div></div>
  ${notice?`<div style="margin-bottom:16px">${notice}</div>`:''}
  <div class="grav">
    <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
      <div class="card"><h3>O que gravar</h3>
        <label class="f" for="gSel">Pedido<select id="gSel">
          ${ext?`<option value="__ext">${h(ext.numero||'Link recebido')} · ${h(ext.cliente||'')} (${ext.qtd} un.)</option>`:''}
          ${cands.map(p=>`<option value="${h(p._id)}">${h(p.numero)} · ${h(cliente(p.clienteId).nome)} — ${p.gravadas||0}/${qtdNFC(p)}${(p.gravadas||0)>=qtdNFC(p)?' ✓':''}</option>`).join('')}
          <option value="__avulsa">Gravação avulsa (sem pedido)</option></select></label>
        <div id="gCtx" style="margin-top:14px"></div>
      </div>
      <div class="card"><h3>Gravação</h3>
        <div class="stage">
          <div class="fob" id="fob" aria-hidden="true"><span class="hole"></span><span class="pulse"></span><span class="pulse p2"></span><span class="pulse p3"></span>
            <div class="ring"><div class="inner"><svg viewBox="0 0 64 64" fill="none" stroke-width="5" stroke-linecap="round"><path d="M16 40c9-9 23-9 32 0"/><path d="M22 47c5.5-5 14.5-5 20 0"/><path d="M10 32c12.5-12 31.5-12 44 0"/><path d="M29 54h6"/></svg><span class="t">NFC</span></div></div></div>
          <div style="min-width:0">
            <p class="status" id="gStatus">Pronto para gravar</p><p class="status-sub" id="gSub">Toque em gravar e encoste o chaveiro atrás do celular.</p>
            <div class="btns"><button class="btn gold" id="gWrite">${nfcReal?'Gravar':'Simular gravação'}</button><button class="btn" id="gStop" hidden>Parar</button></div>
            <div class="counter" id="gCounter"></div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px;padding-top:14px;border-top:1px solid var(--line)">
          <label class="opt"><input type="checkbox" id="gBatch" checked><span>Continuar até completar o pedido<small>Depois de cada tag, afaste e encoste a próxima.</small></span></label>
          <label class="opt"><input type="checkbox" id="gLock"><span>Bloquear cada tag após gravar<small>Permanente: ninguém mais altera o link.</small></span></label>
          <div class="confirm" id="gLockC" hidden><span>O bloqueio não tem volta. Confirme só com o link final aprovado.</span><div class="btns"><button class="btn danger sm" id="gLockY" type="button">Bloquear as tags</button><button class="btn sm" id="gLockN" type="button">Não bloquear</button></div></div>
        </div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
      <div class="card"><h3>Conferir tag</h3><p class="muted" style="margin:0 0 12px;font-size:13px">Leia um chaveiro pronto para confirmar o link antes de entregar.</p>
        <div class="btns" style="margin-bottom:12px"><button class="btn" id="gRead">${nfcReal?'Ler tag':'Simular leitura'}</button><button class="btn" id="gReadStop" hidden>Parar leitura</button></div>
        <div class="readout" id="gOut"><span class="k">Nenhuma tag lida ainda.</span></div></div>
      <div class="card"><h3>QR Code de apoio</h3><div class="qrbox"><div class="qr"><canvas id="gQR" width="120" height="120"></canvas></div>
        <div><span>Mesmo destino do chaveiro, para o verso ou a embalagem.</span><div class="btns"><button class="btn sm" id="gQRdl">Baixar PNG</button><button class="btn sm" id="gCopy">${svg('copy')}Copiar link</button></div></div></div></div>
      <div class="card" id="phoneCard"></div>
    </div>
  </div>`;
}
function mountGravar(){
  const sel=$('#gSel'); sel.value=ui.gravPedido; if(sel.value!==ui.gravPedido){ ui.gravPedido=sel.value; }
  sel.onchange=()=>{ if(gctrl) return; ui.gravPedido=sel.value; gdone=0; lockOk=false; refreshGravContext(true); };
  $('#gLock').onchange=e=>{ if(e.target.checked && !lockOk){ e.target.checked=false; $('#gLockC').hidden=false; } else if(!e.target.checked) lockOk=false; };
  $('#gLockY').onclick=()=>{ lockOk=true; $('#gLock').checked=true; $('#gLockC').hidden=true; };
  $('#gLockN').onclick=()=>{ $('#gLockC').hidden=true; };
  $('#gWrite').onclick=startWrite; $('#gStop').onclick=()=>gctrl&&gctrl.abort();
  $('#gRead').onclick=startRead; $('#gReadStop').onclick=stopRead;
  $('#gCopy').onclick=()=>{ const c=gravContext(); if(c.valor) copy(c.valor,'Link copiado'); };
  $('#gQRdl').onclick=()=>{ const c=gravContext(); if(!c.valor) return toast('Defina o destino primeiro.'); qrDownload(c.valor, 'qr-'+(c.numero||'outlaser')+'.png'); };
  refreshGravContext(true);
}
function refreshGravContext(full){
  if(!$('#gCtx')) return;
  const c=gravContext();
  // opções do select atualizadas sem perder seleção
  if(!gctrl){ const sel=$('#gSel'); [...sel.options].forEach(o=>{ const p=S.pedidos[o.value]; if(p) o.textContent=`${p.numero} · ${cliente(p.clienteId).nome} — ${p.gravadas||0}/${qtdNFC(p)}${(p.gravadas||0)>=qtdNFC(p)?' ✓':''}`; }); }
  let ctx='';
  if(c.kind==='avulsa'){
    if(full || !$('#avTypes')){
      ctx=`<div class="types" id="avTypes">${DEST.map(d=>`<button type="button" data-d="${d.id}" aria-pressed="${d.id===ui.gravAvulso.tipo}">${svg(d.icon)}${d.label}</button>`).join('')}</div><div class="fields" id="avFields" style="margin-top:12px"></div>
        <div class="result" style="margin-top:12px"><div class="top"><span class="lbl">Será gravado</span><div class="segs" id="avTag">${Object.keys(CAP).map(k=>`<button type="button" data-t="${k}" aria-pressed="${k===(ui.gravAvulso.tag||'NTAG213')}">${k}</button>`).join('')}</div></div><div class="url" id="avUrl"></div><div class="meter"><div class="bar"><span id="avBar"></span></div><span id="avBytes"></span></div></div>
        <label class="f" for="avQtd" style="margin-top:12px;max-width:200px">Quantidade<input type="number" min="1" id="avQtd" value="${ui.gravAvulso.qtd||1}"></label>`;
      $('#gCtx').innerHTML=ctx;
      $('#avTypes').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; ui.gravAvulso.tipo=b.dataset.d; [...$('#avTypes').children].forEach(x=>x.setAttribute('aria-pressed',x===b)); drawAvFields(); };
      $('#avTag').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; ui.gravAvulso.tag=b.dataset.t; [...$('#avTag').children].forEach(x=>x.setAttribute('aria-pressed',x===b)); updAv(); };
      $('#avFields').addEventListener('input',e=>{ const k=e.target.dataset.k; if(k){ ui.gravAvulso.campos[k]=e.target.value; updAv(); } });
      $('#avQtd').oninput=e=>{ ui.gravAvulso.qtd=Math.max(1,parseInt(e.target.value)||1); updAv(); };
      drawAvFields();
    }
  } else {
    const pct=c.total?Math.min(100,c.feitas/c.total*100):0; const bytes=c.valor?ndefBytes(c.valor,isVcard(c.valor)):0; const cap=CAP[c.tag]||137;
    ctx=`<dl class="kv"><dt>Cliente</dt><dd><b>${h(c.cliente)}</b>${c.kind==='pedido'?' · '+stChip(c.p.status):''}</dd>
      <dt>Destino</dt><dd class="mono" style="font-size:12.5px;color:var(--gold-hi);white-space:pre-wrap">${h(c.valor||'Sem destino — edite o pedido')}</dd>
      <dt>Tag</dt><dd>${h(c.tag)} <span class="muted mono" style="font-size:12px">· ${bytes}/${cap} bytes${bytes>cap?' — não cabe':''}</span></dd>
      <dt>Progresso</dt><dd><div class="prog"><div class="bar"><span class="${c.feitas>=c.total?'full':''}" style="width:${pct}%"></span></div><span class="t">${c.feitas}/${c.total}</span></div></dd></dl>
      ${c.kind==='pedido'?`<div class="btns" style="margin-top:12px"><button class="btn sm" data-order="${h(c.id)}">Abrir pedido</button>${c.feitas>=c.total&&c.total&&['Aprovado','Produção','Gravação NFC'].includes(c.p.status)?`<button class="btn sm gold" id="gDone">Marcar como Pronto</button>`:''}</div>`:''}
      ${c.kind==='ext'?`<p class="hint" style="margin-top:10px">Pedido aberto a partir do link do painel. Ao terminar, marque o pedido como Pronto no painel.</p>`:''}`;
    $('#gCtx').innerHTML=ctx;
    const gd=$('#gDone'); if(gd) gd.onclick=()=>setStatus(c.id,'Pronto').then(()=>refreshGravContext(true));
    if(full && c.lock && !$('#gLock').checked){ $('#gLockC').hidden=false; }
  }
  updGravSide();
}
function drawAvFields(){ const d=DEST.find(x=>x.id===ui.gravAvulso.tipo)||DEST[0];
  $('#avFields').innerHTML=d.fields.map(fd=>{ const v=ui.gravAvulso.campos[fd.k] ?? fd.def ?? ''; const id='av_'+fd.k; if(ui.gravAvulso.campos[fd.k]==null&&fd.def) ui.gravAvulso.campos[fd.k]=fd.def;
    return `<label class="f ${fd.full?'full':''}" for="${id}">${fd.label}${fd.type==='textarea'?`<textarea id="${id}" data-k="${fd.k}">${h(v)}</textarea>`:`<input type="${fd.type}" id="${id}" data-k="${fd.k}" placeholder="${h(fd.ph||'')}" value="${h(v)}">`}</label>`; }).join(''); updAv(); }
function updAv(){ const r=buildDest(ui.gravAvulso.tipo, ui.gravAvulso.campos); const u=$('#avUrl'); const cap=CAP[ui.gravAvulso.tag||'NTAG213'];
  if(r.err){ u.textContent=r.err; u.classList.add('bad'); $('#avBar').style.width='0'; $('#avBytes').textContent=''; }
  else { u.classList.remove('bad'); u.textContent=r.valor; const n=ndefBytes(r.valor,r.vcard); const pct=Math.min(100,n/cap*100); $('#avBar').style.width=pct+'%'; $('#avBar').className=n>cap?'err':pct>85?'warn':''; $('#avBytes').textContent=`${n} / ${cap} bytes${n>cap?' — não cabe':''}`; }
  updGravSide(); }
function updGravSide(){
  const c=gravContext(); drawQR($('#gQR'), c.valor);
  const bytes=c.valor?ndefBytes(c.valor,isVcard(c.valor)):0; const w=$('#gWrite'); if(w && !gctrl) w.disabled=!c.valor || bytes>(CAP[c.tag]||137);
  const total=c.kind==='avulsa'?(ui.gravAvulso.qtd||1):c.total;
  if(!gctrl) $('#gCounter').innerHTML = c.kind==='avulsa' ? '' : `${c.feitas}<small> / ${total} gravadas</small>`;
  // Card do celular
  const pc=$('#phoneCard'); if(!pc) return;
  if(nfcReal){ pc.innerHTML=`<h3>Dica</h3><p class="muted" style="margin:0;font-size:13px">A antena NFC fica perto da câmera na maioria dos Android. Segure o chaveiro parado até vibrar.</p>`; return; }
  const base=(S.config.gravadorUrl||'').trim();
  if(!base){ pc.innerHTML=`<h3>Gravar pelo celular</h3><p class="muted" style="margin:0 0 10px;font-size:13px">Para gravar de verdade, hospede o app em um endereço https (Netlify, Vercel ou GitHub Pages) e cole esse endereço em Configurações. Aqui vai aparecer um QR para abrir o pedido direto no Android.</p><button class="btn sm" data-go="config">Abrir Configurações</button>`; return; }
  if(!c.valor){ pc.innerHTML=`<h3>Gravar pelo celular</h3><p class="muted" style="margin:0;font-size:13px">Defina o destino para gerar o link.</p>`; return; }
  const u=new URL(base.startsWith('http')?base:'https://'+base); u.searchParams.set('url',c.valor); u.searchParams.set('qtd',String(Math.max(1,(c.kind==='avulsa'?(ui.gravAvulso.qtd||1):c.total)-c.feitas))); u.searchParams.set('tag',c.tag); if(c.numero) u.searchParams.set('pedido',c.numero); if(c.cliente) u.searchParams.set('cliente',c.cliente); if(c.lock) u.searchParams.set('lock','1');
  pc.innerHTML=`<h3>Gravar pelo celular</h3><div class="qrbox"><div class="qr"><canvas id="phQR" width="120" height="120"></canvas></div><div><span>Aponte a câmera do Android: o gravador abre com este pedido pronto.</span><div class="btns"><button class="btn sm" id="phCopy">${svg('copy')}Copiar link do gravador</button></div></div></div>`;
  drawQR($('#phQR'), u.href); $('#phCopy').onclick=()=>copy(u.href,'Link do gravador copiado');
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function fob(cls,t,s){ const f=$('#fob'); if(!f) return; f.className='fob '+(cls||''); $('#gStatus').textContent=t; $('#gSub').textContent=s||''; }
async function startWrite(){
  const c0=gravContext(); if(!c0.valor) return;
  const lock=$('#gLock').checked; const batch=$('#gBatch').checked;
  let target = c0.kind==='avulsa' ? (ui.gravAvulso.qtd||1) : c0.total; let feitas = c0.kind==='pedido' ? c0.feitas : 0;
  if(c0.kind==='ext') feitas=gdone;
  if(c0.kind==='pedido' && feitas>=target){ target=feitas+1; }
  const stopAt = batch ? target : feitas+1;
  gctrl=new AbortController(); $('#gWrite').hidden=true; $('#gStop').hidden=false; $('#gSel').disabled=true;
  let reader=null; if(nfcReal){ try{ reader=new NDEFReader(); }catch(e){ return wFail(e); } }
  if(c0.kind==='pedido' && ['Aprovado','Produção'].includes(c0.p.status) && nfcReal){ const n=clone(S.pedidos[c0.id]); n.status='Gravação NFC'; n.historico=(n.historico||[]).concat({t:Date.now(),status:'Gravação NFC'}); await store.put('pedidos',c0.id,n); }
  let simCount=feitas, session=0;
  try{
    while(simCount<stopAt && !gctrl.signal.aborted){
      fob('waiting', `Aproxime a tag ${simCount+1} de ${target}`, 'Encoste o chaveiro atrás do celular e segure até confirmar.');
      if(!nfcReal){ await sleep(1600); if(gctrl.signal.aborted) break; }
      else { const recs = isVcard(c0.valor) ? [{recordType:'mime',mediaType:'text/vcard',data:new TextEncoder().encode(c0.valor)}] : [{recordType:'url',data:c0.valor}];
        await reader.write({records:recs},{overwrite:true,signal:gctrl.signal}); if(lock) await reader.makeReadOnly({signal:gctrl.signal}); }
      simCount++; session++;
      try{ navigator.vibrate&&navigator.vibrate(120); }catch(e){}
      if(nfcReal && c0.kind==='pedido'){ const n=clone(S.pedidos[c0.id]); n.gravadas=(n.gravadas||0)+1; await store.put('pedidos',c0.id,n); }
      if(c0.kind==='ext') gdone=simCount;
      if($('#gCounter')) $('#gCounter').innerHTML = `${simCount}<small> / ${target} gravadas</small>`;
      fob('ok', nfcReal?'Tag gravada':'Gravação simulada', lock?'Link gravado e tag bloqueada.':'Afaste este chaveiro e encoste o próximo.');
      if(simCount<stopAt) await sleep(1400);
    }
  }catch(e){ if(e.name!=='AbortError') return wFail(e); }
  wEnd(session, simCount>=target, c0);
}
function wFail(e){ const m={NotAllowedError:'Permissão de NFC negada. Libere em Configurações do site no Chrome.',NotSupportedError:'NFC desligado ou tag incompatível. Ligue o NFC nas configurações do Android.',NotReadableError:'Não deu para ler a tag. Segure o chaveiro parado por 1 segundo.',NetworkError:'A tag saiu de perto antes de terminar. Tente de novo sem mexer.',InvalidStateError:'Esta tag está bloqueada. Separe-a e use outra.'}[e.name]||(e.message||'Erro ao gravar.');
  fob('err','Não gravou',m); wEnd(0,false,null,true); }
function wEnd(n, complete, c0, err){ gctrl=null; if($('#gWrite')){ $('#gWrite').hidden=false; $('#gStop').hidden=true; $('#gSel').disabled=false; }
  if(!err){ if(n===0) fob('','Gravação parada','Nenhuma tag nova foi gravada.'); else if(complete) fob('ok', nfcReal?'Pedido completo':'Simulação completa', nfcReal?`${n} tag${n>1?'s':''} gravada${n>1?'s':''} nesta rodada.`:'Na simulação o pedido não é alterado.'); }
  if(n>0 && nfcReal) toast(`${n} tag${n>1?'s':''} gravada${n>1?'s':''}`);
  if(n>0 && nfcReal && c0 && c0.kind==='pedido'){ const p=S.pedidos[c0.id]; const n2=clone(p); n2.historico=(n2.historico||[]).concat({t:Date.now(),nota:`${n} tag${n>1?'s':''} gravada${n>1?'s':''}`}); store.put('pedidos',c0.id,n2); }
  refreshGravContext(true); }
let rctrl=null;
async function startRead(){ const out=$('#gOut'); const c=gravContext();
  if(!nfcReal){ out.innerHTML=`<span class="k">Simulação · número de série</span>\n04:A2:3F:1B:6C:80:81\n\n<span class="k">Registro 1 · ${c.valor&&isVcard(c.valor)?'mime text/vcard':'url'}</span>\n${h(c.valor||'(vazio)')}${c.valor?'\n<span style="color:var(--ok)">✓ Confere com o destino</span>':''}`; return; }
  rctrl=new AbortController(); $('#gRead').hidden=true; $('#gReadStop').hidden=false; out.innerHTML='<span class="k">Aproxime o chaveiro…</span>';
  try{ const r=new NDEFReader(); await r.scan({signal:rctrl.signal});
    r.onreadingerror=()=>{ out.innerHTML='<span class="k">Tag vazia ou em formato desconhecido.</span>'; };
    r.onreading=({serialNumber,message})=>{ const cur=gravContext(); let s='<span class="k">Número de série</span>\n'+h(serialNumber||'—');
      if(!message.records.length) s+='\n\n<span class="k">Tag vazia</span>';
      message.records.forEach((rec,i)=>{ let v=''; try{ v=rec.data?new TextDecoder(rec.encoding||'utf-8').decode(rec.data):''; }catch(e){ v='(binário)'; }
        s+=`\n\n<span class="k">Registro ${i+1} · ${h(rec.recordType)}${rec.mediaType?' '+h(rec.mediaType):''}</span>\n${h(v)}`;
        if(cur.valor) s+= v===cur.valor ? '\n<span style="color:var(--ok)">✓ Confere com o destino</span>' : '\n<span style="color:var(--err)">✗ Diferente do destino deste pedido</span>'; });
      out.innerHTML=s; try{ navigator.vibrate&&navigator.vibrate(60); }catch(e){} };
  }catch(e){ out.innerHTML=`<span style="color:var(--err)">${h(e.message||e.name)}</span>`; stopRead(); } }
function stopRead(){ rctrl&&rctrl.abort(); rctrl=null; const a=$('#gRead'), b=$('#gReadStop'); if(a){ a.hidden=false; b.hidden=true; } }

/* ---------- QR / arquivos / cópia ---------- */
function makeQR(text){ const q=qrcode(0,'M'); q.addData(unescape(encodeURIComponent(text))); q.make(); return q; }
function drawQR(c, text){ if(!c) return; const g=c.getContext('2d'); g.fillStyle='#F0EEE8'; g.fillRect(0,0,c.width,c.height);
  if(!text || typeof qrcode==='undefined') return; try{ const q=makeQR(text), n=q.getModuleCount(), s=c.width/n; g.fillStyle='#0F0F0E';
    for(let y=0;y<n;y++) for(let x=0;x<n;x++) if(q.isDark(y,x)) g.fillRect(Math.floor(x*s),Math.floor(y*s),Math.ceil(s),Math.ceil(s)); }catch(e){} }
function qrDownload(text, name){ if(typeof qrcode==='undefined') return toast('QR indisponível sem internet.'); const q=makeQR(text), n=q.getModuleCount(), m=4, s=20; const c=document.createElement('canvas'); c.width=c.height=(n+2*m)*s; const g=c.getContext('2d');
  g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); g.fillStyle='#000'; for(let y=0;y<n;y++) for(let x=0;x<n;x++) if(q.isDark(y,x)) g.fillRect((x+m)*s,(y+m)*s,s,s);
  c.toBlob(b=>saveFile(name,b,'image/png')); }
async function saveFile(name, data, type){
  if(DL){ try{ await DL.save({filename:name, data: typeof data==='string'?data:data}); }catch(e){ if(e&&e.code!=='declined') toast('Não foi possível baixar aqui.'); } return; }
  if(framed){ return toast('Download indisponível nesta visualização.'); }
  const blob = data instanceof Blob ? data : new Blob([data],{type}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500); }
function copy(text,msg){ const done=()=>toast(msg);
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done,fallback); else fallback();
  function fallback(){ const t=document.createElement('textarea'); t.value=text; t.style.position='fixed'; t.style.opacity='0'; document.body.appendChild(t); t.select(); try{ document.execCommand('copy'); done(); }catch(e){ toast('Selecione e copie manualmente.'); } t.remove(); } }
let tt; function toast(m){ const t=$('#toast'); t.textContent=m; t.classList.add('show'); clearTimeout(tt); tt=setTimeout(()=>t.classList.remove('show'),2800); }

/* ---------- Configurações ---------- */
function vConfig(){ const c=S.config; const nEx=['clientes','produtos','pedidos'].reduce((a,k)=>a+Object.values(S[k]).filter(x=>x.ex).length,0);
  return `<div class="phead"><div><h1>Configurações</h1><p>Dados da loja, gravador no celular e backup.</p></div></div>
  <div class="grid2">
   <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
    <div class="card"><h3>Loja</h3><div class="fields">
      <label class="f" for="cfEmp">Nome da empresa<input type="text" id="cfEmp" value="${h(c.empresa||'')}"></label>
      <label class="f" for="cfWa">WhatsApp da loja<input type="tel" id="cfWa" value="${h(c.whatsapp||'')}" placeholder="(19) 99999-9999"></label>
      <label class="f full" for="cfGrav">Endereço do gravador (https)<input type="url" id="cfGrav" value="${h(c.gravadorUrl||'')}" placeholder="https://outlaser-nfc.netlify.app"><span class="hint">Onde este app está hospedado. Serve para abrir pedidos direto no Android e gravar de verdade.</span></label>
    </div><div class="btns" style="margin-top:12px"><button class="btn gold" id="cfSave">Salvar</button></div></div>
    <div class="card"><h3>Como gravar de verdade</h3><ol style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px;font-size:13.5px">
      <li>Suba o arquivo <span class="mono">index.html</span> do app em um endereço https (arraste para app.netlify.com/drop).</li>
      <li>Cole o endereço acima e salve.</li>
      <li>No Android, abra o endereço no Chrome e ligue o NFC.</li>
      <li>Em Gravar NFC, escolha o pedido e encoste cada chaveiro.</li></ol>
      <p class="muted" style="font-size:13px;margin:12px 0 0">Tag recomendada: NTAG213 para links curtos; NTAG215/216 para links longos e cartões de contato. iPhone lê os chaveiros, mas não grava pelo navegador.</p></div>
   </div>
   <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
    <div class="card"><h3>Onde ficam os dados</h3><p style="margin:0 0 10px;font-size:13.5px">${mode==='db'?'<span class="dot ok"></span>Na nuvem, junto com esta página. Quem você convidar com acesso de edição vê e altera os mesmos pedidos.':'<span class="dot warn"></span>Só neste aparelho e navegador. Faça backup com frequência e importe no outro aparelho quando precisar.'}</p>
      <div class="btns"><button class="btn" id="bkCopy">${svg('copy')}Copiar backup</button><button class="btn" id="bkSave">Baixar backup (.json)</button></div>
      <label class="f" for="bkIn" style="margin-top:14px">Importar backup<textarea id="bkIn" rows="4" placeholder="Cole aqui o conteúdo do backup"></textarea></label>
      <div class="btns" style="margin-top:8px"><label class="btn sm" for="bkFile" style="cursor:pointer">Escolher arquivo…</label><input type="file" id="bkFile" accept=".json,application/json" hidden><button class="btn sm" id="bkImp">Importar</button></div>
      <p class="hint" style="margin:8px 0 0">Importar junta os registros do backup com os atuais; registros com o mesmo código são substituídos.</p></div>
    <div class="card"><h3>Exemplos</h3><p class="muted" style="margin:0 0 10px;font-size:13.5px">${nEx?`Há ${nEx} registros de exemplo (clientes, produtos e pedidos fictícios).`:'Nenhum registro de exemplo.'}</p>
      ${nEx?`<div class="btns"><button class="btn danger" id="exDel">Apagar exemplos</button></div>`:''}</div>
   </div>
  </div>`; }
function mountConfig(){
  $('#cfSave').onclick=async()=>{ let g=$('#cfGrav').value.trim(); if(g && !/^https:\/\//i.test(g)) g='https://'+g.replace(/^http:\/\//i,'');
    await store.config(Object.assign({},S.config,{empresa:$('#cfEmp').value.trim()||'OUTLASER', whatsapp:$('#cfWa').value.trim(), gravadorUrl:g})); toast('Configurações salvas'); };
  const dump=()=>JSON.stringify({app:'outlaser-nfc',versao:1,exportado:new Date().toISOString(),clientes:S.clientes,produtos:S.produtos,pedidos:S.pedidos,config:S.config});
  $('#bkCopy').onclick=()=>copy(dump(),'Backup copiado');
  $('#bkSave').onclick=()=>saveFile('backup-outlaser-'+today()+'.json', dump(), 'application/json');
  $('#bkFile').onchange=e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ $('#bkIn').value=r.result; toast('Arquivo carregado. Toque em Importar.'); }; r.readAsText(f); };
  $('#bkImp').onclick=async()=>{ let d; try{ d=JSON.parse($('#bkIn').value); }catch(e){ return toast('Backup inválido: cole o conteúdo completo do arquivo .json.'); }
    let n=0; for(const col of ['clientes','produtos','pedidos']){ for(const [id,v] of Object.entries(d[col]||{})){ if(v&&typeof v==='object'){ await store.put(col,id,v); n++; } } }
    if(d.config) await store.config(Object.assign({},S.config,d.config)); toast(n+' registros importados'); };
  const ex=$('#exDel'); if(ex) ex.onclick=()=>confirmInline(ex.parentElement,'Apagar todos os clientes, produtos e pedidos de exemplo?','Apagar exemplos',async()=>{
    for(const col of ['pedidos','clientes','produtos']){ for(const [id,v] of Object.entries(S[col])){ if(v.ex) await store.del(col,id); } } toast('Exemplos apagados'); });
}

/* ---------- Início ---------- */
async function boot(){
  const cl = window.claude && typeof window.claude.use==='function' ? window.claude : null;
  if(cl){
    try{ DL = await cl.use('downloads'); }catch(e){ DL=null; }
    let db=null; try{ db = await cl.use('db'); }catch(e){ db=null; }
    if(db){ DB=db; mode='db'; subscribe(); setTimeout(()=>{ if(!loaded.pedidos) scheduleRender(); }, 4000); render(); return; }
  }
  mode='local'; loadLocal(); render();
}
// Pedido vindo por link (?pedido=OL-0007&url=...): usa o pedido local se existir
function applyExt(){ if(!ext) return; const hit=Object.entries(S.pedidos).find(([k,p])=>p.numero===ext.numero && (p.destino||{}).valor===ext.valor); if(hit){ ui.gravPedido=hit[0]; } else ui.gravPedido='__ext'; }
renderNav();
boot().then(()=>{ if(ext){ applyExt(); view='gravar'; gravMounted=false; render(); } });
})();
