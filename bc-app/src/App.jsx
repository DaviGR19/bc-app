import { useState, useRef } from "react";

const C = {
  blue:"#1A56DB", blueSoft:"#EEF3FF", blueMid:"#DBEAFE",
  text:"#111827", sub:"#6B7280", muted:"#9CA3AF",
  border:"#E5E9F0", bg:"#F7F8FC", white:"#FFFFFF",
  green:"#059669", amber:"#D97706", red:"#DC2626",
};

const AREAS = ["Comercial","Gestão de Pessoas","Projetos","Jurídico Financeiro","Marketing"];
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAYS = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
const DAYS_S = ["D","S","T","Q","Q","S","S"];

// ── Saudação dinâmica ───────────────────────────────────────────────────────
function getSaudacao() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}
function getDataAtual() {
  const now = new Date();
  const diaSemana = WEEKDAYS[now.getDay()];
  const dia = now.getDate();
  const mes = MONTHS[now.getMonth()];
  const ano = now.getFullYear();
  return `${diaSemana.charAt(0).toUpperCase()+diaSemana.slice(1)}, ${dia} de ${mes} de ${ano}`;
}

// ── Dados iniciais ──────────────────────────────────────────────────────────
const INIT_USERS = [
  { id:"1", email:"presidente@uel.br", password:"bc2026", name:"Marcos Lima",    initials:"ML", area:"Presidência",         role:"presidente", avatar:null, bio:"Presidente da Business Consultoria UEL" },
  { id:"2", email:"vice@uel.br",       password:"bc2026", name:"Beatriz Sol",    initials:"BS", area:"Presidência",         role:"vice",       avatar:null, bio:"Vice-Presidente" },
  { id:"3", email:"comercial@uel.br",  password:"bc2026", name:"Fernanda Ota",   initials:"FO", area:"Comercial",           role:"diretor",    avatar:null, bio:"Diretora Comercial" },
  { id:"4", email:"gp@uel.br",         password:"bc2026", name:"Julia Rocha",    initials:"JR", area:"Gestão de Pessoas",   role:"diretor",    avatar:null, bio:"Diretora de GP" },
  { id:"5", email:"projetos@uel.br",   password:"bc2026", name:"Rafael Silva",   initials:"RS", area:"Projetos",            role:"diretor",    avatar:null, bio:"Diretor de Projetos" },
  { id:"6", email:"juridico@uel.br",   password:"bc2026", name:"Carlos Melo",    initials:"CM", area:"Jurídico Financeiro", role:"diretor",    avatar:null, bio:"Diretor Jurídico Financeiro" },
  { id:"7", email:"marketing@uel.br",  password:"bc2026", name:"Ana Beatriz",    initials:"AB", area:"Marketing",           role:"diretor",    avatar:null, bio:"Diretora de Marketing" },
  { id:"8", email:"membro1@uel.br",    password:"bc2026", name:"Pedro Lima",     initials:"PL", area:"Marketing",           role:"membro",     avatar:null, bio:"Assessor de Marketing" },
  { id:"9", email:"membro2@uel.br",    password:"bc2026", name:"Camila Souza",   initials:"CS", area:"Comercial",           role:"membro",     avatar:null, bio:"Assessora Comercial" },
  { id:"10",email:"membro3@uel.br",    password:"bc2026", name:"Lucas Ferreira", initials:"LF", area:"Projetos",            role:"membro",     avatar:null, bio:"Assessor de Projetos" },
];

const INIT_DEMANDAS = [
  { id:"d1", titulo:"Apresentação Q2",       prazo:"2026-05-14", status:"urgente",   area:"Marketing",           resp:"Ana B.",      desc:"Preparar slides para reunião de resultados do Q2", anexos:[], prioridade:"alta",  obs:"" },
  { id:"d2", titulo:"Relatório de Captação", prazo:"2026-05-16", status:"andamento", area:"Jurídico Financeiro", resp:"Carlos M.",   desc:"Consolidar dados de captação do semestre",         anexos:[], prioridade:"media", obs:"" },
  { id:"d3", titulo:"Entrevistas PS",        prazo:"2026-05-13", status:"pendente",  area:"Gestão de Pessoas",   resp:"Julia R.",    desc:"Conduzir entrevistas do processo seletivo",         anexos:[], prioridade:"alta",  obs:"" },
  { id:"d4", titulo:"Proposta cliente Alfa", prazo:"2026-05-15", status:"urgente",   area:"Comercial",           resp:"Fernanda O.", desc:"Elaborar proposta comercial para cliente Alfa",     anexos:[], prioridade:"alta",  obs:"" },
  { id:"d5", titulo:"Escopo projeto Beta",   prazo:"2026-05-17", status:"andamento", area:"Projetos",            resp:"Rafael S.",   desc:"Definir escopo e cronograma do projeto Beta",      anexos:[], prioridade:"media", obs:"" },
  { id:"d6", titulo:"Campanha redes",        prazo:"2026-05-22", status:"pendente",  area:"Marketing",           resp:"Pedro L.",    desc:"Criar conteúdo para campanha nas redes sociais",   anexos:[], prioridade:"baixa", obs:"" },
];

const INIT_EVENTOS = [
  { id:"e1", date:"2026-05-13", titulo:"Reunião Geral BC",         hora:"19h00", local:"Online"    },
  { id:"e2", date:"2026-05-15", titulo:"Treinamento de Liderança", hora:"18h30", local:"Sala A"    },
  { id:"e3", date:"2026-05-17", titulo:"Pitch Day",                hora:"14h00", local:"Auditório" },
  { id:"e4", date:"2026-05-20", titulo:"1:1 Presidência",          hora:"17h00", local:"Online"    },
  { id:"e5", date:"2026-06-03", titulo:"Planejamento Semestral",   hora:"09h00", local:"Sala B"    },
  { id:"e6", date:"2026-07-10", titulo:"Confraternização BC",      hora:"19h30", local:"Externo"   },
  { id:"e7", date:"2026-08-05", titulo:"Processo Seletivo",        hora:"14h00", local:"Online"    },
  { id:"e8", date:"2026-09-12", titulo:"Semana de Projetos",       hora:"08h00", local:"Auditório" },
];

const INIT_MATERIAIS = {
  "Comercial":           [{ id:"f1", nome:"Template de Proposta",  tipo:"DOC", tam:"540 KB", url:"#" }],
  "Gestão de Pessoas":   [{ id:"f2", nome:"Manual de Onboarding",  tipo:"PDF", tam:"3.1 MB", url:"#" }],
  "Projetos":            [{ id:"f3", nome:"Metodologia BC",         tipo:"PDF", tam:"4.0 MB", url:"#" }],
  "Jurídico Financeiro": [{ id:"f4", nome:"Planilha de Metas",      tipo:"XLS", tam:"890 KB", url:"#" }],
  "Marketing":           [{ id:"f5", nome:"Kit Visual BC 2026",     tipo:"ZIP", tam:"18 MB",  url:"#" }],
};

const STATUS = {
  urgente:   { label:"Urgente",       color:C.red,   bg:"#FEF2F2" },
  andamento: { label:"Em andamento",  color:C.amber, bg:"#FFFBEB" },
  pendente:  { label:"Pendente",      color:C.blue,  bg:C.blueSoft},
  concluido: { label:"Concluído",     color:C.green, bg:"#ECFDF5" },
};

const PRIORIDADE = {
  alta:  { label:"Alta",  color:C.red   },
  media: { label:"Média", color:C.amber },
  baixa: { label:"Baixa", color:C.green },
};

function canSeeAll(u) { return u.role==="presidente"||u.role==="vice"; }
function canManage(u) { return u.role==="presidente"||u.role==="vice"||u.role==="diretor"; }
function getRoleLabel(r){ return {presidente:"Presidente",vice:"Vice-Presidente",diretor:"Diretor(a)",membro:"Assessor(a)"}[r]||r; }
function daysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function firstDay(y,m)   { return new Date(y,m,1).getDay(); }
function fmtDate(iso)    { const d=new Date(iso+"T00:00:00"); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`; }
function todayIso()      { const n=new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`; }

// ── UI atoms ────────────────────────────────────────────────────────────────
function Pill({ status }) {
  const s=STATUS[status]||STATUS.pendente;
  return <span style={{ fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,color:s.color,background:s.bg,whiteSpace:"nowrap" }}>{s.label}</span>;
}
function Divider({ m=20 }) { return <div style={{ height:1,background:C.border,margin:`0 ${m}px` }}/>; }
function SLabel({ children, action }) {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 20px 10px" }}>
      <span style={{ fontSize:11,fontWeight:700,letterSpacing:1.5,color:C.muted,textTransform:"uppercase" }}>{children}</span>
      {action}
    </div>
  );
}
function FLabel({ children }) {
  return <label style={{ fontSize:11,fontWeight:700,color:C.sub,letterSpacing:0.5,display:"block",marginBottom:5,textTransform:"uppercase" }}>{children}</label>;
}
function Inp({ label, ...props }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label&&<FLabel>{label}</FLabel>}
      <input {...props} style={{ width:"100%",padding:"11px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:14,color:C.text,background:C.bg,fontFamily:"inherit",boxSizing:"border-box",...(props.style||{}) }}/>
    </div>
  );
}
function Sel({ label, children, ...props }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label&&<FLabel>{label}</FLabel>}
      <select {...props} style={{ width:"100%",padding:"11px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:14,color:C.text,background:C.bg,fontFamily:"inherit" }}>{children}</select>
    </div>
  );
}
function Txt({ label, ...props }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label&&<FLabel>{label}</FLabel>}
      <textarea {...props} style={{ width:"100%",padding:"11px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:14,color:C.text,background:C.bg,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box",...(props.style||{}) }}/>
    </div>
  );
}
function Btn({ children, variant="primary", full, small, onClick, style={} }) {
  const base={ padding:small?"7px 14px":"12px 16px",borderRadius:10,border:"none",cursor:"pointer",fontSize:small?13:14,fontWeight:700,fontFamily:"inherit",...style };
  const v={ primary:{background:C.blue,color:C.white}, secondary:{background:C.bg,color:C.sub,border:`1px solid ${C.border}`}, danger:{background:"#FEF2F2",color:C.red,border:`1px solid #FECACA`} };
  return <button onClick={onClick} style={{ ...base,...v[variant],width:full?"100%":"auto" }}>{children}</button>;
}
function Avatar({ user, size=38 }) {
  if (user.avatar) return <img src={user.avatar} alt={user.name} style={{ width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0 }}/>;
  return <div style={{ width:size,height:size,borderRadius:"50%",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.34,fontWeight:700,color:C.white,flexShrink:0 }}>{user.initials}</div>;
}

// ── Icons ───────────────────────────────────────────────────────────────────
const Ic = {
  home:   c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
  check:  c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  cal:    c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  folder: c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  user:   c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  upload: c=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c||C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  down:   c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  chevD:  o=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transform:o?"rotate(180deg)":"none",transition:"transform 0.2s"}}><polyline points="6 9 12 15 18 9"/></svg>,
  chevR:  c=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c||C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  plus:   c=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c||C.white} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:  c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  edit:   c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  lock:   ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  eye:    ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  logout: c=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c||C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  camera: c=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c||C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  clip:   c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>,
  back:   ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  cal2:   c=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c||C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  person: c=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c||C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  flag:   c=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c||C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
};

// ── Login ───────────────────────────────────────────────────────────────────
function LoginScreen({ users, onLogin }) {
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  function handle() {
    if (!email||!pw){setError("Preencha e-mail e senha.");return;}
    if (!email.endsWith("@uel.br")){setError("Use seu e-mail institucional (@uel.br).");return;}
    setError("");setLoading(true);
    setTimeout(()=>{
      const u=users.find(u=>u.email===email.trim().toLowerCase()&&u.password===pw);
      if(u) onLogin(u); else {setError("E-mail ou senha incorretos.");setLoading(false);}
    },600);
  }

  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",background:C.white,padding:"0 28px" }}>
      <div style={{ textAlign:"center",marginBottom:40 }}>
        <div style={{ width:68,height:68,borderRadius:20,background:C.blue,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:18,boxShadow:"0 8px 24px rgba(26,86,219,0.25)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
        </div>
        <div style={{ fontSize:10,fontWeight:700,letterSpacing:3,color:C.blue,textTransform:"uppercase",marginBottom:6 }}>Business Consultoria · UEL</div>
        <div style={{ fontSize:26,fontWeight:700,color:C.text,marginBottom:4 }}>Bem-vindo de volta</div>
        <div style={{ fontSize:13,color:C.sub }}>Entre com seu e-mail institucional</div>
      </div>

      <Inp label="E-mail institucional" type="email" placeholder="seu.nome@uel.br" value={email}
        onChange={e=>{setEmail(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&handle()}
        style={{ borderColor:error?C.red:C.border }}/>
      <div style={{ marginBottom:error?8:20 }}>
        <FLabel>Senha</FLabel>
        <div style={{ position:"relative" }}>
          <input type={showPw?"text":"password"} placeholder="••••••••" value={pw}
            onChange={e=>{setPw(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&handle()}
            style={{ width:"100%",padding:"11px 42px 11px 12px",borderRadius:9,border:`1.5px solid ${error?C.red:C.border}`,fontSize:14,color:C.text,background:C.bg,fontFamily:"inherit",boxSizing:"border-box" }}/>
          <button onClick={()=>setShowPw(v=>!v)} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:0,display:"flex" }}>
            {showPw?Ic.eyeOff():Ic.eye()}
          </button>
        </div>
      </div>
      {error&&<div style={{ fontSize:13,color:C.red,marginBottom:14,fontWeight:500 }}>{error}</div>}
      <Btn full onClick={handle} style={{ opacity:loading?0.7:1 }}>{loading?"Entrando...":"Entrar"}</Btn>
    </div>
  );
}

// ── Perfil ──────────────────────────────────────────────────────────────────
function ProfileScreen({ user, onUpdate, onLogout, onBack }) {
  const [name,setName]=useState(user.name);
  const [bio,setBio]=useState(user.bio||"");
  const [pw,setPw]=useState("");
  const [pw2,setPw2]=useState("");
  const [saved,setSaved]=useState(false);
  const [pwErr,setPwErr]=useState("");
  const fileRef=useRef();

  function handleAvatar(e){
    const file=e.target.files[0]; if(!file) return;
    const r=new FileReader();
    r.onload=ev=>onUpdate({avatar:ev.target.result});
    r.readAsDataURL(file);
  }
  function handleSave(){
    if(pw&&pw!==pw2){setPwErr("As senhas não coincidem.");return;}
    setPwErr("");
    const u={name,bio};
    if(name.split(" ").length>=2) u.initials=name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
    if(pw) u.password=pw;
    onUpdate(u); setPw(""); setPw2("");
    setSaved(true); setTimeout(()=>setSaved(false),2500);
  }

  return (
    <div style={{ minHeight:"100vh",background:C.bg }}>
      <div style={{ background:C.white,borderBottom:`1px solid ${C.border}`,padding:"14px 20px",display:"flex",alignItems:"center",gap:12 }}>
        <button onClick={onBack} style={{ background:"none",border:"none",cursor:"pointer",padding:4,display:"flex" }}>{Ic.back()}</button>
        <span style={{ fontSize:17,fontWeight:700 }}>Meu Perfil</span>
      </div>
      <div style={{ background:C.blue,padding:"32px 20px 52px",textAlign:"center",position:"relative" }}>
        <div style={{ position:"relative",display:"inline-block" }}>
          <Avatar user={user} size={88}/>
          <button onClick={()=>fileRef.current.click()} style={{ position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:"rgba(0,0,0,0.45)",border:"2px solid white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            {Ic.camera()}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatar}/>
        </div>
        <div style={{ color:C.white,fontWeight:700,fontSize:18,marginTop:12 }}>{user.name}</div>
        <div style={{ color:"rgba(255,255,255,0.7)",fontSize:13,marginTop:4 }}>{getRoleLabel(user.role)} · {user.area}</div>
      </div>
      <div style={{ margin:"-22px 16px 0",background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:20,position:"relative",zIndex:1 }}>
        <div style={{ fontSize:11,fontWeight:700,color:C.blue,marginBottom:14,textTransform:"uppercase",letterSpacing:1 }}>Informações pessoais</div>
        <Inp label="Nome completo" value={name} onChange={e=>setName(e.target.value)}/>
        <div style={{ marginBottom:12 }}>
          <FLabel>E-mail</FLabel>
          <div style={{ padding:"11px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:14,color:C.muted,background:"#f9fafb" }}>{user.email}</div>
        </div>
        <Txt label="Bio" value={bio} rows={3} onChange={e=>setBio(e.target.value)}/>
        <div style={{ fontSize:11,fontWeight:700,color:C.blue,margin:"4px 0 14px",textTransform:"uppercase",letterSpacing:1 }}>Alterar senha</div>
        <Inp label="Nova senha" type="password" placeholder="Deixe em branco para manter" value={pw} onChange={e=>{setPw(e.target.value);setPwErr("");}}/>
        <Inp label="Confirmar nova senha" type="password" placeholder="Repita a nova senha" value={pw2} onChange={e=>{setPw2(e.target.value);setPwErr("");}}/>
        {pwErr&&<div style={{ fontSize:12,color:C.red,marginBottom:10 }}>{pwErr}</div>}
        {saved&&<div style={{ fontSize:13,color:C.green,fontWeight:600,marginBottom:10,textAlign:"center" }}>✓ Perfil atualizado!</div>}
        <Btn full onClick={handleSave}>Salvar alterações</Btn>
        <div style={{ marginTop:12 }}><Btn full variant="danger" onClick={onLogout}>Sair da conta</Btn></div>
      </div>
      <div style={{ height:32 }}/>
    </div>
  );
}

// ── Detalhe da demanda ──────────────────────────────────────────────────────
function DemandaDetail({ demanda, canEdit, onUpdate, onDelete, onBack, anexoRef }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...demanda });

  function save() {
    onUpdate(form);
    setEditing(false);
  }

  return (
    <div style={{ minHeight:"100vh",background:C.bg }}>
      <div style={{ background:C.white,borderBottom:`1px solid ${C.border}`,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <button onClick={onBack} style={{ background:"none",border:"none",cursor:"pointer",padding:4,display:"flex" }}>{Ic.back()}</button>
          <span style={{ fontSize:17,fontWeight:700 }}>Demanda</span>
        </div>
        {canEdit&&!editing&&(
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={()=>setEditing(true)} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>{Ic.edit()}</button>
            <button onClick={onDelete} style={{ width:32,height:32,borderRadius:8,border:"none",background:"#FEF2F2",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>{Ic.trash()}</button>
          </div>
        )}
      </div>

      <div style={{ padding:"16px 20px" }}>
        {editing ? (
          <div style={{ background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:16 }}>
            <div style={{ fontSize:13,fontWeight:700,color:C.blue,marginBottom:14 }}>Editar demanda</div>
            <Inp label="Título" value={form.titulo} onChange={e=>setForm(v=>({...v,titulo:e.target.value}))}/>
            <Inp label="Responsável" value={form.resp} onChange={e=>setForm(v=>({...v,resp:e.target.value}))}/>
            <Inp label="Prazo" type="date" value={form.prazo} onChange={e=>setForm(v=>({...v,prazo:e.target.value}))}/>
            <Sel label="Status" value={form.status} onChange={e=>setForm(v=>({...v,status:e.target.value}))}>
              {Object.entries(STATUS).map(([k,s])=><option key={k} value={k}>{s.label}</option>)}
            </Sel>
            <Sel label="Prioridade" value={form.prioridade} onChange={e=>setForm(v=>({...v,prioridade:e.target.value}))}>
              {Object.entries(PRIORIDADE).map(([k,p])=><option key={k} value={k}>{p.label}</option>)}
            </Sel>
            <Txt label="Descrição" value={form.desc} rows={4} onChange={e=>setForm(v=>({...v,desc:e.target.value}))}/>
            <Txt label="Observações" value={form.obs} rows={3} onChange={e=>setForm(v=>({...v,obs:e.target.value}))} placeholder="Observações adicionais..."/>
            <div style={{ display:"flex",gap:8 }}>
              <Btn onClick={save} style={{ flex:1 }}>Salvar</Btn>
              <Btn variant="secondary" onClick={()=>setEditing(false)} style={{ flex:1 }}>Cancelar</Btn>
            </div>
          </div>
        ) : (
          <>
            {/* Header card */}
            <div style={{ background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:16,marginBottom:12 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:12 }}>
                <div style={{ fontSize:18,fontWeight:700,flex:1 }}>{demanda.titulo}</div>
                <Pill status={demanda.status}/>
              </div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:12 }}>
                <span style={{ fontSize:12,color:C.sub,display:"flex",alignItems:"center",gap:4 }}>{Ic.person()}{demanda.resp||"—"}</span>
                <span style={{ fontSize:12,color:C.sub,display:"flex",alignItems:"center",gap:4 }}>{Ic.cal2()}{fmtDate(demanda.prazo)}</span>
                <span style={{ fontSize:12,display:"flex",alignItems:"center",gap:4,color:PRIORIDADE[demanda.prioridade]?.color||C.muted,fontWeight:600 }}>
                  {Ic.flag(PRIORIDADE[demanda.prioridade]?.color)} Prioridade {PRIORIDADE[demanda.prioridade]?.label}
                </span>
              </div>
            </div>

            {/* Descrição */}
            {demanda.desc&&(
              <div style={{ background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:16,marginBottom:12 }}>
                <div style={{ fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8 }}>Descrição</div>
                <div style={{ fontSize:14,color:C.text,lineHeight:1.6 }}>{demanda.desc}</div>
              </div>
            )}

            {/* Observações */}
            {demanda.obs&&(
              <div style={{ background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:16,marginBottom:12 }}>
                <div style={{ fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8 }}>Observações</div>
                <div style={{ fontSize:14,color:C.text,lineHeight:1.6 }}>{demanda.obs}</div>
              </div>
            )}

            {/* Anexos */}
            <div style={{ background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:16,marginBottom:12 }}>
              <div style={{ fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12 }}>Anexos</div>
              {demanda.anexos&&demanda.anexos.length>0 ? demanda.anexos.map((a,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<demanda.anexos.length-1?`1px solid ${C.border}`:"none" }}>
                  <div style={{ width:32,height:32,borderRadius:7,background:C.blueSoft,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <span style={{ fontSize:9,fontWeight:800,color:C.blue }}>{a.tipo}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,fontWeight:600 }}>{a.nome}</div>
                    <div style={{ fontSize:11,color:C.muted }}>{a.tam}</div>
                  </div>
                </div>
              )) : (
                <div style={{ fontSize:13,color:C.muted,textAlign:"center",padding:"8px 0" }}>Nenhum anexo</div>
              )}
              {canEdit&&(
                <button onClick={()=>anexoRef.current&&(anexoRef.current.dataset.did=demanda.id)&&anexoRef.current.click()}
                  style={{ marginTop:demanda.anexos?.length?12:0,width:"100%",padding:"9px",borderRadius:9,border:`1.5px dashed ${C.blue}`,background:C.blueSoft,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:C.blue,fontWeight:600,fontSize:13 }}>
                  {Ic.clip(C.blue)} Anexar arquivo
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Calendário completo ─────────────────────────────────────────────────────
function FullCalendar({ eventos, canManage, onAdd }) {
  const year=2026;
  const [form,setForm]=useState(false);
  const [novo,setNovo]=useState({ titulo:"",date:"",hora:"",local:"" });
  const eventMap={};
  eventos.forEach(ev=>{eventMap[ev.date]=ev;});

  function add(){
    if(!novo.titulo||!novo.date)return;
    onAdd({...novo,id:"e"+Date.now()});
    setNovo({titulo:"",date:"",hora:"",local:""});
    setForm(false);
  }

  return (
    <div>
      <SLabel action={canManage&&(
        <button onClick={()=>setForm(v=>!v)} style={{ width:28,height:28,borderRadius:8,background:C.blue,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>{Ic.plus()}</button>
      )}>Calendário 2026</SLabel>

      {form&&(
        <div style={{ margin:"0 20px 16px",background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:16 }}>
          <div style={{ fontSize:13,fontWeight:700,color:C.blue,marginBottom:12 }}>Novo evento</div>
          <Inp label="Título" value={novo.titulo} onChange={e=>setNovo(v=>({...v,titulo:e.target.value}))}/>
          <Inp label="Data" type="date" value={novo.date} onChange={e=>setNovo(v=>({...v,date:e.target.value}))}/>
          <Inp label="Horário" placeholder="ex: 19h00" value={novo.hora} onChange={e=>setNovo(v=>({...v,hora:e.target.value}))}/>
          <Inp label="Local" placeholder="ex: Online, Sala A..." value={novo.local} onChange={e=>setNovo(v=>({...v,local:e.target.value}))}/>
          <div style={{ display:"flex",gap:8 }}>
            <Btn onClick={add} style={{ flex:1 }}>Adicionar</Btn>
            <Btn variant="secondary" onClick={()=>setForm(false)} style={{ flex:1 }}>Cancelar</Btn>
          </div>
        </div>
      )}

      {MONTHS.map((mName,mi)=>{
        const days=daysInMonth(year,mi);
        const off=firstDay(year,mi);
        const mEvts=eventos.filter(e=>{ const d=new Date(e.date+"T00:00:00"); return d.getFullYear()===year&&d.getMonth()===mi; });
        return (
          <div key={mi} style={{ margin:"0 20px 20px",background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 12px" }}>
            <div style={{ fontSize:13,fontWeight:700,marginBottom:12,paddingLeft:2 }}>{mName}</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",textAlign:"center",gap:1 }}>
              {DAYS_S.map((d,i)=><div key={i} style={{ fontSize:9,fontWeight:700,color:C.muted,paddingBottom:6 }}>{d}</div>)}
              {Array.from({length:off}).map((_,i)=><div key={`e${i}`}/>)}
              {Array.from({length:days},(_,i)=>{
                const day=i+1;
                const iso=`${year}-${String(mi+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const has=!!eventMap[iso];
                const isT=iso===todayIso();
                return (
                  <div key={day} style={{ width:28,height:28,margin:"0 auto",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,position:"relative",background:isT?C.blue:"transparent",color:isT?C.white:has?C.blue:C.text,fontWeight:isT||has?700:400 }}>
                    {day}
                    {has&&!isT&&<div style={{ position:"absolute",bottom:2,width:3,height:3,borderRadius:"50%",background:C.blue }}/>}
                  </div>
                );
              })}
            </div>
            {mEvts.length>0&&(
              <div style={{ marginTop:10,borderTop:`1px solid ${C.border}`,paddingTop:10 }}>
                {mEvts.map((ev,i)=>(
                  <div key={ev.id}>
                    <div style={{ display:"flex",gap:10,alignItems:"center",padding:"6px 2px" }}>
                      <div style={{ minWidth:28,height:28,borderRadius:7,background:C.blueSoft,display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <span style={{ fontSize:11,fontWeight:800,color:C.blue }}>{new Date(ev.date+"T00:00:00").getDate()}</span>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13,fontWeight:600 }}>{ev.titulo}</div>
                        <div style={{ fontSize:11,color:C.sub }}>{ev.hora}{ev.local&&` · ${ev.local}`}</div>
                      </div>
                    </div>
                    {i<mEvts.length-1&&<Divider m={0}/>}
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

// ── App principal ───────────────────────────────────────────────────────────
export default function BCApp() {
  const [users,    setUsers]    = useState(INIT_USERS);
  const [demandas, setDemandas] = useState(INIT_DEMANDAS);
  const [eventos,  setEventos]  = useState(INIT_EVENTOS);
  const [materiais,setMateriais]= useState(INIT_MATERIAIS);
  const [user,     setUser]     = useState(null);
  const [tab,      setTab]      = useState("inicio");
  const [screen,   setScreen]   = useState("app"); // app | profile | demanda
  const [openFolder,setFolder]  = useState(null);
  const [selectedD, setSelectedD] = useState(null);

  // forms
  const [dForm,setDForm]=useState(false);
  const [dNovo,setDNovo]=useState({ titulo:"",resp:"",prazo:"",area:"",status:"pendente",prioridade:"media",desc:"",obs:"",anexos:[] });

  const uploadRef  = useRef();
  const anexoRef   = useRef();
  const [uploadArea,setUploadArea]=useState(null);

  if (!user) return <LoginScreen users={users} onLogin={u=>{setUser(u);setTab("inicio");setScreen("app");}}/>;

  if (screen==="profile") return (
    <ProfileScreen user={user}
      onUpdate={u=>{ const nu={...user,...u}; setUser(nu); setUsers(prev=>prev.map(x=>x.id===nu.id?nu:x)); }}
      onLogout={()=>{setUser(null);setScreen("app");}}
      onBack={()=>setScreen("app")}
    />
  );

  if (screen==="demanda"&&selectedD) {
    const d = demandas.find(x=>x.id===selectedD);
    if (d) return (
      <DemandaDetail
        demanda={d}
        canEdit={canManage(user)}
        onUpdate={updated=>setDemandas(prev=>prev.map(x=>x.id===updated.id?updated:x))}
        onDelete={()=>{setDemandas(prev=>prev.filter(x=>x.id!==d.id));setScreen("app");setSelectedD(null);}}
        onBack={()=>{setScreen("app");setSelectedD(null);}}
        anexoRef={anexoRef}
      />
    );
  }

  const myDemandas  = canSeeAll(user) ? demandas : demandas.filter(d=>d.area===user.area);
  const urgentes    = myDemandas.filter(d=>d.status==="urgente"||d.status==="pendente");
  const nextEventos = eventos.filter(e=>e.date>=todayIso()).sort((a,b)=>a.date.localeCompare(b.date));

  const TABS = [
    { id:"inicio",     label:"Início",   icon:Ic.home   },
    { id:"demandas",   label:"Demandas", icon:Ic.check  },
    { id:"calendario", label:"Agenda",   icon:Ic.cal    },
    { id:"materiais",  label:"Materiais",icon:Ic.folder },
  ];
  const TAB_LABEL={ inicio:"Painel",demandas:"Demandas",calendario:"Agenda",materiais:"Materiais" };

  function addDemanda(){
    if(!dNovo.titulo||!dNovo.prazo)return;
    const area=canSeeAll(user)?dNovo.area||AREAS[0]:user.area;
    setDemandas(prev=>[...prev,{...dNovo,id:"d"+Date.now(),area,criadoPor:user.id}]);
    setDNovo({titulo:"",resp:"",prazo:"",area:"",status:"pendente",prioridade:"media",desc:"",obs:"",anexos:[]});
    setDForm(false);
  }

  function handleUpload(e){
    const file=e.target.files[0]; if(!file||!uploadArea)return;
    const ext=file.name.split(".").pop().toUpperCase();
    const tam=file.size>1024*1024?`${(file.size/1024/1024).toFixed(1)} MB`:`${Math.round(file.size/1024)} KB`;
    setMateriais(prev=>({...prev,[uploadArea]:[...(prev[uploadArea]||[]),{id:"f"+Date.now(),nome:file.name,tipo:ext,tam,url:"#"}]}));
    setUploadArea(null); e.target.value="";
  }

  function handleAnexo(e){
    const file=e.target.files[0]; const did=e.target.dataset.did; if(!file||!did)return;
    const ext=file.name.split(".").pop().toUpperCase();
    const tam=file.size>1024*1024?`${(file.size/1024/1024).toFixed(1)} MB`:`${Math.round(file.size/1024)} KB`;
    setDemandas(prev=>prev.map(d=>d.id===did?{...d,anexos:[...(d.anexos||[]),{nome:file.name,tipo:ext,tam}]}:d));
    e.target.value="";
  }

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;} input::placeholder,textarea::placeholder{color:#9CA3AF;} input:focus,textarea:focus,select:focus{outline:none;border-color:${C.blue}!important;} button{font-family:inherit;} ::-webkit-scrollbar{display:none;} select{font-family:inherit;}`}</style>

      {/* hidden inputs */}
      <input ref={uploadRef} type="file" style={{ display:"none" }} onChange={handleUpload}/>
      <input ref={anexoRef}  type="file" style={{ display:"none" }} onChange={handleAnexo}/>

      {/* Header */}
      <div style={{ position:"sticky",top:0,zIndex:40,background:C.white,borderBottom:`1px solid ${C.border}`,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div>
          <div style={{ fontSize:10,fontWeight:700,letterSpacing:2.5,color:C.blue,textTransform:"uppercase" }}>Business Consultoria · UEL</div>
          <div style={{ fontSize:19,fontWeight:700,marginTop:1 }}>{TAB_LABEL[tab]}</div>
        </div>
        <button onClick={()=>setScreen("profile")} style={{ background:"none",border:"none",cursor:"pointer",padding:0 }}>
          <Avatar user={user} size={38}/>
        </button>
      </div>

      {/* Body */}
      <div style={{ paddingBottom:88 }}>

        {/* ══ INÍCIO ══ */}
        {tab==="inicio"&&(<>
          <div style={{ margin:"16px 20px 0",background:C.blue,borderRadius:16,padding:"22px 20px",color:C.white,position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",right:-30,top:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.07)" }}/>
            <div style={{ position:"absolute",right:20,bottom:-40,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.05)" }}/>
            <div style={{ fontSize:12,opacity:0.65,marginBottom:4 }}>{getDataAtual()}</div>
            <div style={{ fontSize:22,fontWeight:700 }}>{getSaudacao()}, {user.name.split(" ")[0]} ✦</div>
            <div style={{ fontSize:12,opacity:0.65,marginTop:4 }}>{user.area} · {getRoleLabel(user.role)}</div>
          </div>

          {nextEventos.length>0&&(<>
            <SLabel>Próximos eventos</SLabel>
            {nextEventos.slice(0,2).map((ev,i)=>(
              <div key={ev.id}>
                <div style={{ padding:"12px 20px",display:"flex",gap:14,alignItems:"center" }}>
                  <div style={{ minWidth:46,height:46,borderRadius:12,background:C.blueSoft,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
                    <span style={{ fontSize:16,fontWeight:800,color:C.blue,lineHeight:1 }}>{new Date(ev.date+"T00:00:00").getDate()}</span>
                    <span style={{ fontSize:9,fontWeight:700,color:C.blue,opacity:0.6,textTransform:"uppercase" }}>{MONTHS[new Date(ev.date+"T00:00:00").getMonth()].slice(0,3)}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:14,fontWeight:600 }}>{ev.titulo}</div>
                    <div style={{ fontSize:12,color:C.sub,marginTop:2 }}>{ev.hora}{ev.local&&` · ${ev.local}`}</div>
                  </div>
                </div>
                {i<1&&<Divider/>}
              </div>
            ))}
          </>)}

          {urgentes.length>0&&(<>
            <SLabel>Suas demandas prioritárias</SLabel>
            {urgentes.slice(0,2).map((d,i)=>(
              <div key={d.id}>
                <div onClick={()=>{setSelectedD(d.id);setScreen("demanda");}} style={{ padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,cursor:"pointer" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14,fontWeight:600 }}>{d.titulo}</div>
                    <div style={{ fontSize:12,color:C.sub,marginTop:2 }}>Prazo {fmtDate(d.prazo)}</div>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <Pill status={d.status}/>
                    {Ic.chevR()}
                  </div>
                </div>
                {i<urgentes.slice(0,2).length-1&&<Divider/>}
              </div>
            ))}
          </>)}
        </>)}

        {/* ══ DEMANDAS ══ */}
        {tab==="demandas"&&(<>
          <div style={{ padding:"14px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            {canSeeAll(user)
              ? <div style={{ fontSize:12,color:C.blue,fontWeight:600,background:C.blueSoft,borderRadius:99,padding:"5px 14px" }}>Todas as áreas</div>
              : <div style={{ fontSize:12,color:C.sub,background:C.white,border:`1px solid ${C.border}`,borderRadius:99,padding:"5px 14px",display:"flex",alignItems:"center",gap:5 }}>{Ic.lock()} {user.area}</div>
            }
            {canManage(user)&&(
              <button onClick={()=>setDForm(v=>!v)} style={{ width:32,height:32,borderRadius:9,background:C.blue,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                {Ic.plus()}
              </button>
            )}
          </div>

          {dForm&&canManage(user)&&(
            <div style={{ margin:"12px 20px 0",background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:16 }}>
              <div style={{ fontSize:13,fontWeight:700,color:C.blue,marginBottom:12 }}>Nova demanda</div>
              <Inp label="Título" value={dNovo.titulo} onChange={e=>setDNovo(v=>({...v,titulo:e.target.value}))}/>
              <Inp label="Responsável" value={dNovo.resp} onChange={e=>setDNovo(v=>({...v,resp:e.target.value}))}/>
              <Inp label="Prazo" type="date" value={dNovo.prazo} onChange={e=>setDNovo(v=>({...v,prazo:e.target.value}))}/>
              <Sel label="Prioridade" value={dNovo.prioridade} onChange={e=>setDNovo(v=>({...v,prioridade:e.target.value}))}>
                {Object.entries(PRIORIDADE).map(([k,p])=><option key={k} value={k}>{p.label}</option>)}
              </Sel>
              <Txt label="Descrição" value={dNovo.desc} rows={3} onChange={e=>setDNovo(v=>({...v,desc:e.target.value}))} placeholder="Descreva o que precisa ser feito..."/>
              <Txt label="Observações" value={dNovo.obs} rows={2} onChange={e=>setDNovo(v=>({...v,obs:e.target.value}))} placeholder="Observações adicionais..."/>
              {canSeeAll(user)&&(
                <Sel label="Área" value={dNovo.area||AREAS[0]} onChange={e=>setDNovo(v=>({...v,area:e.target.value}))}>
                  {AREAS.map(a=><option key={a}>{a}</option>)}
                </Sel>
              )}
              <div style={{ display:"flex",gap:8 }}>
                <Btn onClick={addDemanda} style={{ flex:1 }}>Criar</Btn>
                <Btn variant="secondary" onClick={()=>setDForm(false)} style={{ flex:1 }}>Cancelar</Btn>
              </div>
            </div>
          )}

          <div style={{ height:8 }}/>
          {myDemandas.length===0&&<div style={{ padding:"32px 20px",textAlign:"center",color:C.muted,fontSize:14 }}>Nenhuma demanda ainda.</div>}
          {myDemandas.map((d,i)=>(
            <div key={d.id}>
              <div onClick={()=>{setSelectedD(d.id);setScreen("demanda");}} style={{ padding:"13px 20px",cursor:"pointer" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14,fontWeight:600 }}>{d.titulo}</div>
                    {d.desc&&<div style={{ fontSize:12,color:C.sub,marginTop:2,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>{d.desc}</div>}
                    <div style={{ display:"flex",gap:10,marginTop:5,flexWrap:"wrap" }}>
                      <span style={{ fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:3 }}>{Ic.person()}{d.resp||"—"}</span>
                      <span style={{ fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:3 }}>{Ic.cal2()}{fmtDate(d.prazo)}</span>
                      {canSeeAll(user)&&<span style={{ fontSize:11,color:C.blue,fontWeight:500 }}>{d.area}</span>}
                      {d.anexos?.length>0&&<span style={{ fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:3 }}>{Ic.clip()}{d.anexos.length} anexo{d.anexos.length>1?"s":""}</span>}
                    </div>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6 }}>
                    <Pill status={d.status}/>
                    <span style={{ fontSize:11,color:PRIORIDADE[d.prioridade]?.color||C.muted,fontWeight:600 }}>{PRIORIDADE[d.prioridade]?.label}</span>
                  </div>
                </div>
              </div>
              {i<myDemandas.length-1&&<Divider/>}
            </div>
          ))}
        </>)}

        {/* ══ CALENDÁRIO ══ */}
        {tab==="calendario"&&(
          <FullCalendar eventos={eventos} canManage={canManage(user)}
            onAdd={ev=>setEventos(prev=>[...prev,ev].sort((a,b)=>a.date.localeCompare(b.date)))}
          />
        )}

        {/* ══ MATERIAIS ══ */}
        {tab==="materiais"&&(<>
          <SLabel>Pastas por área</SLabel>
          {AREAS.map((area,ai)=>{
            const isOpen=openFolder===area;
            const files=materiais[area]||[];
            const canUp=canManage(user)&&(canSeeAll(user)||user.area===area);
            return (
              <div key={area}>
                <button onClick={()=>setFolder(isOpen?null:area)}
                  style={{ width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 20px",background:"none",border:"none",cursor:"pointer",textAlign:"left" }}>
                  <div style={{ width:40,height:40,borderRadius:10,background:isOpen?C.blue:C.blueSoft,display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s" }}>
                    {Ic.folder(isOpen?C.white:C.blue)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14,fontWeight:600,color:C.text }}>{area}</div>
                    <div style={{ fontSize:12,color:C.sub,marginTop:1 }}>{files.length} arquivo{files.length!==1?"s":""}</div>
                  </div>
                  {Ic.chevD(isOpen)}
                </button>
                {isOpen&&(
                  <div style={{ margin:"0 20px 6px" }}>
                    {canUp&&(
                      <button onClick={()=>{setUploadArea(area);setTimeout(()=>uploadRef.current.click(),50);}}
                        style={{ width:"100%",padding:"10px 14px",marginBottom:8,borderRadius:10,border:`1.5px dashed ${C.blue}`,background:C.blueSoft,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:C.blue,fontWeight:600,fontSize:13 }}>
                        {Ic.upload(C.blue)} Fazer upload de arquivo
                      </button>
                    )}
                    {files.length>0&&(
                      <div style={{ background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden" }}>
                        {files.map((f,fi)=>(
                          <div key={f.id}>
                            <div style={{ padding:"11px 14px",display:"flex",alignItems:"center",gap:12 }}>
                              <div style={{ minWidth:36,height:36,borderRadius:8,background:C.blueSoft,display:"flex",alignItems:"center",justifyContent:"center" }}>
                                <span style={{ fontSize:9,fontWeight:800,color:C.blue,letterSpacing:0.5 }}>{f.tipo}</span>
                              </div>
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:13,fontWeight:600 }}>{f.nome}</div>
                                <div style={{ fontSize:11,color:C.muted,marginTop:1 }}>{f.tam}</div>
                              </div>
                              <div style={{ display:"flex",gap:6 }}>
                                <button style={{ width:30,height:30,borderRadius:7,border:`1px solid ${C.border}`,background:C.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                                  {Ic.down()}
                                </button>
                                {canUp&&(
                                  <button onClick={()=>setMateriais(prev=>({...prev,[area]:prev[area].filter(x=>x.id!==f.id)}))}
                                    style={{ width:30,height:30,borderRadius:7,border:"none",background:"#FEF2F2",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                                    {Ic.trash()}
                                  </button>
                                )}
                              </div>
                            </div>
                            {fi<files.length-1&&<Divider m={14}/>}
                          </div>
                        ))}
                      </div>
                    )}
                    {files.length===0&&!canUp&&<div style={{ textAlign:"center",padding:"16px",color:C.muted,fontSize:13 }}>Nenhum arquivo nesta pasta.</div>}
                  </div>
                )}
                {ai<AREAS.length-1&&!isOpen&&<Divider/>}
              </div>
            );
          })}
          <div style={{ padding:"16px 20px",textAlign:"center" }}>
            <span style={{ fontSize:12,color:C.muted }}>Drive continua como backup automático</span>
          </div>
        </>)}
      </div>

      {/* Bottom Nav */}
      <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,zIndex:50,background:C.white,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-around",padding:"10px 0 20px" }}>
        {TABS.map(t=>{
          const active=tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",padding:"4px 12px" }}>
              {t.icon(active?C.blue:C.muted)}
              <span style={{ fontSize:10,fontWeight:700,color:active?C.blue:C.muted,letterSpacing:0.3 }}>{t.label}</span>
              {active&&<div style={{ width:4,height:4,borderRadius:"50%",background:C.blue }}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
