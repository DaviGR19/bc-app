import { useState } from "react";

const C = {
  blue:     "#1A56DB",
  blueSoft: "#EEF3FF",
  blueMid:  "#DBEAFE",
  text:     "#111827",
  sub:      "#6B7280",
  muted:    "#9CA3AF",
  border:   "#E5E9F0",
  bg:       "#F7F8FC",
  white:    "#FFFFFF",
  green:    "#059669",
  amber:    "#D97706",
  red:      "#DC2626",
};

const AREAS = ["Comercial", "Gestão de Pessoas", "Projetos", "Jurídico Financeiro", "Marketing"];
const ROLES = ["Membro", "Diretor(a)", "Vice-Presidente", "Presidente"];
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DAYS_SHORT = ["D","S","T","Q","Q","S","S"];

const USERS = [
  { email:"ana@bc.com",     password:"1234", name:"Ana Beatriz",  initials:"AB", area:"Marketing",           role:"membro"    },
  { email:"carlos@bc.com",  password:"1234", name:"Carlos Melo",  initials:"CM", area:"Jurídico Financeiro",  role:"diretor"   },
  { email:"julia@bc.com",   password:"1234", name:"Julia Rocha",  initials:"JR", area:"Gestão de Pessoas",    role:"diretor"   },
  { email:"pres@bc.com",    password:"1234", name:"Marcos Lima",  initials:"ML", area:"Presidência",          role:"presidente"},
  { email:"vice@bc.com",    password:"1234", name:"Beatriz Sol",  initials:"BS", area:"Presidência",          role:"vice"      },
];

const DEMANDAS = [
  { id:1, titulo:"Apresentação Q2",        prazo:"2026-05-14", status:"urgente",   area:"Marketing",           resp:"Ana B."    },
  { id:2, titulo:"Relatório de Captação",  prazo:"2026-05-16", status:"andamento", area:"Jurídico Financeiro", resp:"Carlos M." },
  { id:3, titulo:"Entrevistas PS",         prazo:"2026-05-13", status:"pendente",  area:"Gestão de Pessoas",   resp:"Julia R."  },
  { id:4, titulo:"Atualizar site",         prazo:"2026-05-20", status:"andamento", area:"Marketing",           resp:"Ana B."    },
  { id:5, titulo:"Contrato fornecedor",    prazo:"2026-05-18", status:"concluido", area:"Jurídico Financeiro", resp:"Carlos M." },
  { id:6, titulo:"Proposta cliente Alfa",  prazo:"2026-05-15", status:"urgente",   area:"Comercial",           resp:"Fernanda O."},
  { id:7, titulo:"Escopo projeto Beta",    prazo:"2026-05-17", status:"andamento", area:"Projetos",            resp:"Rafael S." },
  { id:8, titulo:"Campanha redes sociais", prazo:"2026-05-22", status:"pendente",  area:"Marketing",           resp:"Ana B."    },
];

const EVENTOS = [
  { id:1, date:"2026-05-13", titulo:"Reunião Geral BC",         hora:"19h00", local:"Online"    },
  { id:2, date:"2026-05-15", titulo:"Treinamento de Liderança", hora:"18h30", local:"Sala A"    },
  { id:3, date:"2026-05-17", titulo:"Pitch Day",                hora:"14h00", local:"Auditório" },
  { id:4, date:"2026-05-20", titulo:"1:1 Presidência",          hora:"17h00", local:"Online"    },
  { id:5, date:"2026-06-03", titulo:"Planejamento Semestral",   hora:"09h00", local:"Sala B"    },
  { id:6, date:"2026-06-18", titulo:"Evento de Captação",       hora:"18h00", local:"Auditório" },
  { id:7, date:"2026-07-10", titulo:"Confraternização BC",      hora:"19h30", local:"Externo"   },
  { id:8, date:"2026-08-05", titulo:"Processo Seletivo",        hora:"14h00", local:"Online"    },
  { id:9, date:"2026-09-12", titulo:"Semana de Projetos",       hora:"08h00", local:"Auditório" },
];

const AVISOS = [
  { id:1, titulo:"Reunião de diretoria na sexta-feira às 18h",       tempo:"1h atrás",  tag:"Diretoria",   autor:"Presidência" },
  { id:2, titulo:"Prazo final para entrega dos relatórios: 20/05",   tempo:"3h atrás",  tag:"Urgente",     autor:"Presidência" },
  { id:3, titulo:"BC fecha parceria com startup de EdTech",          tempo:"5h atrás",  tag:"Parceria",    autor:"Comercial"   },
  { id:4, titulo:"Novo processo seletivo abre vagas para membros",   tempo:"1d atrás",  tag:"Institucional",autor:"GP"         },
  { id:5, titulo:"Projeto de consultoria premiado no regional",      tempo:"2d atrás",  tag:"Conquista",   autor:"Projetos"    },
];

const MATERIAIS = {
  "Comercial":           [{ nome:"Template de Proposta",   tipo:"DOC", tam:"540 KB" },{ nome:"Script de Vendas",       tipo:"PDF", tam:"1.2 MB" }],
  "Gestão de Pessoas":   [{ nome:"Manual de Onboarding",  tipo:"PDF", tam:"3.1 MB" },{ nome:"Formulário de Feedback", tipo:"DOC", tam:"200 KB" }],
  "Projetos":            [{ nome:"Metodologia BC",         tipo:"PDF", tam:"4.0 MB" },{ nome:"Template de Escopo",     tipo:"DOC", tam:"300 KB" }],
  "Jurídico Financeiro": [{ nome:"Planilha de Metas",      tipo:"XLS", tam:"890 KB" },{ nome:"Modelo de Contrato",     tipo:"DOC", tam:"450 KB" }],
  "Marketing":           [{ nome:"Kit Visual BC 2026",     tipo:"ZIP", tam:"18 MB"  },{ nome:"Guia de Identidade",     tipo:"PDF", tam:"6.5 MB" }],
};

const STATUS = {
  urgente:   { label:"Urgente",      color:C.red,   bg:"#FEF2F2" },
  andamento: { label:"Em andamento", color:C.amber, bg:"#FFFBEB" },
  pendente:  { label:"Pendente",     color:C.blue,  bg:C.blueSoft},
  concluido: { label:"Concluído",    color:C.green, bg:"#ECFDF5" },
};

// ─── utils ───────────────────────────────────────────────────────────────────
function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function firstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }
function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
}

function canSeeAll(user) { return user.role === "presidente" || user.role === "vice"; }
function canPostAvisos(user) { return user.role !== "membro"; }

// ─── small components ─────────────────────────────────────────────────────────
function Pill({ status }) {
  const s = STATUS[status];
  return <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, color:s.color, background:s.bg, whiteSpace:"nowrap" }}>{s.label}</span>;
}

function Divider({ indent=20 }) {
  return <div style={{ height:1, background:C.border, margin:`0 ${indent}px` }} />;
}

function SLabel({ children }) {
  return <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, color:C.muted, textTransform:"uppercase", padding:"20px 20px 10px" }}>{children}</div>;
}

// ─── icons ────────────────────────────────────────────────────────────────────
const Ic = {
  home:   c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
  check:  c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  cal:    c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  bell:   c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  folder: c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  down:   c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  chevD:  open=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.2s"}}><polyline points="6 9 12 15 18 9"/></svg>,
  lock:   ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  eye:    ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  logout: c=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c||C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function handleLogin() {
    setError("");
    setLoading(true);
    setTimeout(() => {
      const user = USERS.find(u => u.email === email.trim().toLowerCase() && u.password === password);
      if (user) { onLogin(user); }
      else { setError("E-mail ou senha incorretos."); setLoading(false); }
    }, 700);
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", background:C.white, padding:"0 32px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap'); *{box-sizing:border-box;} input:focus{outline:none;}`}</style>

      {/* Logo */}
      <div style={{ textAlign:"center", marginBottom:48 }}>
        <div style={{ width:64, height:64, borderRadius:18, background:C.blue, display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
          </svg>
        </div>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:C.blue, textTransform:"uppercase", marginBottom:4 }}>Business Consultoria</div>
        <div style={{ fontSize:26, fontWeight:700, fontFamily:"'DM Serif Display',serif", color:C.text }}>Bem-vindo de volta</div>
        <div style={{ fontSize:14, color:C.sub, marginTop:6 }}>Acesse sua conta para continuar</div>
      </div>

      {/* Form */}
      <div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:12, fontWeight:700, color:C.sub, letterSpacing:0.5, display:"block", marginBottom:6 }}>E-MAIL</label>
          <input
            value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="seu@bc.com" type="email"
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            style={{ width:"100%", padding:"13px 14px", borderRadius:10, border:`1.5px solid ${error?C.red:C.border}`, fontSize:14, color:C.text, background:C.bg, fontFamily:"inherit", transition:"border 0.15s" }}
          />
        </div>

        <div style={{ marginBottom: error?10:24 }}>
          <label style={{ fontSize:12, fontWeight:700, color:C.sub, letterSpacing:0.5, display:"block", marginBottom:6 }}>SENHA</label>
          <div style={{ position:"relative" }}>
            <input
              value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••" type={showPw?"text":"password"}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              style={{ width:"100%", padding:"13px 44px 13px 14px", borderRadius:10, border:`1.5px solid ${error?C.red:C.border}`, fontSize:14, color:C.text, background:C.bg, fontFamily:"inherit" }}
            />
            <button onClick={()=>setShowPw(v=>!v)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:0, display:"flex" }}>
              {showPw ? Ic.eyeOff() : Ic.eye()}
            </button>
          </div>
        </div>

        {error && <div style={{ fontSize:13, color:C.red, marginBottom:16, fontWeight:500 }}>{error}</div>}

        <button onClick={handleLogin} disabled={loading} style={{
          width:"100%", padding:14, borderRadius:10, border:"none",
          background: loading ? C.blueMid : C.blue,
          color: loading ? C.blue : C.white,
          fontSize:15, fontWeight:700, cursor: loading?"not-allowed":"pointer",
          fontFamily:"inherit", transition:"all 0.2s",
        }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>

      {/* hint */}
      <div style={{ marginTop:32, padding:14, background:C.bg, borderRadius:10, border:`1px solid ${C.border}` }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Contas de teste</div>
        {USERS.map(u=>(
          <div key={u.email} onClick={()=>{setEmail(u.email);setPassword(u.password);setError("");}}
            style={{ fontSize:12, color:C.sub, padding:"4px 0", cursor:"pointer", display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontWeight:500, color:C.text }}>{u.name}</span>
            <span style={{ color:C.blue }}>{u.role === "presidente"?"Presidente": u.role==="vice"?"Vice":u.role==="diretor"?"Diretor(a)":"Membro"} · {u.area}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Full Year Calendar ────────────────────────────────────────────────────────
function FullCalendar({ eventos }) {
  const year = 2026;
  const [selectedDate, setSelected] = useState(null);

  const eventMap = {};
  eventos.forEach(ev => { eventMap[ev.date] = ev; });

  const todayStr = "2026-05-11";
  const selectedEv = selectedDate ? eventMap[selectedDate] : null;

  return (
    <div>
      <SLabel>Calendário 2026</SLabel>
      {MONTHS.map((mName, mi) => {
        const days   = daysInMonth(year, mi);
        const offset = firstDayOfMonth(year, mi);
        const monthEvts = eventos.filter(e => {
          const d = new Date(e.date+"T00:00:00");
          return d.getFullYear()===year && d.getMonth()===mi;
        });

        return (
          <div key={mi} style={{ margin:"0 20px 20px", background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 12px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:12, paddingLeft:2 }}>{mName}</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", textAlign:"center", gap:1 }}>
              {DAYS_SHORT.map((d,i)=>(
                <div key={i} style={{ fontSize:9, fontWeight:700, color:C.muted, paddingBottom:6 }}>{d}</div>
              ))}
              {Array.from({length:offset}).map((_,i)=><div key={`e${i}`}/>)}
              {Array.from({length:days},(_,i)=>{
                const day  = i+1;
                const iso  = `${year}-${String(mi+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const hasEv= !!eventMap[iso];
                const isT  = iso===todayStr;
                const isSel= iso===selectedDate;
                return (
                  <div key={day} onClick={()=>hasEv&&setSelected(isSel?null:iso)}
                    style={{ width:28, height:28, margin:"0 auto", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, cursor:hasEv?"pointer":"default", position:"relative",
                      background: isT?C.blue: isSel?C.blueMid:"transparent",
                      color: isT?C.white: hasEv?C.blue: C.text,
                      fontWeight: isT||hasEv?700:400,
                    }}>
                    {day}
                    {hasEv&&!isT&&<div style={{ position:"absolute", bottom:2, width:3, height:3, borderRadius:"50%", background:C.blue }}/>}
                  </div>
                );
              })}
            </div>
            {monthEvts.length>0&&(
              <div style={{ marginTop:12, borderTop:`1px solid ${C.border}`, paddingTop:10 }}>
                {monthEvts.map((ev,i)=>(
                  <div key={ev.id}>
                    <div style={{ display:"flex", gap:10, alignItems:"center", padding:"6px 2px" }}>
                      <div style={{ minWidth:28, height:28, borderRadius:7, background:C.blueSoft, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontSize:11, fontWeight:800, color:C.blue }}>{new Date(ev.date+"T00:00:00").getDate()}</span>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600 }}>{ev.titulo}</div>
                        <div style={{ fontSize:11, color:C.sub }}>{ev.hora} · {ev.local}</div>
                      </div>
                    </div>
                    {i<monthEvts.length-1&&<Divider indent={0}/>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function BCApp() {
  const [user, setUser]         = useState(null);
  const [tab, setTab]           = useState("inicio");
  const [openFolder, setFolder] = useState(null);
  const [novaForm, setNovaForm] = useState(false);
  const [novaData, setNovaData] = useState({ titulo:"", resp:"", prazo:"", area:"" });

  if (!user) return <LoginScreen onLogin={u=>{ setUser(u); setNovaData(v=>({...v,area:u.area})); }} />;

  const myDemandas = canSeeAll(user) ? DEMANDAS : DEMANDAS.filter(d=>d.area===user.area);
  const urgentes   = myDemandas.filter(d=>d.status==="urgente"||d.status==="pendente");

  const TABS = [
    { id:"inicio",     label:"Início",   icon:Ic.home   },
    { id:"demandas",   label:"Demandas", icon:Ic.check  },
    { id:"calendario", label:"Agenda",   icon:Ic.cal    },
    { id:"avisos",     label:"Avisos",   icon:Ic.bell   },
    { id:"materiais",  label:"Materiais",icon:Ic.folder },
  ];

  const TAB_LABEL = { inicio:"Painel", demandas:"Demandas", calendario:"Agenda", avisos:"Avisos", materiais:"Materiais" };

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:C.bg, minHeight:"100vh", maxWidth:430, margin:"0 auto", color:C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap'); *{box-sizing:border-box;} input::placeholder{color:#9CA3AF;} input:focus{outline:none;border-color:${C.blue}!important;} button{font-family:inherit;} ::-webkit-scrollbar{display:none;} select{font-family:inherit;}`}</style>

      {/* Header */}
      <div style={{ position:"sticky", top:0, zIndex:40, background:C.white, borderBottom:`1px solid ${C.border}`, padding:"14px 20px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:2.5, color:C.blue, textTransform:"uppercase" }}>Business Consultoria</div>
          <div style={{ fontSize:20, fontWeight:700, fontFamily:"'DM Serif Display',serif", marginTop:1 }}>{TAB_LABEL[tab]}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={()=>{setUser(null);setTab("inicio");}} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", padding:4 }}>
            {Ic.logout()}
          </button>
          <div style={{ width:38, height:38, borderRadius:"50%", background:C.blue, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:C.white }}>
            {user.initials}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ paddingBottom:88 }}>

        {/* ══ INÍCIO ══ */}
        {tab==="inicio" && (
          <>
            <div style={{ margin:"16px 20px 0", background:C.blue, borderRadius:16, padding:"22px 20px", color:C.white, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", right:-30, top:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }}/>
              <div style={{ position:"absolute", right:20, bottom:-40, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }}/>
              <div style={{ fontSize:12, opacity:0.65, marginBottom:4 }}>Segunda-feira, 11 de maio de 2026</div>
              <div style={{ fontSize:22, fontWeight:700, fontFamily:"'DM Serif Display',serif" }}>Bom dia, {user.name.split(" ")[0]} ✦</div>
              <div style={{ fontSize:12, opacity:0.65, marginTop:4 }}>{user.area} · {user.role==="presidente"?"Presidente":user.role==="vice"?"Vice-Presidente":user.role==="diretor"?"Diretor(a)":"Membro"}</div>
            </div>

            <SLabel>Próximos eventos</SLabel>
            {EVENTOS.filter(e=>e.date>="2026-05-11").slice(0,2).map((ev,i)=>(
              <div key={ev.id}>
                <div style={{ padding:"12px 20px", display:"flex", gap:14, alignItems:"center" }}>
                  <div style={{ minWidth:46, height:46, borderRadius:12, background:C.blueSoft, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:16, fontWeight:800, color:C.blue, lineHeight:1 }}>{new Date(ev.date+"T00:00:00").getDate()}</span>
                    <span style={{ fontSize:9, fontWeight:700, color:C.blue, opacity:0.6, textTransform:"uppercase" }}>{MONTHS[new Date(ev.date+"T00:00:00").getMonth()].slice(0,3)}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600 }}>{ev.titulo}</div>
                    <div style={{ fontSize:12, color:C.sub, marginTop:2 }}>{ev.hora} · {ev.local}</div>
                  </div>
                </div>
                {i<1&&<Divider/>}
              </div>
            ))}

            {urgentes.length>0&&(
              <>
                <SLabel>Demandas prioritárias</SLabel>
                {urgentes.slice(0,2).map((d,i)=>(
                  <div key={d.id}>
                    <div style={{ padding:"12px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:600 }}>{d.titulo}</div>
                        <div style={{ fontSize:12, color:C.sub, marginTop:2 }}>Prazo {fmtDate(d.prazo)}</div>
                      </div>
                      <Pill status={d.status}/>
                    </div>
                    {i<urgentes.slice(0,2).length-1&&<Divider/>}
                  </div>
                ))}
              </>
            )}

            <SLabel>Último aviso</SLabel>
            <div style={{ margin:"0 20px", background:C.white, border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.blue}`, borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.blue, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{AVISOS[0].tag}</div>
              <div style={{ fontSize:15, fontWeight:600, lineHeight:1.45 }}>{AVISOS[0].titulo}</div>
              <div style={{ fontSize:12, color:C.sub, marginTop:8 }}>{AVISOS[0].tempo} · {AVISOS[0].autor}</div>
            </div>
          </>
        )}

        {/* ══ DEMANDAS ══ */}
        {tab==="demandas" && (
          <>
            <div style={{ margin:"14px 20px 0" }}>
              {canSeeAll(user)
                ? <div style={{ fontSize:12, color:C.blue, fontWeight:600, background:C.blueSoft, borderRadius:99, padding:"5px 14px", display:"inline-block" }}>Visão geral — todas as áreas</div>
                : <div style={{ fontSize:12, color:C.sub, background:C.white, border:`1px solid ${C.border}`, borderRadius:99, padding:"5px 14px", display:"inline-flex", alignItems:"center", gap:5 }}>{Ic.lock()} Apenas: <strong style={{ color:C.text }}>{user.area}</strong></div>
              }
            </div>

            <div style={{ height:4 }}/>
            {myDemandas.map((d,i)=>(
              <div key={d.id}>
                <div style={{ padding:"13px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600 }}>{d.titulo}</div>
                    <div style={{ fontSize:12, color:C.sub, marginTop:3 }}>
                      {d.resp}
                      {canSeeAll(user)&&<span style={{ color:C.muted }}> · {d.area}</span>}
                      <span style={{ color:C.muted }}> · {fmtDate(d.prazo)}</span>
                    </div>
                  </div>
                  <Pill status={d.status}/>
                </div>
                {i<myDemandas.length-1&&<Divider/>}
              </div>
            ))}

            <div style={{ padding:"16px 20px 0" }}>
              <button onClick={()=>setNovaForm(v=>!v)} style={{ width:"100%", padding:13, borderRadius:12, border: novaForm?`1px solid ${C.border}`:"none", background:novaForm?C.bg:C.blue, color:novaForm?C.sub:C.white, fontSize:14, fontWeight:700, cursor:"pointer" }}>
                {novaForm?"Cancelar":"+ Nova demanda"}
              </button>
              {novaForm&&(
                <div style={{ marginTop:10, background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.blue, marginBottom:12 }}>Nova demanda</div>
                  {[["titulo","Título"],["resp","Responsável"],["prazo","Prazo (dd/mm)"]].map(([k,ph])=>(
                    <input key={k} placeholder={ph} value={novaData[k]} onChange={e=>setNovaData(v=>({...v,[k]:e.target.value}))}
                      style={{ display:"block", width:"100%", marginBottom:10, padding:"10px 12px", borderRadius:8, border:`1px solid ${C.border}`, fontSize:14, color:C.text, background:C.bg }}/>
                  ))}
                  {canSeeAll(user)&&(
                    <select value={novaData.area} onChange={e=>setNovaData(v=>({...v,area:e.target.value}))}
                      style={{ display:"block", width:"100%", marginBottom:10, padding:"10px 12px", borderRadius:8, border:`1px solid ${C.border}`, fontSize:14, color:C.text, background:C.bg }}>
                      {AREAS.map(a=><option key={a}>{a}</option>)}
                    </select>
                  )}
                  <button style={{ width:"100%", padding:11, borderRadius:8, border:"none", background:C.blue, color:C.white, fontWeight:700, cursor:"pointer", fontSize:14 }}>Criar demanda</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ CALENDÁRIO ══ */}
        {tab==="calendario" && <FullCalendar eventos={EVENTOS}/>}

        {/* ══ AVISOS ══ */}
        {tab==="avisos" && (
          <>
            {canPostAvisos(user)&&(
              <div style={{ margin:"16px 20px 0", padding:"12px 14px", background:C.blueSoft, borderRadius:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, color:C.blue, fontWeight:600 }}>Você pode publicar avisos</span>
                <button style={{ padding:"6px 14px", borderRadius:8, border:"none", background:C.blue, color:C.white, fontSize:12, fontWeight:700, cursor:"pointer" }}>+ Publicar</button>
              </div>
            )}
            <SLabel>Comunicados</SLabel>
            {AVISOS.map((n,i)=>(
              <div key={n.id}>
                <div style={{ padding:"16px 20px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"inline-block", fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:C.blue, background:C.blueSoft, borderRadius:99, padding:"3px 10px", marginBottom:8 }}>{n.tag}</div>
                      <div style={{ fontSize:i===0?16:14, fontWeight:i===0?700:600, lineHeight:1.45 }}>{n.titulo}</div>
                      <div style={{ fontSize:12, color:C.muted, marginTop:8 }}>{n.tempo} · {n.autor}</div>
                    </div>
                  </div>
                </div>
                {i<AVISOS.length-1&&<Divider/>}
              </div>
            ))}
          </>
        )}

        {/* ══ MATERIAIS ══ */}
        {tab==="materiais" && (
          <>
            <SLabel>Pastas por área</SLabel>
            {AREAS.map((area,ai)=>{
              const isOpen = openFolder===area;
              const files  = MATERIAIS[area]||[];
              return (
                <div key={area}>
                  <button onClick={()=>setFolder(isOpen?null:area)} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"14px 20px", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:isOpen?C.blue:C.blueSoft, display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.2s" }}>
                      {Ic.folder(isOpen?C.white:C.blue)}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{area}</div>
                      <div style={{ fontSize:12, color:C.sub, marginTop:1 }}>{files.length} arquivo{files.length!==1?"s":""}</div>
                    </div>
                    {Ic.chevD(isOpen)}
                  </button>

                  {isOpen&&(
                    <div style={{ margin:"0 20px 6px", background:C.white, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
                      {files.map((f,fi)=>(
                        <div key={fi}>
                          <div style={{ padding:"11px 14px", display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{ minWidth:36, height:36, borderRadius:8, background:C.blueSoft, display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <span style={{ fontSize:9, fontWeight:800, color:C.blue, letterSpacing:0.5 }}>{f.tipo}</span>
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:13, fontWeight:600 }}>{f.nome}</div>
                              <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{f.tam}</div>
                            </div>
                            <button style={{ width:30, height:30, borderRadius:7, border:`1px solid ${C.border}`, background:C.bg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              {Ic.down()}
                            </button>
                          </div>
                          {fi<files.length-1&&<Divider indent={14}/>}
                        </div>
                      ))}
                    </div>
                  )}
                  {ai<AREAS.length-1&&!isOpen&&<Divider/>}
                </div>
              );
            })}
            <div style={{ padding:"20px", textAlign:"center" }}>
              <span style={{ fontSize:12, color:C.muted }}>Drive continua como backup automático</span>
            </div>
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, zIndex:50, background:C.white, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-around", padding:"10px 0 20px" }}>
        {TABS.map(t=>{
          const active=tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer", padding:"4px 12px" }}>
              {t.icon(active?C.blue:C.muted)}
              <span style={{ fontSize:10, fontWeight:700, color:active?C.blue:C.muted, letterSpacing:0.3 }}>{t.label}</span>
              {active&&<div style={{ width:4, height:4, borderRadius:"50%", background:C.blue }}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
