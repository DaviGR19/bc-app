import { useState, useRef } from "react";

// ─── Palette ────────────────────────────────────────────────────────────────
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

// ─── Constants ───────────────────────────────────────────────────────────────
const AREAS = ["Comercial","Gestão de Pessoas","Projetos","Jurídico Financeiro","Marketing"];
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DAYS_S = ["D","S","T","Q","Q","S","S"];

// ─── Initial data ─────────────────────────────────────────────────────────────
const INIT_USERS = [
  { id:"1", email:"presidente@uel.br",   password:"bc2026", name:"Marcos Lima",    initials:"ML", area:"Presidência",          role:"presidente", avatar:null, bio:"Presidente da Business Consultoria UEL" },
  { id:"2", email:"vice@uel.br",         password:"bc2026", name:"Beatriz Sol",    initials:"BS", area:"Presidência",          role:"vice",       avatar:null, bio:"Vice-Presidente" },
  { id:"3", email:"comercial@uel.br",    password:"bc2026", name:"Fernanda Ota",   initials:"FO", area:"Comercial",            role:"diretor",    avatar:null, bio:"Diretora Comercial" },
  { id:"4", email:"gp@uel.br",           password:"bc2026", name:"Julia Rocha",    initials:"JR", area:"Gestão de Pessoas",    role:"diretor",    avatar:null, bio:"Diretora de GP" },
  { id:"5", email:"projetos@uel.br",     password:"bc2026", name:"Rafael Silva",   initials:"RS", area:"Projetos",             role:"diretor",    avatar:null, bio:"Diretor de Projetos" },
  { id:"6", email:"juridico@uel.br",     password:"bc2026", name:"Carlos Melo",    initials:"CM", area:"Jurídico Financeiro",  role:"diretor",    avatar:null, bio:"Diretor Jurídico Financeiro" },
  { id:"7", email:"marketing@uel.br",    password:"bc2026", name:"Ana Beatriz",    initials:"AB", area:"Marketing",            role:"diretor",    avatar:null, bio:"Diretora de Marketing" },
  { id:"8", email:"membro1@uel.br",      password:"bc2026", name:"Pedro Lima",     initials:"PL", area:"Marketing",            role:"membro",     avatar:null, bio:"Assessor de Marketing" },
  { id:"9", email:"membro2@uel.br",      password:"bc2026", name:"Camila Souza",   initials:"CS", area:"Comercial",            role:"membro",     avatar:null, bio:"Assessora Comercial" },
  { id:"10",email:"membro3@uel.br",      password:"bc2026", name:"Lucas Ferreira", initials:"LF", area:"Projetos",             role:"membro",     avatar:null, bio:"Assessor de Projetos" },
];

const INIT_DEMANDAS = [
  { id:"d1", titulo:"Apresentação Q2",       prazo:"2026-05-14", status:"urgente",   area:"Marketing",           resp:"Ana B.",     criadoPor:"7", desc:"Preparar slides para reunião de resultados do Q2" },
  { id:"d2", titulo:"Relatório de Captação", prazo:"2026-05-16", status:"andamento", area:"Jurídico Financeiro", resp:"Carlos M.",  criadoPor:"6", desc:"Consolidar dados de captação do semestre" },
  { id:"d3", titulo:"Entrevistas PS",        prazo:"2026-05-13", status:"pendente",  area:"Gestão de Pessoas",   resp:"Julia R.",   criadoPor:"4", desc:"Conduzir entrevistas do processo seletivo" },
  { id:"d4", titulo:"Proposta cliente Alfa", prazo:"2026-05-15", status:"urgente",   area:"Comercial",           resp:"Fernanda O.",criadoPor:"3", desc:"Elaborar proposta comercial para cliente Alfa" },
  { id:"d5", titulo:"Escopo projeto Beta",   prazo:"2026-05-17", status:"andamento", area:"Projetos",            resp:"Rafael S.",  criadoPor:"5", desc:"Definir escopo e cronograma do projeto Beta" },
  { id:"d6", titulo:"Campanha redes",        prazo:"2026-05-22", status:"pendente",  area:"Marketing",           resp:"Pedro L.",   criadoPor:"7", desc:"Criar conteúdo para campanha nas redes sociais" },
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

const INIT_AVISOS = [
  { id:"a1", titulo:"Reunião de diretoria na sexta-feira às 18h",     tempo:"1h atrás", tag:"Diretoria",    autor:"Presidência" },
  { id:"a2", titulo:"Prazo final para entrega dos relatórios: 20/05", tempo:"3h atrás", tag:"Urgente",      autor:"Presidência" },
  { id:"a3", titulo:"BC fecha parceria com startup de EdTech",        tempo:"5h atrás", tag:"Parceria",     autor:"Comercial"   },
  { id:"a4", titulo:"Novo processo seletivo — vagas abertas",         tempo:"1d atrás", tag:"Institucional",autor:"GP"          },
];

const INIT_MATERIAIS = {
  "Comercial":           [{ id:"f1", nome:"Template de Proposta", tipo:"DOC", tam:"540 KB", url:"#" }],
  "Gestão de Pessoas":   [{ id:"f2", nome:"Manual de Onboarding", tipo:"PDF", tam:"3.1 MB", url:"#" }],
  "Projetos":            [{ id:"f3", nome:"Metodologia BC",       tipo:"PDF", tam:"4.0 MB", url:"#" }],
  "Jurídico Financeiro": [{ id:"f4", nome:"Planilha de Metas",    tipo:"XLS", tam:"890 KB", url:"#" }],
  "Marketing":           [{ id:"f5", nome:"Kit Visual BC 2026",   tipo:"ZIP", tam:"18 MB",  url:"#" }],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS = {
  urgente:   { label:"Urgente",       color:C.red,   bg:"#FEF2F2" },
  andamento: { label:"Em andamento",  color:C.amber, bg:"#FFFBEB" },
  pendente:  { label:"Pendente",      color:C.blue,  bg:C.blueSoft},
  concluido: { label:"Concluído",     color:C.green, bg:"#ECFDF5" },
};

function canSeeAll(u)    { return u.role==="presidente"||u.role==="vice"; }
function canManage(u)    { return u.role==="presidente"||u.role==="vice"||u.role==="diretor"; }
function getRoleLabel(r) { return {presidente:"Presidente",vice:"Vice-Presidente",diretor:"Diretor(a)",membro:"Assessor(a)"}[r]||r; }
function daysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function firstDay(y,m)   { return new Date(y,m,1).getDay(); }
function fmtDate(iso)    { const d=new Date(iso+"T00:00:00"); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`; }
function today()         { return "2026-05-11"; }

// ─── Tiny UI components ──────────────────────────────────────────────────────
function Pill({ status }) {
  const s = STATUS[status]||STATUS.pendente;
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
function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ fontSize:11,fontWeight:700,color:C.sub,letterSpacing:0.5,display:"block",marginBottom:5,textTransform:"uppercase" }}>{label}</label>}
      <input {...props} style={{ width:"100%",padding:"11px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:14,color:C.text,background:C.bg,fontFamily:"inherit",...(props.style||{}) }}/>
    </div>
  );
}
function Btn({ children, variant="primary", full, small, onClick, style={} }) {
  const base = { padding:small?"7px 14px":"12px 16px",borderRadius:10,border:"none",cursor:"pointer",fontSize:small?13:14,fontWeight:700,fontFamily:"inherit",transition:"opacity 0.15s",...style };
  const vars = { primary:{background:C.blue,color:C.white}, secondary:{background:C.bg,color:C.sub,border:`1px solid ${C.border}`}, danger:{background:"#FEF2F2",color:C.red,border:`1px solid #FECACA`} };
  return <button onClick={onClick} style={{ ...base,...vars[variant],width:full?"100%":"auto" }}>{children}</button>;
}
function Avatar({ user, size=38 }) {
  if (user.avatar) return <img src={user.avatar} alt={user.name} style={{ width:size,height:size,borderRadius:"50%",objectFit:"cover" }}/>;
  return <div style={{ width:size,height:size,borderRadius:"50%",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.34,fontWeight:700,color:C.white,flexShrink:0 }}>{user.initials}</div>;
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const Ic = {
  home:   c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
  check:  c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  cal:    c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  bell:   c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  folder: c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  user:   c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  upload: c=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c||C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  down:   c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  chevD:  o=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transform:o?"rotate(180deg)":"none",transition:"transform 0.2s"}}><polyline points="6 9 12 15 18 9"/></svg>,
  plus:   c=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c||C.white} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:  c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  edit:   c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  lock:   ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  eye:    ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  logout: c=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c||C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  camera: c=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c||C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  cal2:   c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  person: c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ users, onLogin }) {
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    if (!email || !pw) { setError("Preencha e-mail e senha."); return; }
    if (!email.endsWith("@uel.br")) { setError("Use seu e-mail institucional (@uel.br)."); return; }
    setError(""); setLoading(true);
    setTimeout(() => {
      const u = users.find(u => u.email===email.trim().toLowerCase() && u.password===pw);
      if (u) onLogin(u);
      else { setError("E-mail ou senha incorretos."); setLoading(false); }
    }, 600);
  }

  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",background:C.white,padding:"0 28px" }}>
      {/* Logo */}
      <div style={{ textAlign:"center",marginBottom:40 }}>
        <div style={{ width:68,height:68,borderRadius:20,background:C.blue,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:18,boxShadow:"0 8px 24px rgba(26,86,219,0.25)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
        </div>
        <div style={{ fontSize:10,fontWeight:700,letterSpacing:3,color:C.blue,textTransform:"uppercase",marginBottom:6 }}>Business Consultoria</div>
        <div style={{ fontSize:26,fontWeight:700,color:C.text,marginBottom:4 }}>Bem-vindo de volta</div>
        <div style={{ fontSize:13,color:C.sub }}>Entre com seu e-mail institucional UEL</div>
      </div>

      {/* Form */}
      <Input label="E-mail institucional" type="email" placeholder="seu.nome@uel.br" value={email}
        onChange={e=>{setEmail(e.target.value);setError("");}}
        onKeyDown={e=>e.key==="Enter"&&handleLogin()}
        style={{ borderColor:error?C.red:C.border }}
      />
      <div style={{ position:"relative",marginBottom:error?8:20 }}>
        <label style={{ fontSize:11,fontWeight:700,color:C.sub,letterSpacing:0.5,display:"block",marginBottom:5,textTransform:"uppercase" }}>Senha</label>
        <input type={showPw?"text":"password"} placeholder="••••••••" value={pw}
          onChange={e=>{setPw(e.target.value);setError("");}}
          onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          style={{ width:"100%",padding:"11px 42px 11px 12px",borderRadius:9,border:`1.5px solid ${error?C.red:C.border}`,fontSize:14,color:C.text,background:C.bg,fontFamily:"inherit",boxSizing:"border-box" }}
        />
        <button onClick={()=>setShowPw(v=>!v)} style={{ position:"absolute",right:10,bottom:10,background:"none",border:"none",cursor:"pointer",padding:0,display:"flex" }}>
          {showPw?Ic.eyeOff():Ic.eye()}
        </button>
      </div>
      {error && <div style={{ fontSize:13,color:C.red,marginBottom:14,fontWeight:500 }}>{error}</div>}
      <Btn full onClick={handleLogin} style={{ opacity:loading?0.7:1 }}>{loading?"Entrando...":"Entrar"}</Btn>

      {/* Hint */}
      <div style={{ marginTop:28,padding:14,background:C.bg,borderRadius:12,border:`1px solid ${C.border}` }}>
        <div style={{ fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10 }}>Contas de teste</div>
        {users.slice(0,5).map(u=>(
          <div key={u.id} onClick={()=>{setEmail(u.email);setPw(u.password);setError("");}}
            style={{ padding:"5px 0",cursor:"pointer",display:"flex",justifyContent:"space-between",fontSize:12,borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontWeight:500,color:C.text }}>{u.name}</span>
            <span style={{ color:C.blue }}>{getRoleLabel(u.role)}</span>
          </div>
        ))}
        <div style={{ fontSize:11,color:C.muted,marginTop:8 }}>Clique em qualquer conta para preencher automaticamente</div>
      </div>
    </div>
  );
}

// ─── Profile Screen ────────────────────────────────────────────────────────────
function ProfileScreen({ user, onUpdate, onLogout, onBack }) {
  const [name, setName]       = useState(user.name);
  const [bio, setBio]         = useState(user.bio||"");
  const [pw, setPw]           = useState("");
  const [pw2, setPw2]         = useState("");
  const [saved, setSaved]     = useState(false);
  const [pwErr, setPwErr]     = useState("");
  const fileRef               = useRef();

  function handleAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onUpdate({ avatar: ev.target.result });
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (pw && pw!==pw2) { setPwErr("As senhas não coincidem."); return; }
    setPwErr("");
    const update = { name, bio };
    if (name.split(" ").length >= 2) update.initials = name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
    if (pw) update.password = pw;
    onUpdate(update);
    setPw(""); setPw2("");
    setSaved(true);
    setTimeout(()=>setSaved(false), 2500);
  }

  return (
    <div style={{ minHeight:"100vh",background:C.bg }}>
      {/* Header */}
      <div style={{ background:C.white,borderBottom:`1px solid ${C.border}`,padding:"14px 20px",display:"flex",alignItems:"center",gap:12 }}>
        <button onClick={onBack} style={{ background:"none",border:"none",cursor:"pointer",padding:4,display:"flex" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style={{ fontSize:17,fontWeight:700 }}>Meu Perfil</span>
      </div>

      {/* Avatar */}
      <div style={{ background:C.blue,padding:"32px 20px 48px",textAlign:"center",position:"relative" }}>
        <div style={{ position:"relative",display:"inline-block" }}>
          <Avatar user={user} size={88}/>
          <button onClick={()=>fileRef.current.click()} style={{ position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:"rgba(0,0,0,0.5)",border:"2px solid white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            {Ic.camera()}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatar}/>
        </div>
        <div style={{ color:C.white,fontWeight:700,fontSize:18,marginTop:12 }}>{user.name}</div>
        <div style={{ color:"rgba(255,255,255,0.7)",fontSize:13,marginTop:4 }}>{getRoleLabel(user.role)} · {user.area}</div>
      </div>

      {/* Form */}
      <div style={{ margin:"-20px 16px 0",background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:20,position:"relative",zIndex:1 }}>
        <div style={{ fontSize:12,fontWeight:700,color:C.blue,marginBottom:16,textTransform:"uppercase",letterSpacing:1 }}>Informações pessoais</div>
        <Input label="Nome completo" value={name} onChange={e=>setName(e.target.value)}/>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:11,fontWeight:700,color:C.sub,letterSpacing:0.5,display:"block",marginBottom:5,textTransform:"uppercase" }}>E-mail</label>
          <div style={{ padding:"11px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:14,color:C.muted,background:"#f9fafb" }}>{user.email}</div>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11,fontWeight:700,color:C.sub,letterSpacing:0.5,display:"block",marginBottom:5,textTransform:"uppercase" }}>Bio</label>
          <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3}
            style={{ width:"100%",padding:"11px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:14,color:C.text,background:C.bg,fontFamily:"inherit",resize:"none",boxSizing:"border-box" }}/>
        </div>

        <div style={{ fontSize:12,fontWeight:700,color:C.blue,marginBottom:16,marginTop:4,textTransform:"uppercase",letterSpacing:1 }}>Alterar senha</div>
        <Input label="Nova senha" type="password" placeholder="Deixe em branco para manter" value={pw} onChange={e=>{setPw(e.target.value);setPwErr("");}}/>
        <Input label="Confirmar nova senha" type="password" placeholder="Repita a nova senha" value={pw2} onChange={e=>{setPw2(e.target.value);setPwErr("");}}/>
        {pwErr && <div style={{ fontSize:12,color:C.red,marginBottom:10 }}>{pwErr}</div>}

        {saved && <div style={{ fontSize:13,color:C.green,fontWeight:600,marginBottom:10,textAlign:"center" }}>✓ Perfil atualizado com sucesso!</div>}
        <Btn full onClick={handleSave}>Salvar alterações</Btn>

        <div style={{ marginTop:16 }}>
          <Btn full variant="danger" onClick={onLogout}>Sair da conta</Btn>
        </div>
      </div>
      <div style={{ height:32 }}/>
    </div>
  );
}

// ─── Full Year Calendar ───────────────────────────────────────────────────────
function FullCalendar({ eventos, canManage, onAddEvento }) {
  const year = 2026;
  const [form, setForm] = useState(false);
  const [novo, setNovo] = useState({ titulo:"", date:"", hora:"", local:"" });
  const eventMap = {};
  eventos.forEach(ev => { eventMap[ev.date]=ev; });

  function handleAdd() {
    if (!novo.titulo||!novo.date) return;
    onAddEvento({ ...novo, id:"e"+Date.now() });
    setNovo({ titulo:"",date:"",hora:"",local:"" });
    setForm(false);
  }

  return (
    <div>
      <SLabel action={canManage&&(
        <button onClick={()=>setForm(v=>!v)} style={{ width:28,height:28,borderRadius:8,background:C.blue,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
          {Ic.plus()}
        </button>
      )}>Calendário 2026</SLabel>

      {form && (
        <div style={{ margin:"0 20px 16px",background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:16 }}>
          <div style={{ fontSize:13,fontWeight:700,color:C.blue,marginBottom:12 }}>Novo evento</div>
          <Input label="Título" value={novo.titulo} onChange={e=>setNovo(v=>({...v,titulo:e.target.value}))}/>
          <Input label="Data" type="date" value={novo.date} onChange={e=>setNovo(v=>({...v,date:e.target.value}))}/>
          <Input label="Horário" placeholder="ex: 19h00" value={novo.hora} onChange={e=>setNovo(v=>({...v,hora:e.target.value}))}/>
          <Input label="Local" placeholder="ex: Online, Sala A..." value={novo.local} onChange={e=>setNovo(v=>({...v,local:e.target.value}))}/>
          <div style={{ display:"flex",gap:8 }}>
            <Btn onClick={handleAdd} style={{ flex:1 }}>Adicionar</Btn>
            <Btn variant="secondary" onClick={()=>setForm(false)} style={{ flex:1 }}>Cancelar</Btn>
          </div>
        </div>
      )}

      {MONTHS.map((mName,mi)=>{
        const days = daysInMonth(year,mi);
        const off  = firstDay(year,mi);
        const mEvts = eventos.filter(e=>{ const d=new Date(e.date+"T00:00:00"); return d.getFullYear()===year&&d.getMonth()===mi; });
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
                const isT=iso===today();
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

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function BCApp() {
  const [users,    setUsers]    = useState(INIT_USERS);
  const [demandas, setDemandas] = useState(INIT_DEMANDAS);
  const [eventos,  setEventos]  = useState(INIT_EVENTOS);
  const [avisos,   setAvisos]   = useState(INIT_AVISOS);
  const [materiais,setMateriais]= useState(INIT_MATERIAIS);
  const [user,     setUser]     = useState(null);
  const [tab,      setTab]      = useState("inicio");
  const [screen,   setScreen]   = useState("app"); // "app" | "profile"
  const [openFolder,setFolder]  = useState(null);

  // Demandas form
  const [dForm,  setDForm]  = useState(false);
  const [dNovo,  setDNovo]  = useState({ titulo:"",resp:"",prazo:"",area:"",status:"pendente",desc:"" });
  const [dEdit,  setDEdit]  = useState(null);

  // Avisos form
  const [aForm,  setAForm]  = useState(false);
  const [aNovo,  setANovo]  = useState({ titulo:"",tag:"Geral" });

  // Upload ref
  const uploadRef = useRef();
  const [uploadArea, setUploadArea] = useState(null);

  if (!user) return <LoginScreen users={users} onLogin={u=>{ setUser(u); setTab("inicio"); setScreen("app"); }}/>;
  if (screen==="profile") return (
    <ProfileScreen user={user}
      onUpdate={u=>{ const nu={...user,...u}; setUser(nu); setUsers(prev=>prev.map(x=>x.id===nu.id?nu:x)); }}
      onLogout={()=>{ setUser(null); setScreen("app"); }}
      onBack={()=>setScreen("app")}
    />
  );

  const myDemandas  = canSeeAll(user) ? demandas : demandas.filter(d=>d.area===user.area);
  const urgentes    = myDemandas.filter(d=>d.status==="urgente"||d.status==="pendente");
  const nextEventos = eventos.filter(e=>e.date>=today()).sort((a,b)=>a.date.localeCompare(b.date));

  const TABS = [
    { id:"inicio",     label:"Início",   icon:Ic.home   },
    { id:"demandas",   label:"Demandas", icon:Ic.check  },
    { id:"calendario", label:"Agenda",   icon:Ic.cal    },
    { id:"avisos",     label:"Avisos",   icon:Ic.bell   },
    { id:"materiais",  label:"Materiais",icon:Ic.folder },
  ];
  const TAB_LABEL = { inicio:"Painel",demandas:"Demandas",calendario:"Agenda",avisos:"Avisos",materiais:"Materiais" };

  function addDemanda() {
    if (!dNovo.titulo||!dNovo.prazo) return;
    const area = canSeeAll(user) ? dNovo.area||user.area : user.area;
    setDemandas(prev=>[...prev,{ ...dNovo, id:"d"+Date.now(), area, criadoPor:user.id }]);
    setDNovo({ titulo:"",resp:"",prazo:"",area:"",status:"pendente",desc:"" });
    setDForm(false);
  }

  function updateStatus(id, status) {
    setDemandas(prev=>prev.map(d=>d.id===id?{...d,status}:d));
  }

  function deleteDemanda(id) {
    setDemandas(prev=>prev.filter(d=>d.id!==id));
  }

  function addAviso() {
    if (!aNovo.titulo) return;
    setAvisos(prev=>[{ id:"a"+Date.now(), ...aNovo, tempo:"agora", autor:user.area },  ...prev]);
    setANovo({ titulo:"",tag:"Geral" });
    setAForm(false);
  }

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file||!uploadArea) return;
    const ext = file.name.split(".").pop().toUpperCase();
    const tam = file.size>1024*1024 ? `${(file.size/1024/1024).toFixed(1)} MB` : `${Math.round(file.size/1024)} KB`;
    const newFile = { id:"f"+Date.now(), nome:file.name, tipo:ext, tam, url:"#" };
    setMateriais(prev=>({ ...prev, [uploadArea]:[...(prev[uploadArea]||[]),newFile] }));
    setUploadArea(null);
    e.target.value="";
  }

  function deleteMaterial(area, id) {
    setMateriais(prev=>({ ...prev, [area]:prev[area].filter(f=>f.id!==id) }));
  }

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;} input::placeholder,textarea::placeholder{color:#9CA3AF;} input:focus,textarea:focus,select:focus{outline:none;border-color:${C.blue}!important;} button{font-family:inherit;} ::-webkit-scrollbar{display:none;} select{font-family:inherit;}`}</style>

      {/* ── Header ── */}
      <div style={{ position:"sticky",top:0,zIndex:40,background:C.white,borderBottom:`1px solid ${C.border}`,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div>
          <div style={{ fontSize:10,fontWeight:700,letterSpacing:2.5,color:C.blue,textTransform:"uppercase" }}>Business Consultoria · UEL</div>
          <div style={{ fontSize:19,fontWeight:700,marginTop:1 }}>{TAB_LABEL[tab]}</div>
        </div>
        <button onClick={()=>setScreen("profile")} style={{ background:"none",border:"none",cursor:"pointer",padding:0 }}>
          <Avatar user={user} size={38}/>
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ paddingBottom:88 }}>

        {/* ══ INÍCIO ══ */}
        {tab==="inicio" && (<>
          {/* Hero */}
          <div style={{ margin:"16px 20px 0",background:C.blue,borderRadius:16,padding:"22px 20px",color:C.white,position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",right:-30,top:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.07)" }}/>
            <div style={{ position:"absolute",right:20,bottom:-40,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.05)" }}/>
            <div style={{ fontSize:12,opacity:0.65,marginBottom:4 }}>Segunda-feira, 11 de maio de 2026</div>
            <div style={{ fontSize:22,fontWeight:700 }}>Bom dia, {user.name.split(" ")[0]} ✦</div>
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
                  <div><div style={{ fontSize:14,fontWeight:600 }}>{ev.titulo}</div><div style={{ fontSize:12,color:C.sub,marginTop:2 }}>{ev.hora}{ev.local&&` · ${ev.local}`}</div></div>
                </div>
                {i<1&&<Divider/>}
              </div>
            ))}
          </>)}

          {urgentes.length>0&&(<>
            <SLabel>Suas demandas prioritárias</SLabel>
            {urgentes.slice(0,2).map((d,i)=>(
              <div key={d.id}>
                <div style={{ padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10 }}>
                  <div style={{ flex:1 }}><div style={{ fontSize:14,fontWeight:600 }}>{d.titulo}</div><div style={{ fontSize:12,color:C.sub,marginTop:2 }}>Prazo {fmtDate(d.prazo)}</div></div>
                  <Pill status={d.status}/>
                </div>
                {i<urgentes.slice(0,2).length-1&&<Divider/>}
              </div>
            ))}
          </>)}

          {avisos.length>0&&(<>
            <SLabel>Último aviso</SLabel>
            <div style={{ margin:"0 20px",background:C.white,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.blue}`,borderRadius:12,padding:"14px 16px" }}>
              <div style={{ fontSize:10,fontWeight:700,color:C.blue,textTransform:"uppercase",letterSpacing:1,marginBottom:6 }}>{avisos[0].tag}</div>
              <div style={{ fontSize:15,fontWeight:600,lineHeight:1.45 }}>{avisos[0].titulo}</div>
              <div style={{ fontSize:12,color:C.sub,marginTop:8 }}>{avisos[0].tempo} · {avisos[0].autor}</div>
            </div>
          </>)}
        </>)}

        {/* ══ DEMANDAS ══ */}
        {tab==="demandas" && (<>
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

          {/* Nova demanda form */}
          {dForm&&canManage(user)&&(
            <div style={{ margin:"12px 20px 0",background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:16 }}>
              <div style={{ fontSize:13,fontWeight:700,color:C.blue,marginBottom:12 }}>Nova demanda</div>
              <Input label="Título" value={dNovo.titulo} onChange={e=>setDNovo(v=>({...v,titulo:e.target.value}))}/>
              <Input label="Responsável" value={dNovo.resp} onChange={e=>setDNovo(v=>({...v,resp:e.target.value}))}/>
              <Input label="Prazo" type="date" value={dNovo.prazo} onChange={e=>setDNovo(v=>({...v,prazo:e.target.value}))}/>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:11,fontWeight:700,color:C.sub,letterSpacing:0.5,display:"block",marginBottom:5,textTransform:"uppercase" }}>Descrição</label>
                <textarea value={dNovo.desc} onChange={e=>setDNovo(v=>({...v,desc:e.target.value}))} rows={2}
                  style={{ width:"100%",padding:"10px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:14,color:C.text,background:C.bg,fontFamily:"inherit",resize:"none" }}/>
              </div>
              {canSeeAll(user)&&(
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:11,fontWeight:700,color:C.sub,letterSpacing:0.5,display:"block",marginBottom:5,textTransform:"uppercase" }}>Área</label>
                  <select value={dNovo.area||user.area} onChange={e=>setDNovo(v=>({...v,area:e.target.value}))}
                    style={{ width:"100%",padding:"11px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:14,color:C.text,background:C.bg }}>
                    {AREAS.map(a=><option key={a}>{a}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display:"flex",gap:8 }}>
                <Btn onClick={addDemanda} style={{ flex:1 }}>Criar demanda</Btn>
                <Btn variant="secondary" onClick={()=>setDForm(false)} style={{ flex:1 }}>Cancelar</Btn>
              </div>
            </div>
          )}

          <div style={{ height:8 }}/>
          {myDemandas.length===0&&<div style={{ padding:"32px 20px",textAlign:"center",color:C.muted,fontSize:14 }}>Nenhuma demanda ainda.</div>}
          {myDemandas.map((d,i)=>(
            <div key={d.id}>
              <div style={{ padding:"13px 20px" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14,fontWeight:600 }}>{d.titulo}</div>
                    {d.desc&&<div style={{ fontSize:12,color:C.sub,marginTop:2,lineHeight:1.4 }}>{d.desc}</div>}
                    <div style={{ display:"flex",gap:12,marginTop:4,flexWrap:"wrap" }}>
                      <span style={{ fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:3 }}>{Ic.person()}{d.resp||"—"}</span>
                      <span style={{ fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:3 }}>{Ic.cal2()}{fmtDate(d.prazo)}</span>
                      {canSeeAll(user)&&<span style={{ fontSize:11,color:C.blue,fontWeight:500 }}>{d.area}</span>}
                    </div>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6 }}>
                    <Pill status={d.status}/>
                    {canManage(user)&&(
                      <div style={{ display:"flex",gap:6 }}>
                        <select value={d.status} onChange={e=>updateStatus(d.id,e.target.value)}
                          style={{ fontSize:11,padding:"3px 6px",borderRadius:6,border:`1px solid ${C.border}`,background:C.bg,color:C.sub,cursor:"pointer" }}>
                          {Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <button onClick={()=>deleteDemanda(d.id)} style={{ padding:"3px 6px",borderRadius:6,border:"none",background:"#FEF2F2",cursor:"pointer",display:"flex",alignItems:"center" }}>
                          {Ic.trash()}
                        </button>
                      </div>
                    )}
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
            onAddEvento={ev=>setEventos(prev=>[...prev,ev].sort((a,b)=>a.date.localeCompare(b.date)))}
          />
        )}

        {/* ══ AVISOS ══ */}
        {tab==="avisos"&&(<>
          {canManage(user)&&(
            <div style={{ margin:"14px 20px 0" }}>
              {!aForm
                ? <Btn full onClick={()=>setAForm(true)}>+ Publicar aviso</Btn>
                : (
                  <div style={{ background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:16 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:C.blue,marginBottom:12 }}>Novo aviso</div>
                    <Input label="Mensagem" value={aNovo.titulo} onChange={e=>setANovo(v=>({...v,titulo:e.target.value}))}/>
                    <div style={{ marginBottom:12 }}>
                      <label style={{ fontSize:11,fontWeight:700,color:C.sub,letterSpacing:0.5,display:"block",marginBottom:5,textTransform:"uppercase" }}>Categoria</label>
                      <select value={aNovo.tag} onChange={e=>setANovo(v=>({...v,tag:e.target.value}))}
                        style={{ width:"100%",padding:"11px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:14,color:C.text,background:C.bg }}>
                        {["Geral","Urgente","Diretoria","Parceria","Institucional","Conquista"].map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div style={{ display:"flex",gap:8 }}>
                      <Btn onClick={addAviso} style={{ flex:1 }}>Publicar</Btn>
                      <Btn variant="secondary" onClick={()=>setAForm(false)} style={{ flex:1 }}>Cancelar</Btn>
                    </div>
                  </div>
                )
              }
            </div>
          )}
          <SLabel>Comunicados</SLabel>
          {avisos.map((n,i)=>(
            <div key={n.id}>
              <div style={{ padding:"16px 20px" }}>
                <div style={{ display:"inline-block",fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:C.blue,background:C.blueSoft,borderRadius:99,padding:"3px 10px",marginBottom:8 }}>{n.tag}</div>
                <div style={{ fontSize:i===0?16:14,fontWeight:i===0?700:600,lineHeight:1.45 }}>{n.titulo}</div>
                <div style={{ fontSize:12,color:C.sub,marginTop:8 }}>{n.tempo} · {n.autor}</div>
              </div>
              {i<avisos.length-1&&<Divider/>}
            </div>
          ))}
        </>)}

        {/* ══ MATERIAIS ══ */}
        {tab==="materiais"&&(<>
          <input ref={uploadRef} type="file" style={{ display:"none" }} onChange={handleUpload}/>
          <SLabel>Pastas por área</SLabel>
          {AREAS.map((area,ai)=>{
            const isOpen = openFolder===area;
            const files  = materiais[area]||[];
            const canUp  = canManage(user)&&(canSeeAll(user)||user.area===area);
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
                    {/* Upload button */}
                    {canUp&&(
                      <button onClick={()=>{ setUploadArea(area); setTimeout(()=>uploadRef.current.click(),50); }}
                        style={{ width:"100%",padding:"10px 14px",marginBottom:8,borderRadius:10,border:`1.5px dashed ${C.blue}`,background:C.blueSoft,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:C.blue,fontWeight:600,fontSize:13 }}>
                        {Ic.upload(C.blue)} Fazer upload de arquivo
                      </button>
                    )}
                    {/* Files list */}
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
                                  <button onClick={()=>deleteMaterial(area,f.id)} style={{ width:30,height:30,borderRadius:7,border:"none",background:"#FEF2F2",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
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
                    {files.length===0&&!canUp&&(
                      <div style={{ textAlign:"center",padding:"20px",color:C.muted,fontSize:13 }}>Nenhum arquivo nesta pasta.</div>
                    )}
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

      {/* ── Bottom Nav ── */}
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
