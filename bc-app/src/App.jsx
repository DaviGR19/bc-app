import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";

const C = {
  blue:"#1A56DB", blueSoft:"#EEF3FF", blueMid:"#DBEAFE",
  text:"#111827", sub:"#6B7280", muted:"#9CA3AF",
  border:"#E5E9F0", bg:"#F7F8FC", white:"#FFFFFF",
  green:"#059669", amber:"#D97706", red:"#DC2626",
};

const AREAS = ["Geral","Comercial","Gestão de Pessoas","Projetos","Jurídico Financeiro","Marketing"];
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAYS = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
const DAYS_S = ["D","S","T","Q","Q","S","S"];
const STATUS = {
  urgente:   { label:"Urgente",      color:C.red,   bg:"#FEF2F2" },
  andamento: { label:"Em andamento", color:C.amber, bg:"#FFFBEB" },
  pendente:  { label:"Pendente",     color:C.blue,  bg:C.blueSoft},
  concluido: { label:"Concluído",    color:C.green, bg:"#ECFDF5" },
};
const PRIORIDADE = {
  alta:  { label:"Alta",  color:C.red   },
  media: { label:"Média", color:C.amber },
  baixa: { label:"Baixa", color:C.green },
};
const BG_COLORS = ["#1A56DB","#7C3AED","#059669","#374151","#DB2777","#D97706"];
const BLUE = "#1A56DB";

function getSaudacao() { const h=new Date().getHours(); return h>=5&&h<12?"Bom dia":h>=12&&h<18?"Boa tarde":"Boa noite"; }
function getDataAtual() { const n=new Date(); return `${WEEKDAYS[n.getDay()]}, ${n.getDate()} de ${MONTHS[n.getMonth()]} de ${n.getFullYear()}`; }
function todayIso() { const n=new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`; }
function fmtDate(iso) { if(!iso)return"—"; const d=new Date(iso+"T00:00:00"); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`; }
function daysInMonth(y,m) { return new Date(y,m+1,0).getDate(); }
function firstDay(y,m) { return new Date(y,m,1).getDay(); }
function canSeeAll(u) { return u?.role==="presidente"||u?.role==="vice"; }
function canManage(u) { return u?.role==="presidente"||u?.role==="vice"||u?.role==="diretor"; }
function getRoleLabel(r) { return {presidente:"Presidente",vice:"Vice-Presidente",diretor:"Diretor(a)",membro:"Assessor(a)"}[r]||r; }

// ── Cache offline ─────────────────────────────────────────────
const CACHE_KEY = "bc_cache";
function saveCache(data) { try { localStorage.setItem(CACHE_KEY, JSON.stringify({...data, ts: Date.now()})); } catch(e){} }
function loadCache() { try { const d = localStorage.getItem(CACHE_KEY); return d ? JSON.parse(d) : null; } catch(e){ return null; } }

// ── atoms ──────────────────────────────────────────────────────
function Pill({status}){const s=STATUS[status]||STATUS.pendente;return<span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,color:s.color,background:s.bg,whiteSpace:"nowrap"}}>{s.label}</span>;}
function Divider({m=20}){return<div style={{height:1,background:C.border,margin:`0 ${m}px`}}/>;}
function SLabel({children,action}){return<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 20px 10px"}}><span style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:C.muted,textTransform:"uppercase"}}>{children}</span>{action}</div>;}
function FL({children}){return<label style={{fontSize:11,fontWeight:700,color:C.sub,letterSpacing:.5,display:"block",marginBottom:5,textTransform:"uppercase"}}>{children}</label>;}
function Inp({label,...p}){return<div style={{marginBottom:12}}>{label&&<FL>{label}</FL>}<input {...p} style={{width:"100%",padding:"11px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:14,color:C.text,background:C.bg,fontFamily:"inherit",boxSizing:"border-box",...(p.style||{})}}/></div>;}
function Sel({label,children,...p}){return<div style={{marginBottom:12}}>{label&&<FL>{label}</FL>}<select {...p} style={{width:"100%",padding:"11px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:14,color:C.text,background:C.bg,fontFamily:"inherit"}}>{children}</select></div>;}
function Txt({label,...p}){return<div style={{marginBottom:12}}>{label&&<FL>{label}</FL>}<textarea {...p} style={{width:"100%",padding:"11px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:14,color:C.text,background:C.bg,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box",...(p.style||{})}}/></div>;}
function Btn({children,variant="primary",full,small,onClick,disabled,style={}}){const base={padding:small?"7px 14px":"12px 16px",borderRadius:10,border:"none",cursor:disabled?"not-allowed":"pointer",fontSize:small?13:14,fontWeight:700,fontFamily:"inherit",opacity:disabled?.6:1,...style};const v={primary:{background:C.blue,color:C.white},secondary:{background:C.bg,color:C.sub,border:`1px solid ${C.border}`},danger:{background:"#FEF2F2",color:C.red,border:"1px solid #FECACA"}};return<button onClick={onClick} disabled={disabled} style={{...base,...v[variant],width:full?"100%":"auto"}}>{children}</button>;}
function Avatar({user,size=38}){if(user?.avatar)return<img src={user.avatar} alt="" style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>;return<div style={{width:size,height:size,borderRadius:"50%",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.34,fontWeight:700,color:C.white,flexShrink:0}}>{user?.initials||"?"}</div>;}
function Spinner(){return<div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}><div style={{width:28,height:28,border:`3px solid ${C.border}`,borderTopColor:C.blue,borderRadius:"50%",animation:"spin .8s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;}

// ── icons ──────────────────────────────────────────────────────
const Ic={
  home:  c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
  check: c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  cal:   c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  folder:c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  upload:c=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c||C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  down:  c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  chevD: o=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transform:o?"rotate(180deg)":"none",transition:"transform .2s"}}><polyline points="6 9 12 15 18 9"/></svg>,
  chevR: c=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c||C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  plus:  c=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c||C.white} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash: c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  edit:  c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  lock:  ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  eye:   ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  logout:c=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c||C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  camera:c=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c||C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  clip:  c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>,
  back:  ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  cal2:  c=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c||C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  person:c=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c||C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  people:c=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c||C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  flag:  c=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c||C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  image: c=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c||C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  user:  c=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c||C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  close: c=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c||C.text} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  wifi:  c=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c||C.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg>,
};

// ── Avatar Cropper (estilo WhatsApp) ──────────────────────────
function AvatarCropper({ src, onCrop, onCancel }) {
  const frameRef = useRef(null);
  const imageRef = useRef(null);
  const dragRef = useRef(null);
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 1, h: 1 });
  const [imgDisplayed, setImgDisplayed] = useState({ x: 0, y: 0, w: 300, h: 300 });
  const [crop, setCrop] = useState({ x: 50, y: 50, size: 200 });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setReady(false); setError("");
    const img = new window.Image();
    img.onload = () => {
      const maxW=320,maxH=400;
      const ratio=Math.min(maxW/img.width,maxH/img.height);
      const displayed={x:Math.round((maxW-img.width*ratio)/2),y:Math.round((maxH-img.height*ratio)/2),w:Math.round(img.width*ratio),h:Math.round(img.height*ratio)};
      const size=Math.round(Math.min(displayed.w,displayed.h)*0.72);
      setImgNaturalSize({w:img.width,h:img.height});
      setImgDisplayed(displayed);
      setCrop({x:displayed.x+Math.round((displayed.w-size)/2),y:displayed.y+Math.round((displayed.h-size)/2),size});
      setReady(true);
    };
    img.onerror=()=>setError("Não foi possível carregar essa imagem.");
    img.src=src;
  },[src]);

  function clampCrop(next,base=imgDisplayed){
    const maxSize=Math.max(60,Math.min(base.w,base.h));
    const size=Math.max(60,Math.min(maxSize,next.size));
    return{x:Math.max(base.x,Math.min(base.x+base.w-size,next.x)),y:Math.max(base.y,Math.min(base.y+base.h-size,next.y)),size};
  }
  function getPos(e){const rect=frameRef.current.getBoundingClientRect();const src=e.touches?e.touches[0]:e;return{x:src.clientX-rect.left,y:src.clientY-rect.top};}
  function startDrag(e,type){e.preventDefault();e.stopPropagation();if(!ready)return;const pos=getPos(e);dragRef.current={type,startX:pos.x,startY:pos.y,startCrop:{...crop}};}
  function onMove(e){
    if(!dragRef.current)return;e.preventDefault();
    const pos=getPos(e);const dx=pos.x-dragRef.current.startX;const dy=pos.y-dragRef.current.startY;
    const start=dragRef.current.startCrop;let next={...start};
    if(dragRef.current.type==="move"){next.x=start.x+dx;next.y=start.y+dy;}
    if(dragRef.current.type==="br")next.size=start.size+Math.max(dx,dy);
    if(dragRef.current.type==="tr"){next.size=start.size+Math.max(dx,-dy);next.y=start.y+start.size-next.size;}
    if(dragRef.current.type==="bl"){next.size=start.size+Math.max(-dx,dy);next.x=start.x+start.size-next.size;}
    if(dragRef.current.type==="tl"){next.size=start.size+Math.max(-dx,-dy);next.x=start.x+start.size-next.size;next.y=start.y+start.size-next.size;}
    setCrop(clampCrop(next));
  }
  function stopDrag(){dragRef.current=null;}
  function handleCrop(){
    if(!ready||!imageRef.current)return;
    const out=document.createElement("canvas");out.width=400;out.height=400;
    const ctx=out.getContext("2d");
    const scaleX=imgNaturalSize.w/imgDisplayed.w,scaleY=imgNaturalSize.h/imgDisplayed.h;
    const sx=Math.max(0,(crop.x-imgDisplayed.x)*scaleX),sy=Math.max(0,(crop.y-imgDisplayed.y)*scaleY);
    ctx.fillStyle="#fff";ctx.fillRect(0,0,400,400);
    ctx.drawImage(imageRef.current,sx,sy,crop.size*scaleX,crop.size*scaleY,0,0,400,400);
    out.toBlob(b=>{if(!b){setError("Tente outra foto.");return;}onCrop(b);},"image/jpeg",0.92);
  }
  const handles=[["tl",crop.x,crop.y],["tr",crop.x+crop.size,crop.y],["bl",crop.x,crop.y+crop.size],["br",crop.x+crop.size,crop.y+crop.size]];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:14}}>
      <div style={{background:"#111",borderRadius:18,padding:16,width:"100%",maxWidth:360}}>
        <div style={{color:C.white,fontSize:15,fontWeight:800,marginBottom:4}}>Ajustar foto de perfil</div>
        <div style={{color:"rgba(255,255,255,.65)",fontSize:12,marginBottom:12}}>Arraste o quadrado ou use as alças para enquadrar.</div>
        <div ref={frameRef} onPointerMove={onMove} onPointerUp={stopDrag} onPointerLeave={stopDrag}
          style={{position:"relative",width:320,maxWidth:"100%",height:400,margin:"0 auto",overflow:"hidden",borderRadius:12,background:"#050505",touchAction:"none"}}>
          {ready&&<img ref={imageRef} src={src} alt="" draggable={false} style={{position:"absolute",left:imgDisplayed.x,top:imgDisplayed.y,width:imgDisplayed.w,height:imgDisplayed.h,userSelect:"none",pointerEvents:"none"}}/>}
          {!ready&&!error&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,.7)",fontSize:13}}>Carregando...</div>}
          {error&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:22,color:C.white,fontSize:13}}>{error}</div>}
          {ready&&(<>
            <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.54)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",left:crop.x,top:crop.y,width:crop.size,height:crop.size,boxShadow:"0 0 0 999px rgba(0,0,0,.55)",border:"2px solid white",boxSizing:"border-box",cursor:"move"}} onPointerDown={e=>startDrag(e,"move")}/>
            <div style={{position:"absolute",left:crop.x,top:crop.y+crop.size/3,width:crop.size,height:1,background:"rgba(255,255,255,.5)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",left:crop.x,top:crop.y+crop.size*2/3,width:crop.size,height:1,background:"rgba(255,255,255,.5)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",left:crop.x+crop.size/3,top:crop.y,width:1,height:crop.size,background:"rgba(255,255,255,.5)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",left:crop.x+crop.size*2/3,top:crop.y,width:1,height:crop.size,background:"rgba(255,255,255,.5)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",left:crop.x,top:crop.y,width:crop.size,height:crop.size,borderRadius:"50%",border:"1.5px dashed rgba(255,255,255,.65)",boxSizing:"border-box",pointerEvents:"none"}}/>
            {handles.map(([type,x,y])=><div key={type} onPointerDown={e=>startDrag(e,type)} style={{position:"absolute",left:x-11,top:y-11,width:22,height:22,borderRadius:6,background:C.white,border:`3px solid ${BLUE}`,boxSizing:"border-box",cursor:"nwse-resize",zIndex:2}}/>)}
          </>)}
        </div>
        <div style={{display:"flex",gap:10,marginTop:14}}>
          <button onClick={onCancel} style={{flex:1,padding:12,borderRadius:10,border:"1px solid #444",background:"transparent",color:C.white,fontWeight:800,cursor:"pointer",fontSize:14}}>Cancelar</button>
          <button onClick={handleCrop} disabled={!ready} style={{flex:1,padding:12,borderRadius:10,border:"none",background:BLUE,color:C.white,fontWeight:800,cursor:ready?"pointer":"not-allowed",fontSize:14,opacity:ready?1:.55}}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

// ── Banner Cropper ────────────────────────────────────────────
function BannerCropper({ src, onCrop, onCancel }) {
  const containerRef=useRef();
  const [imgNaturalSize,setImgNaturalSize]=useState({w:1,h:1});
  const [imgDisplayed,setImgDisplayed]=useState({x:0,y:0,w:320,h:200});
  const RATIO=16/9;
  const [crop,setCrop]=useState({x:0,y:0,w:320,h:180});
  const [ready,setReady]=useState(false);
  const dragRef=useRef(null);

  useEffect(()=>{
    const img=new window.Image();
    img.onload=()=>{
      setImgNaturalSize({w:img.width,h:img.height});
      const maxW=320,maxH=280;const ratio=Math.min(maxW/img.width,maxH/img.height);
      const dw=Math.round(img.width*ratio),dh=Math.round(img.height*ratio);
      const dx=Math.round((maxW-dw)/2),dy=Math.round((maxH-dh)/2);
      setImgDisplayed({x:dx,y:dy,w:dw,h:dh});
      const cw=Math.min(dw,Math.round(dh*RATIO)),ch=Math.round(cw/RATIO);
      setCrop({x:dx+Math.round((dw-cw)/2),y:dy+Math.round((dh-ch)/2),w:cw,h:ch});
      setReady(true);
    };img.src=src;
  },[src]);

  function clampCrop(x,y,w,im){const img=im||imgDisplayed;const cw=Math.max(60,Math.min(img.w,w));const ch=Math.round(cw/RATIO);return{x:Math.max(img.x,Math.min(img.x+img.w-cw,x)),y:Math.max(img.y,Math.min(img.y+img.h-ch,y)),w:cw,h:ch};}
  function getPos(e){const rect=containerRef.current.getBoundingClientRect();const s=e.touches?e.touches[0]:e;return{x:s.clientX-rect.left,y:s.clientY-rect.top};}
  function onDown(e,type){e.preventDefault();e.stopPropagation();const pos=getPos(e);dragRef.current={type,startX:pos.x,startY:pos.y,startCrop:{...crop}};}
  function onMove(e){if(!dragRef.current)return;e.preventDefault();const pos=getPos(e);const dx=pos.x-dragRef.current.startX;const dy=pos.y-dragRef.current.startY;const sc=dragRef.current.startCrop;if(dragRef.current.type==="move")setCrop(clampCrop(sc.x+dx,sc.y+dy,sc.w));else if(dragRef.current.type==="r")setCrop(clampCrop(sc.x,sc.y,sc.w+dx));else if(dragRef.current.type==="l")setCrop(clampCrop(sc.x+dx,sc.y,sc.w-dx));}
  function onUp(){dragRef.current=null;}
  function handleCrop(){
    const out=document.createElement("canvas");out.width=800;out.height=Math.round(800/RATIO);
    const ctx=out.getContext("2d");
    const scaleX=imgNaturalSize.w/imgDisplayed.w,scaleY=imgNaturalSize.h/imgDisplayed.h;
    const img=new window.Image();
    img.onload=()=>{ctx.drawImage(img,(crop.x-imgDisplayed.x)*scaleX,(crop.y-imgDisplayed.y)*scaleY,crop.w*scaleX,crop.h*scaleY,0,0,out.width,out.height);out.toBlob(b=>onCrop(b),"image/jpeg",0.92);};
    img.src=src;
  }
  const H=14;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#1a1a1a",borderRadius:20,padding:20,width:"100%",maxWidth:360}}>
        <div style={{color:"white",fontSize:15,fontWeight:700,marginBottom:4}}>Ajustar foto de fundo</div>
        <div style={{color:"#aaa",fontSize:12,marginBottom:14}}>Arraste para enquadrar</div>
        <div ref={containerRef} style={{position:"relative",width:320,height:280,margin:"0 auto",overflow:"hidden",borderRadius:10,background:"#000",touchAction:"none"}}
          onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onTouchMove={onMove} onTouchEnd={onUp}>
          {ready&&<img src={src} draggable={false} style={{position:"absolute",left:imgDisplayed.x,top:imgDisplayed.y,width:imgDisplayed.w,height:imgDisplayed.h,userSelect:"none",pointerEvents:"none"}}/>}
          {ready&&(<>
            <div style={{position:"absolute",top:0,left:0,right:0,height:crop.y,background:"rgba(0,0,0,.6)"}}/>
            <div style={{position:"absolute",top:crop.y+crop.h,left:0,right:0,bottom:0,background:"rgba(0,0,0,.6)"}}/>
            <div style={{position:"absolute",top:crop.y,left:0,width:crop.x,height:crop.h,background:"rgba(0,0,0,.6)"}}/>
            <div style={{position:"absolute",top:crop.y,left:crop.x+crop.w,right:0,height:crop.h,background:"rgba(0,0,0,.6)"}}/>
            <div style={{position:"absolute",left:crop.x,top:crop.y,width:crop.w,height:crop.h,border:`2px solid ${BLUE}`,boxSizing:"border-box",cursor:"move"}} onMouseDown={e=>onDown(e,"move")} onTouchStart={e=>onDown(e,"move")}/>
            {[1,2].map(i=>[
              <div key={`h${i}`} style={{position:"absolute",left:crop.x,top:crop.y+Math.round(crop.h*i/3),width:crop.w,height:1,background:"rgba(255,255,255,.25)",pointerEvents:"none"}}/>,
              <div key={`v${i}`} style={{position:"absolute",left:crop.x+Math.round(crop.w*i/3),top:crop.y,width:1,height:crop.h,background:"rgba(255,255,255,.25)",pointerEvents:"none"}}/>
            ])}
            <div onMouseDown={e=>onDown(e,"l")} onTouchStart={e=>onDown(e,"l")} style={{position:"absolute",left:crop.x-H/2,top:crop.y+crop.h/2-H,width:H,height:H*2,background:BLUE,borderRadius:4,cursor:"ew-resize",zIndex:2}}/>
            <div onMouseDown={e=>onDown(e,"r")} onTouchStart={e=>onDown(e,"r")} style={{position:"absolute",left:crop.x+crop.w-H/2,top:crop.y+crop.h/2-H,width:H,height:H*2,background:BLUE,borderRadius:4,cursor:"ew-resize",zIndex:2}}/>
          </>)}
        </div>
        <div style={{display:"flex",gap:10,marginTop:16}}>
          <button onClick={onCancel} style={{flex:1,padding:12,borderRadius:10,border:"1px solid #444",background:"transparent",color:"white",fontWeight:700,cursor:"pointer",fontSize:14}}>Cancelar</button>
          <button onClick={handleCrop} style={{flex:1,padding:12,borderRadius:10,border:"none",background:BLUE,color:"white",fontWeight:700,cursor:"pointer",fontSize:14}}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

// ── Auth ──────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [name,setName]=useState("");
  const [pw,setPw]=useState("");
  const [pw2,setPw2]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [keepLogin,setKeepLogin]=useState(false);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [success,setSuccess]=useState("");

  async function handleLogin(){
    if(!email||!pw){setError("Preencha e-mail e senha.");return;}
    if(!email.endsWith("@uel.br")){setError("Use seu e-mail institucional (@uel.br).");return;}
    setError("");setLoading(true);
    const {data,error:err}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password:pw});
    if(err){setError("E-mail ou senha incorretos.");setLoading(false);return;}
    const {data:p}=await supabase.from("profiles").select("*").eq("id",data.user.id).single();
    onLogin({...p,email:data.user.email},keepLogin);
  }
  async function handleSignup(){
    if(!name||!email||!pw||!pw2){setError("Preencha todos os campos.");return;}
    if(!email.endsWith("@uel.br")){setError("Use seu e-mail institucional (@uel.br).");return;}
    if(pw!==pw2){setError("As senhas não coincidem.");return;}
    if(pw.length<6){setError("Mínimo 6 caracteres.");return;}
    setError("");setLoading(true);
    const {data,error:err}=await supabase.auth.signUp({email:email.trim().toLowerCase(),password:pw});
    if(err){setError(err.message);setLoading(false);return;}
    const initials=name.trim().split(" ").filter(Boolean).map(n=>n[0]).join("").slice(0,2).toUpperCase();
    await supabase.from("profiles").insert({id:data.user.id,name:name.trim(),initials,area:"Gestão de Pessoas",role:"membro",bio:"",avatar:""});
    setLoading(false);setSuccess("Conta criada! Você já pode entrar.");setMode("login");
  }
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",background:C.white,padding:"0 28px",fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;} input:focus{outline:none;border-color:${C.blue}!important;} button{font-family:inherit;}`}</style>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:64,height:64,borderRadius:18,background:C.blue,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:16,boxShadow:"0 8px 24px rgba(26,86,219,.25)"}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
        </div>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:3,color:C.blue,textTransform:"uppercase",marginBottom:6}}>Business Consultoria · UEL</div>
        <div style={{fontSize:24,fontWeight:700,color:C.text,marginBottom:4}}>{mode==="login"?"Bem-vindo de volta":"Criar conta"}</div>
        <div style={{fontSize:13,color:C.sub}}>{mode==="login"?"Entre com seu e-mail institucional":"Use seu e-mail @uel.br"}</div>
      </div>
      {success&&<div style={{fontSize:13,color:C.green,fontWeight:600,marginBottom:14,padding:"10px 14px",background:"#ECFDF5",borderRadius:9,textAlign:"center"}}>{success}</div>}
      {mode==="signup"&&<Inp label="Nome completo" placeholder="Seu nome" value={name} onChange={e=>{setName(e.target.value);setError("");}}/>}
      <Inp label="E-mail" type="email" placeholder="seu.nome@uel.br" value={email} onChange={e=>{setEmail(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&(mode==="login"?handleLogin():handleSignup())}/>
      <div style={{marginBottom:error?8:14}}>
        <FL>Senha</FL>
        <div style={{position:"relative"}}>
          <input type={showPw?"text":"password"} placeholder="••••••••" value={pw} onChange={e=>{setPw(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&(mode==="login"?handleLogin():handleSignup())}
            style={{width:"100%",padding:"11px 42px 11px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:14,color:C.text,background:C.bg,fontFamily:"inherit",boxSizing:"border-box"}}/>
          <button onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:0,display:"flex"}}>{showPw?Ic.eyeOff():Ic.eye()}</button>
        </div>
      </div>
      {mode==="login"&&<label style={{display:"flex",alignItems:"center",gap:8,margin:"-4px 0 14px",fontSize:13,color:C.sub,cursor:"pointer"}}><input type="checkbox" checked={keepLogin} onChange={e=>setKeepLogin(e.target.checked)} style={{width:16,height:16,accentColor:C.blue}}/>Manter o login neste aparelho</label>}
      {mode==="signup"&&<Inp label="Confirmar senha" type="password" placeholder="Repita a senha" value={pw2} onChange={e=>{setPw2(e.target.value);setError("");}}/>}
      {error&&<div style={{fontSize:13,color:C.red,marginBottom:14,fontWeight:500}}>{error}</div>}
      <Btn full onClick={mode==="login"?handleLogin:handleSignup} disabled={loading}>{loading?(mode==="login"?"Entrando...":"Criando conta..."):(mode==="login"?"Entrar":"Criar conta")}</Btn>
      <button onClick={()=>{setMode(m=>m==="login"?"signup":"login");setError("");setSuccess("");}} style={{marginTop:16,background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.blue,fontWeight:600}}>{mode==="login"?"Não tem conta? Criar conta":"Já tem conta? Entrar"}</button>
    </div>
  );
}

// ── Profile Screen ────────────────────────────────────────────
function ProfileScreen({ user, onUpdate, onLogout, onBack }) {
  const [name,setName]=useState(user.name||"");
  const [bio,setBio]=useState(user.bio||"");
  const [pw,setPw]=useState("");
  const [pw2,setPw2]=useState("");
  const [saved,setSaved]=useState(false);
  const [pwErr,setPwErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [cropSrc,setCropSrc]=useState(null);
  const [cropAspect,setCropAspect]=useState("square");
  const [bannerColor,setBannerColor]=useState(user.bannerColor||C.blue);
  const avatarRef=useRef();
  const bannerRef=useRef();
  function pickFile(ref,aspect){setCropAspect(aspect);ref.current.click();}
  function onFileChange(e,aspect){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{setCropSrc(ev.target.result);setCropAspect(aspect);};r.readAsDataURL(f);e.target.value="";}
  async function onCrop(blob){
    const isAvatar=cropAspect==="square";const path=`${user.id}_${isAvatar?"avatar":"banner"}.jpg`;
    await supabase.storage.from("avatars").upload(path,blob,{upsert:true,contentType:"image/jpeg"});
    const {data}=supabase.storage.from("avatars").getPublicUrl(path);
    const url=data.publicUrl+"?t="+Date.now();const field=isAvatar?"avatar":"bannerImg";
    await supabase.from("profiles").update({[field]:url}).eq("id",user.id);onUpdate({[field]:url});setCropSrc(null);
  }
  async function saveBannerColor(c){setBannerColor(c);await supabase.from("profiles").update({bannerColor:c}).eq("id",user.id);onUpdate({bannerColor:c});}
  async function handleSave(){
    if(pw&&pw!==pw2){setPwErr("As senhas não coincidem.");return;}
    setPwErr("");setLoading(true);
    const initials=name.trim().split(" ").filter(Boolean).map(n=>n[0]).join("").slice(0,2).toUpperCase();
    await supabase.from("profiles").update({name,bio,initials}).eq("id",user.id);
    if(pw)await supabase.auth.updateUser({password:pw});
    onUpdate({name,bio,initials});setPw("");setPw2("");setLoading(false);setSaved(true);setTimeout(()=>setSaved(false),2500);
  }
  const bannerStyle=user.bannerImg?{background:`url(${user.bannerImg}) center/cover no-repeat`}:{background:bannerColor};
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;} input:focus,textarea:focus,select:focus{outline:none;border-color:${C.blue}!important;} button{font-family:inherit;} ::-webkit-scrollbar{display:none;}`}</style>
      {cropSrc&&(cropAspect==="square"?<AvatarCropper src={cropSrc} onCrop={onCrop} onCancel={()=>setCropSrc(null)}/>:<BannerCropper src={cropSrc} onCrop={onCrop} onCancel={()=>setCropSrc(null)}/>)}
      <input ref={avatarRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>onFileChange(e,"square")}/>
      <input ref={bannerRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>onFileChange(e,"banner")}/>
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"14px 20px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex"}}>{Ic.back()}</button>
        <span style={{fontSize:17,fontWeight:700}}>Meu Perfil</span>
      </div>
      <div style={{...bannerStyle,padding:"28px 20px 48px",textAlign:"center",position:"relative",minHeight:150}}>
        <button onClick={()=>pickFile(bannerRef,"banner")} style={{position:"absolute",top:10,right:10,display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:20,background:"rgba(0,0,0,0.35)",border:"1px solid rgba(255,255,255,0.3)",cursor:"pointer",color:"white",fontSize:12,fontWeight:600}}>{Ic.image()} Trocar fundo</button>
        <div style={{position:"relative",display:"inline-block"}}>
          <Avatar user={user} size={84}/>
          <button onClick={()=>pickFile(avatarRef,"square")} style={{position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:"rgba(0,0,0,0.5)",border:"2px solid white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Ic.camera()}</button>
        </div>
        <div style={{color:"white",fontWeight:700,fontSize:17,marginTop:10,textShadow:"0 1px 4px rgba(0,0,0,.3)"}}>{user.name}</div>
        <div style={{color:"rgba(255,255,255,.75)",fontSize:12,marginTop:4}}>{getRoleLabel(user.role)} · {user.area}</div>
      </div>
      <div style={{margin:"-20px 16px 0",background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:20,position:"relative",zIndex:1}}>
        {!user.bannerImg&&<div style={{marginBottom:16}}><FL>Cor do fundo</FL><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{BG_COLORS.map(bc=><button key={bc} onClick={()=>saveBannerColor(bc)} style={{width:32,height:32,borderRadius:"50%",background:bc,border:bannerColor===bc?`3px solid ${C.text}`:"3px solid transparent",cursor:"pointer",transition:"transform .15s",transform:bannerColor===bc?"scale(1.15)":"scale(1)"}}/>)}</div></div>}
        {user.bannerImg&&<div style={{marginBottom:16}}><button onClick={async()=>{await supabase.from("profiles").update({bannerImg:""}).eq("id",user.id);onUpdate({bannerImg:""}); }} style={{fontSize:12,color:C.red,background:"#FEF2F2",border:"none",padding:"6px 12px",borderRadius:8,cursor:"pointer",fontWeight:600}}>Remover imagem de fundo</button></div>}
        <div style={{fontSize:11,fontWeight:700,color:C.blue,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Informações pessoais</div>
        <Inp label="Nome completo" value={name} onChange={e=>setName(e.target.value)}/>
        <div style={{marginBottom:12}}><FL>E-mail</FL><div style={{padding:"11px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:14,color:C.muted,background:"#f9fafb"}}>{user.email}</div></div>
        <Txt label="Bio" value={bio} rows={3} onChange={e=>setBio(e.target.value)}/>
        <div style={{fontSize:11,fontWeight:700,color:C.blue,margin:"4px 0 14px",textTransform:"uppercase",letterSpacing:1}}>Alterar senha</div>
        <Inp label="Nova senha" type="password" placeholder="Deixe em branco para manter" value={pw} onChange={e=>{setPw(e.target.value);setPwErr("");}}/>
        <Inp label="Confirmar nova senha" type="password" placeholder="Repita a nova senha" value={pw2} onChange={e=>{setPw2(e.target.value);setPwErr("");}}/>
        {pwErr&&<div style={{fontSize:12,color:C.red,marginBottom:10}}>{pwErr}</div>}
        {saved&&<div style={{fontSize:13,color:C.green,fontWeight:600,marginBottom:10,textAlign:"center"}}>✓ Perfil atualizado!</div>}
        <Btn full onClick={handleSave} disabled={loading}>{loading?"Salvando...":"Salvar alterações"}</Btn>
        <div style={{marginTop:12}}><Btn full variant="danger" onClick={onLogout}>Sair da conta</Btn></div>
      </div>
      <div style={{height:32}}/>
    </div>
  );
}

// ── Demanda Detail ────────────────────────────────────────────
function DemandaDetail({ demanda, canEdit, onUpdate, onDelete, onBack }) {
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({...demanda});
  const [anexos,setAnexos]=useState([]);
  const [uploading,setUploading]=useState(false);
  const anexoRef=useRef();
  useEffect(()=>{supabase.from("anexos").select("*").eq("demanda_id",demanda.id).then(({data})=>setAnexos(data||[]));},[demanda.id]);
  async function save(){const{data}=await supabase.from("demandas").update({titulo:form.titulo,descricao:form.descricao,obs:form.obs,resp:form.resp,prazo:form.prazo,status:form.status,prioridade:form.prioridade}).eq("id",demanda.id).select().single();onUpdate(data);setEditing(false);}
  async function handleAnexo(e){const f=e.target.files[0];if(!f)return;setUploading(true);const path=`${demanda.id}/${Date.now()}_${f.name}`;await supabase.storage.from("anexos").upload(path,f);const{data:url}=supabase.storage.from("anexos").getPublicUrl(path);const ext=f.name.split(".").pop().toUpperCase();const tam=f.size>1024*1024?`${(f.size/1024/1024).toFixed(1)} MB`:`${Math.round(f.size/1024)} KB`;const{data:anx}=await supabase.from("anexos").insert({demanda_id:demanda.id,nome:f.name,tipo:ext,tamanho:tam,url:url.publicUrl}).select().single();setAnexos(p=>[...p,anx]);setUploading(false);e.target.value="";}
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;} input:focus,textarea:focus,select:focus{outline:none;border-color:${C.blue}!important;} button{font-family:inherit;} ::-webkit-scrollbar{display:none;}`}</style>
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex"}}>{Ic.back()}</button><span style={{fontSize:17,fontWeight:700}}>Demanda</span></div>
        {canEdit&&!editing&&<div style={{display:"flex",gap:8}}><button onClick={()=>setEditing(true)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Ic.edit()}</button><button onClick={onDelete} style={{width:32,height:32,borderRadius:8,border:"none",background:"#FEF2F2",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Ic.trash()}</button></div>}
      </div>
      <div style={{padding:"16px 20px"}}>
        {editing?(
          <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:16}}>
            <div style={{fontSize:13,fontWeight:700,color:C.blue,marginBottom:14}}>Editar demanda</div>
            <Inp label="Título" value={form.titulo} onChange={e=>setForm(v=>({...v,titulo:e.target.value}))}/>
            <Inp label="Responsável" value={form.resp} onChange={e=>setForm(v=>({...v,resp:e.target.value}))}/>
            <Inp label="Prazo" type="date" value={form.prazo} onChange={e=>setForm(v=>({...v,prazo:e.target.value}))}/>
            <Sel label="Status" value={form.status} onChange={e=>setForm(v=>({...v,status:e.target.value}))}>{Object.entries(STATUS).map(([k,s])=><option key={k} value={k}>{s.label}</option>)}</Sel>
            <Sel label="Prioridade" value={form.prioridade} onChange={e=>setForm(v=>({...v,prioridade:e.target.value}))}>{Object.entries(PRIORIDADE).map(([k,p])=><option key={k} value={k}>{p.label}</option>)}</Sel>
            <Txt label="Descrição" value={form.descricao} rows={4} onChange={e=>setForm(v=>({...v,descricao:e.target.value}))}/>
            <Txt label="Observações" value={form.obs} rows={3} onChange={e=>setForm(v=>({...v,obs:e.target.value}))}/>
            <div style={{display:"flex",gap:8}}><Btn onClick={save} style={{flex:1}}>Salvar</Btn><Btn variant="secondary" onClick={()=>setEditing(false)} style={{flex:1}}>Cancelar</Btn></div>
          </div>
        ):(
          <>
            <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:16,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:12}}><div style={{fontSize:18,fontWeight:700,flex:1}}>{demanda.titulo}</div><Pill status={demanda.status}/></div>
              <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
                <span style={{fontSize:12,color:C.sub,display:"flex",alignItems:"center",gap:4}}>{Ic.person()}{demanda.resp||"—"}</span>
                <span style={{fontSize:12,color:C.sub,display:"flex",alignItems:"center",gap:4}}>{Ic.cal2()}{fmtDate(demanda.prazo)}</span>
                <span style={{fontSize:12,display:"flex",alignItems:"center",gap:4,color:PRIORIDADE[demanda.prioridade]?.color||C.muted,fontWeight:600}}>{PRIORIDADE[demanda.prioridade]?.label}</span>
              </div>
            </div>
            {demanda.descricao&&<div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:16,marginBottom:12}}><div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Descrição</div><div style={{fontSize:14,color:C.text,lineHeight:1.6}}>{demanda.descricao}</div></div>}
            {demanda.obs&&<div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:16,marginBottom:12}}><div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Observações</div><div style={{fontSize:14,color:C.text,lineHeight:1.6}}>{demanda.obs}</div></div>}
            <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:16,marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Anexos</div>
              <input ref={anexoRef} type="file" style={{display:"none"}} onChange={handleAnexo}/>
              {anexos.length>0?anexos.map((a,i)=>(<div key={a.id}><div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0"}}><div style={{width:32,height:32,borderRadius:7,background:C.blueSoft,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:9,fontWeight:800,color:C.blue}}>{a.tipo}</span></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{a.nome}</div><div style={{fontSize:11,color:C.muted}}>{a.tamanho}</div></div><a href={a.url} target="_blank" rel="noreferrer" style={{width:30,height:30,borderRadius:7,border:`1px solid ${C.border}`,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none"}}>{Ic.down()}</a></div>{i<anexos.length-1&&<Divider m={0}/>}</div>)):<div style={{fontSize:13,color:C.muted,textAlign:"center",padding:"8px 0"}}>Nenhum anexo</div>}
              {canEdit&&<button onClick={()=>anexoRef.current.click()} disabled={uploading} style={{marginTop:anexos.length?12:0,width:"100%",padding:"9px",borderRadius:9,border:`1.5px dashed ${C.blue}`,background:C.blueSoft,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:C.blue,fontWeight:600,fontSize:13,opacity:uploading?.6:1}}>{Ic.clip(C.blue)}{uploading?"Enviando...":"Anexar arquivo"}</button>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Full Calendar ─────────────────────────────────────────────
function FullCalendar({ eventos, canManage, onAdd, onUpdate, onDelete }) {
  const year=2026;
  const [selectedDate,setSelectedDate]=useState(null);
  const [floatForm,setFloatForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [novo,setNovo]=useState({titulo:"",date:"",hora:"",local:""});

  const eventMap={};
  eventos.forEach(ev=>{const k=ev.data||ev.date;if(!eventMap[k])eventMap[k]=[];eventMap[k].push(ev);});

  function openAdd(date){
    setEditing(null);
    setNovo({titulo:"",date,hora:"",local:""});
    setFloatForm(true);
  }
  function openEdit(ev){
    setEditing(ev);
    setNovo({titulo:ev.titulo||"",date:ev.data||ev.date,hora:ev.hora||"",local:ev.local||""});
    setFloatForm(true);
  }
  async function save(){
    if(!novo.titulo||!novo.date)return;
    if(editing){
      const{data}=await supabase.from("eventos").update({titulo:novo.titulo,data:novo.date,hora:novo.hora,local:novo.local}).eq("id",editing.id).select().single();
      onUpdate(data);
    }else{
      const{data}=await supabase.from("eventos").insert({titulo:novo.titulo,data:novo.date,hora:novo.hora,local:novo.local}).select().single();
      onAdd(data);
    }
    setFloatForm(false);setEditing(null);setNovo({titulo:"",date:"",hora:"",local:""});
  }
  async function remove(ev){
    await supabase.from("eventos").delete().eq("id",ev.id);
    onDelete(ev.id);
  }

  return(
    <div style={{position:"relative"}}>
      <SLabel>Calendário 2026</SLabel>
      {MONTHS.map((mName,mi)=>{
        const days=daysInMonth(year,mi),off=firstDay(year,mi);
        const mEvts=eventos.filter(e=>{const d=new Date((e.data||e.date)+"T00:00:00");return d.getFullYear()===year&&d.getMonth()===mi;});
        return(
          <div key={mi} style={{margin:"0 20px 20px",background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 12px"}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:12,paddingLeft:2}}>{mName}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",textAlign:"center",gap:1}}>
              {DAYS_S.map((d,i)=><div key={i} style={{fontSize:9,fontWeight:700,color:C.muted,paddingBottom:6}}>{d}</div>)}
              {Array.from({length:off}).map((_,i)=><div key={`e${i}`}/>)}
              {Array.from({length:days},(_,i)=>{
                const day=i+1,iso=`${year}-${String(mi+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const has=!!eventMap[iso],isT=iso===todayIso(),isSel=selectedDate===iso;
                return(
                  <button key={day} onClick={()=>{if(canManage){setSelectedDate(isSel?null:iso);}}}
                    style={{width:30,height:30,margin:"0 auto",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,position:"relative",background:isT?C.blue:isSel?C.blueMid:"transparent",color:isT?C.white:has?C.blue:C.text,fontWeight:isT||has?700:400,border:"none",cursor:canManage?"pointer":"default"}}>
                    {day}
                    {has&&!isT&&<div style={{position:"absolute",bottom:2,width:3,height:3,borderRadius:"50%",background:isSel?C.blue:C.blue}}/>}
                  </button>
                );
              })}
            </div>
            {mEvts.length>0&&(
              <div style={{marginTop:10,borderTop:`1px solid ${C.border}`,paddingTop:10}}>
                {mEvts.map((ev,i)=>(
                  <div key={ev.id}>
                    <div style={{display:"flex",gap:10,alignItems:"center",padding:"6px 2px"}}>
                      <div style={{minWidth:28,height:28,borderRadius:7,background:C.blueSoft,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:11,fontWeight:800,color:C.blue}}>{new Date((ev.data||ev.date)+"T00:00:00").getDate()}</span></div>
                      <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{ev.titulo}</div><div style={{fontSize:11,color:C.sub}}>{ev.hora}{ev.local&&` · ${ev.local}`}</div></div>
                      {canManage&&<div style={{display:"flex",gap:4}}>
                        <button onClick={()=>openEdit(ev)} style={{width:26,height:26,borderRadius:6,border:`1px solid ${C.border}`,background:C.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Ic.edit()}</button>
                        <button onClick={()=>remove(ev)} style={{width:26,height:26,borderRadius:6,border:"none",background:"#FEF2F2",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Ic.trash()}</button>
                      </div>}
                    </div>
                    {i<mEvts.length-1&&<Divider m={0}/>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* FAB — botão flutuante para adicionar evento no dia selecionado */}
      {canManage&&selectedDate&&!floatForm&&(
        <button onClick={()=>openAdd(selectedDate)}
          style={{position:"fixed",bottom:100,right:24,width:52,height:52,borderRadius:"50%",background:C.blue,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(26,86,219,.45)",zIndex:60,animation:"fabIn .2s ease"}}>
          {Ic.plus()}
        </button>
      )}

      {/* Formulário flutuante */}
      {floatForm&&(
        <>
          <div onClick={()=>{setFloatForm(false);setEditing(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.35)",zIndex:70}}/>
          <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.white,borderRadius:"20px 20px 0 0",padding:"20px 20px 36px",zIndex:71,boxShadow:"0 -8px 32px rgba(0,0,0,.15)",animation:"slideUp .25s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:15,fontWeight:700,color:C.text}}>{editing?"Editar evento":"Novo evento"}{selectedDate&&!editing&&` · ${fmtDate(selectedDate)}`}</div>
              <button onClick={()=>{setFloatForm(false);setEditing(null);}} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex"}}>{Ic.close()}</button>
            </div>
            <Inp label="Título" value={novo.titulo} onChange={e=>setNovo(v=>({...v,titulo:e.target.value}))}/>
            <Inp label="Data" type="date" value={novo.date} onChange={e=>setNovo(v=>({...v,date:e.target.value}))}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Inp label="Horário" placeholder="ex: 19h00" value={novo.hora} onChange={e=>setNovo(v=>({...v,hora:e.target.value}))}/>
              <Inp label="Local" placeholder="ex: Online" value={novo.local} onChange={e=>setNovo(v=>({...v,local:e.target.value}))}/>
            </div>
            <Btn full onClick={save}>{editing?"Salvar alterações":"Adicionar evento"}</Btn>
          </div>
        </>
      )}
    </div>
  );
}

// ── NavTab ────────────────────────────────────────────────────
function NavTab({active,icon,label,onClick}){
  return(
    <button onClick={onClick} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"4px 12px",transition:"transform .15s",transform:active?"translateY(-2px)":"none"}}>
      <div style={{width:40,height:32,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:active?C.blueSoft:"transparent",transition:"background .2s"}}>{icon(active?C.blue:C.muted)}</div>
      <span style={{fontSize:10,fontWeight:700,color:active?C.blue:C.muted,letterSpacing:.3,transition:"color .2s"}}>{label}</span>
    </button>
  );
}

// ── Swipeable Tabs ────────────────────────────────────────────
function SwipeableTabs({ tabIndex, onChange, children }) {
  const containerRef = useRef();
  const startX = useRef(null);
  const startY = useRef(null);
  const count = children.length;

  function onTouchStart(e){
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e){
    if(startX.current===null)return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50){
      if(dx < 0 && tabIndex < count-1) onChange(tabIndex+1);
      if(dx > 0 && tabIndex > 0) onChange(tabIndex-1);
    }
    startX.current = null; startY.current = null;
  }

  return(
    <div ref={containerRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{flex:1,overflow:"hidden"}}>
      {children[tabIndex]}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function BCApp() {
  const [user,     setUser]    = useState(null);
  const [loading,  setLoading] = useState(true);
  const [offline,  setOffline] = useState(!navigator.onLine);
  const [tab,      setTab]     = useState("inicio");
  const [screen,   setScreen]  = useState("app");
  const [drawer,   setDrawer]  = useState(false);
  const [demandas, setDemandas]= useState([]);
  const [eventos,  setEventos] = useState([]);
  const [materiais,setMateriais]=useState({});
  const [openFolder,setFolder] = useState(null);
  const [selectedD,setSelectedD]=useState(null);
  const [dForm,    setDForm]   = useState(false);
  const [dNovo,    setDNovo]   = useState({titulo:"",resp:"",prazo:"",area:"",status:"pendente",prioridade:"media",descricao:"",obs:""});
  const [members,  setMembers] = useState([]);
  const [membersTab,setMembersTab]=useState(false);
  const uploadRef = useRef();
  const [uploadArea,setUploadArea]=useState(null);

  // Detectar online/offline
  useEffect(()=>{
    function onOnline(){setOffline(false);}
    function onOffline(){setOffline(true);}
    window.addEventListener("online",onOnline);
    window.addEventListener("offline",onOffline);
    return()=>{window.removeEventListener("online",onOnline);window.removeEventListener("offline",onOffline);};
  },[]);

  // Sessão + cache offline
  useEffect(()=>{
    const cache = loadCache();
    if(cache?.user){
      // Carrega dados do cache imediatamente
      setUser(cache.user);
      if(cache.demandas) setDemandas(cache.demandas);
      if(cache.eventos)  setEventos(cache.eventos);
      if(cache.materiais)setMateriais(cache.materiais);
      if(cache.members)  setMembers(cache.members);
    }
    // Tenta sessão real
    supabase.auth.getSession().then(async({data:{session}})=>{
      if(session){
        const{data:p}=await supabase.from("profiles").select("*").eq("id",session.user.id).single();
        if(p){
          const u={...p,email:session.user.email};
          setUser(u);
          // salva user no cache
          saveCache({...(loadCache()||{}),user:u});
        }
      } else if(!cache?.user){
        // Sem sessão e sem cache — mostra login
      }
      setLoading(false);
    }).catch(()=>{
      // Offline sem sessão — usa cache
      setLoading(false);
    });
  },[]);

  useEffect(()=>{
    if(!user)return;
    if(navigator.onLine) loadAll();
    const ch=supabase.channel("bc-rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"demandas"},loadDemandas)
      .on("postgres_changes",{event:"*",schema:"public",table:"eventos"},loadEventos)
      .on("postgres_changes",{event:"*",schema:"public",table:"materiais"},loadMateriais)
      .subscribe();
    return()=>supabase.removeChannel(ch);
  },[user]);

  function loadAll(){loadDemandas();loadEventos();loadMateriais();loadMembers();}

  async function loadDemandas(){
    const{data}=await supabase.from("demandas").select("*").order("criado_em",{ascending:false});
    if(data){setDemandas(data);saveCache({...(loadCache()||{}),demandas:data});}
  }
  async function loadEventos(){
    const{data}=await supabase.from("eventos").select("*").order("data");
    if(data){setEventos(data);saveCache({...(loadCache()||{}),eventos:data});}
  }
  async function loadMateriais(){
    const{data}=await supabase.from("materiais").select("*").order("criado_em");
    if(data){
      const g={};AREAS.forEach(a=>g[a]=[]);(data||[]).forEach(m=>{if(g[m.area])g[m.area].push(m);});
      setMateriais(g);saveCache({...(loadCache()||{}),materiais:g});
    }
  }
  async function loadMembers(){
    const{data}=await supabase.from("profiles").select("*").order("name");
    if(data){setMembers(data);saveCache({...(loadCache()||{}),members:data});}
  }
  async function updateMemberRole(id,role,area){
    await supabase.from("profiles").update({role,area}).eq("id",id);
    setMembers(p=>p.map(m=>m.id===id?{...m,role,area}:m));
  }
  async function handleUpload(e){
    const f=e.target.files[0];if(!f||!uploadArea)return;
    const path=`${uploadArea}/${Date.now()}_${f.name}`;
    await supabase.storage.from("materiais").upload(path,f);
    const{data:u}=supabase.storage.from("materiais").getPublicUrl(path);
    const ext=f.name.split(".").pop().toUpperCase();
    const tam=f.size>1024*1024?`${(f.size/1024/1024).toFixed(1)} MB`:`${Math.round(f.size/1024)} KB`;
    await supabase.from("materiais").insert({nome:f.name,tipo:ext,tamanho:tam,area:uploadArea,url:u.publicUrl,criado_por:user.id});
    setUploadArea(null);e.target.value="";loadMateriais();
  }
  async function addDemanda(){
    if(!dNovo.titulo||!dNovo.prazo)return;
    const area=canSeeAll(user)?dNovo.area||AREAS[0]:user.area;
    await supabase.from("demandas").insert({...dNovo,area,criado_por:user.id});
    setDNovo({titulo:"",resp:"",prazo:"",area:"",status:"pendente",prioridade:"media",descricao:"",obs:""});
    setDForm(false);loadDemandas();
  }
  async function logout(){
    localStorage.removeItem("bc_keep_login");
    localStorage.removeItem(CACHE_KEY);
    await supabase.auth.signOut();
    setUser(null);setScreen("app");setTab("inicio");setDrawer(false);
  }

  const TABS=[{id:"inicio",label:"Início",icon:Ic.home},{id:"demandas",label:"Demandas",icon:Ic.check},{id:"calendario",label:"Agenda",icon:Ic.cal},{id:"materiais",label:"Materiais",icon:Ic.folder}];
  const TAB_LABEL={inicio:"Painel",demandas:"Demandas",calendario:"Agenda",materiais:"Materiais"};
  const tabIndex = TABS.findIndex(t=>t.id===tab);

  if(loading)return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.white}}><Spinner/></div>;
  if(!user)return<AuthScreen onLogin={(u,keep)=>{localStorage.setItem("bc_keep_login",keep?"true":"false");setUser(u);setTab("inicio");setScreen("app");}}/>;
  if(screen==="profile")return<ProfileScreen user={user} onUpdate={u=>setUser(p=>({...p,...u}))} onLogout={logout} onBack={()=>setScreen("app")}/>;
  if(screen==="demanda"&&selectedD){
    const d=demandas.find(x=>x.id===selectedD);
    if(d)return<DemandaDetail demanda={d} canEdit={canManage(user)} onUpdate={u=>setDemandas(p=>p.map(x=>x.id===u.id?u:x))} onDelete={async()=>{await supabase.from("demandas").delete().eq("id",d.id);setDemandas(p=>p.filter(x=>x.id!==d.id));setScreen("app");setSelectedD(null);}} onBack={()=>{setScreen("app");setSelectedD(null);}}/>;
  }

  const myDemandas=canSeeAll(user)?demandas:demandas.filter(d=>d.area===user.area);
  const urgentes=myDemandas.filter(d=>d.status==="urgente"||d.status==="pendente");
  const now=new Date();
  const nextEventos=eventos.filter(e=>(e.data||e.date)>=todayIso()).slice(0,3);
  const totalAbertas=myDemandas.filter(d=>d.status!=="concluido").length;
  const totalConcluidas=myDemandas.filter(d=>d.status==="concluido").length;

  // ── Tab content ───────────────────────────────────────────
  const tabContents = [
    /* INÍCIO */
    (<div key="inicio">
      <div style={{margin:"16px 20px 0",background:C.blue,borderRadius:16,padding:"22px 20px",color:C.white,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-30,top:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,.07)"}}/>
        <div style={{fontSize:12,opacity:.65,marginBottom:4}}>{getDataAtual()}</div>
        <div style={{fontSize:22,fontWeight:700}}>{getSaudacao()}, {user.name?.split(" ")[0]} ✦</div>
        <div style={{fontSize:12,opacity:.65,marginTop:4}}>{user.area} · {getRoleLabel(user.role)}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,margin:"12px 20px 0"}}>
        <div onClick={()=>setTab("demandas")} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",cursor:"pointer"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Em aberto</div>
          <div style={{fontSize:32,fontWeight:800,color:C.blue}}>{totalAbertas}</div>
          <div style={{fontSize:12,color:C.sub,marginTop:4}}>demanda{totalAbertas!==1?"s":""}</div>
        </div>
        <div onClick={()=>setTab("demandas")} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",cursor:"pointer"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Concluídas</div>
          <div style={{fontSize:32,fontWeight:800,color:C.green}}>{totalConcluidas}</div>
          <div style={{fontSize:12,color:C.sub,marginTop:4}}>demanda{totalConcluidas!==1?"s":""}</div>
        </div>
      </div>
      {nextEventos.length>0&&(<><SLabel>Próximos eventos</SLabel>{nextEventos.map((ev,i)=>(<div key={ev.id}><div style={{padding:"12px 20px",display:"flex",gap:14,alignItems:"center"}}><div style={{minWidth:46,height:46,borderRadius:12,background:C.blueSoft,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:16,fontWeight:800,color:C.blue,lineHeight:1}}>{new Date((ev.data||ev.date)+"T00:00:00").getDate()}</span><span style={{fontSize:9,fontWeight:700,color:C.blue,opacity:.6,textTransform:"uppercase"}}>{MONTHS[new Date((ev.data||ev.date)+"T00:00:00").getMonth()].slice(0,3)}</span></div><div><div style={{fontSize:14,fontWeight:600}}>{ev.titulo}</div><div style={{fontSize:12,color:C.sub,marginTop:2}}>{ev.hora}{ev.local&&` · ${ev.local}`}</div></div></div>{i<nextEventos.length-1&&<Divider/>}</div>))}</>)}
      {urgentes.length>0&&(<><SLabel>Demandas prioritárias</SLabel>{urgentes.slice(0,3).map((d,i)=>(<div key={d.id}><div onClick={()=>{setSelectedD(d.id);setScreen("demanda");}} style={{padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,cursor:"pointer"}}><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{d.titulo}</div><div style={{fontSize:12,color:C.sub,marginTop:2}}>{d.resp||"—"} · Prazo {fmtDate(d.prazo)}</div></div><div style={{display:"flex",alignItems:"center",gap:8}}><Pill status={d.status}/>{Ic.chevR()}</div></div>{i<urgentes.slice(0,3).length-1&&<Divider/>}</div>))}</>)}
      {urgentes.length===0&&nextEventos.length===0&&(<div style={{margin:"32px 20px",background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"32px 20px",textAlign:"center"}}><div style={{fontSize:32,marginBottom:12}}>✦</div><div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:6}}>Tudo em dia!</div><div style={{fontSize:13,color:C.sub}}>Nenhuma demanda pendente ou evento próximo.</div></div>)}
    </div>),

    /* DEMANDAS */
    (<div key="demandas">
      <div style={{padding:"14px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        {canSeeAll(user)?<div style={{fontSize:12,color:C.blue,fontWeight:600,background:C.blueSoft,borderRadius:99,padding:"5px 14px"}}>Todas as áreas</div>:<div style={{fontSize:12,color:C.sub,background:C.white,border:`1px solid ${C.border}`,borderRadius:99,padding:"5px 14px",display:"flex",alignItems:"center",gap:5}}>{Ic.lock()} {user.area}</div>}
        {canManage(user)&&<button onClick={()=>{setDForm(v=>!v);if(!members.length)loadMembers();}} style={{width:32,height:32,borderRadius:9,background:C.blue,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Ic.plus()}</button>}
      </div>
      {dForm&&canManage(user)&&(
        <div style={{margin:"12px 20px 0",background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
          <div style={{fontSize:13,fontWeight:700,color:C.blue,marginBottom:12}}>Nova demanda</div>
          <Inp label="Título" value={dNovo.titulo} onChange={e=>setDNovo(v=>({...v,titulo:e.target.value}))}/>
          {canSeeAll(user)&&<Sel label="Área" value={dNovo.area||AREAS[0]} onChange={e=>setDNovo(v=>({...v,area:e.target.value,resp:""}))}>
            {AREAS.map(a=><option key={a}>{a}</option>)}
          </Sel>}
          <Sel label="Responsável" value={dNovo.resp} onChange={e=>setDNovo(v=>({...v,resp:e.target.value}))}>
            <option value="">Selecione um membro</option>
            {members.filter(m=>m.area===(canSeeAll(user)?dNovo.area||AREAS[0]:user.area)).map(m=><option key={m.id} value={m.name}>{m.name} ({getRoleLabel(m.role)})</option>)}
          </Sel>
          <Inp label="Prazo" type="date" value={dNovo.prazo} onChange={e=>setDNovo(v=>({...v,prazo:e.target.value}))}/>
          <Sel label="Prioridade" value={dNovo.prioridade} onChange={e=>setDNovo(v=>({...v,prioridade:e.target.value}))}>{Object.entries(PRIORIDADE).map(([k,p])=><option key={k} value={k}>{p.label}</option>)}</Sel>
          <Txt label="Descrição" value={dNovo.descricao} rows={3} onChange={e=>setDNovo(v=>({...v,descricao:e.target.value}))} placeholder="Descreva o que precisa ser feito..."/>
          <Txt label="Observações" value={dNovo.obs} rows={2} onChange={e=>setDNovo(v=>({...v,obs:e.target.value}))} placeholder="Observações adicionais..."/>
          <div style={{display:"flex",gap:8}}><Btn onClick={addDemanda} style={{flex:1}}>Criar</Btn><Btn variant="secondary" onClick={()=>setDForm(false)} style={{flex:1}}>Cancelar</Btn></div>
        </div>
      )}
      <div style={{height:8}}/>
      {myDemandas.length===0&&<div style={{padding:"32px 20px",textAlign:"center",color:C.muted,fontSize:14}}>Nenhuma demanda ainda.</div>}
      {myDemandas.map((d,i)=>(<div key={d.id}><div onClick={()=>{setSelectedD(d.id);setScreen("demanda");}} style={{padding:"13px 20px",cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{d.titulo}</div>{d.descricao&&<div style={{fontSize:12,color:C.sub,marginTop:2,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{d.descricao}</div>}<div style={{display:"flex",gap:10,marginTop:5,flexWrap:"wrap"}}><span style={{fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:3}}>{Ic.person()}{d.resp||"—"}</span><span style={{fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:3}}>{Ic.cal2()}{fmtDate(d.prazo)}</span>{canSeeAll(user)&&<span style={{fontSize:11,color:C.blue,fontWeight:500}}>{d.area}</span>}</div></div><div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}><Pill status={d.status}/><span style={{fontSize:11,color:PRIORIDADE[d.prioridade]?.color||C.muted,fontWeight:600}}>{PRIORIDADE[d.prioridade]?.label}</span></div></div></div>{i<myDemandas.length-1&&<Divider/>}</div>))}
    </div>),

    /* CALENDÁRIO */
    (<div key="calendario">
      <FullCalendar eventos={eventos} canManage={canManage(user)}
        onAdd={ev=>setEventos(p=>[...p,ev])}
        onUpdate={ev=>setEventos(p=>p.map(x=>x.id===ev.id?ev:x))}
        onDelete={id=>setEventos(p=>p.filter(x=>x.id!==id))}
      />
    </div>),

    /* MATERIAIS */
    (<div key="materiais">
      <SLabel>Pastas por área</SLabel>
      {AREAS.map((area,ai)=>{
        const isOpen=openFolder===area,files=materiais[area]||[];
        // Todos podem fazer upload
        const canUp = !!user;
        return(
          <div key={area}>
            <button onClick={()=>setFolder(isOpen?null:area)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 20px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
              <div style={{width:40,height:40,borderRadius:10,background:isOpen?C.blue:C.blueSoft,display:"flex",alignItems:"center",justifyContent:"center",transition:"background .2s"}}>{Ic.folder(isOpen?C.white:C.blue)}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:C.text}}>{area}</div><div style={{fontSize:12,color:C.sub,marginTop:1}}>{files.length} arquivo{files.length!==1?"s":""}</div></div>
              {Ic.chevD(isOpen)}
            </button>
            {isOpen&&(<div style={{margin:"0 20px 6px"}}>
              <button onClick={()=>{setUploadArea(area);setTimeout(()=>uploadRef.current.click(),50);}} style={{width:"100%",padding:"10px 14px",marginBottom:8,borderRadius:10,border:`1.5px dashed ${C.blue}`,background:C.blueSoft,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:C.blue,fontWeight:600,fontSize:13}}>{Ic.upload(C.blue)} Fazer upload</button>
              {files.length>0&&(<div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>{files.map((f,fi)=>(<div key={f.id}><div style={{padding:"11px 14px",display:"flex",alignItems:"center",gap:12}}><div style={{minWidth:36,height:36,borderRadius:8,background:C.blueSoft,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:9,fontWeight:800,color:C.blue,letterSpacing:.5}}>{f.tipo}</span></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{f.nome}</div><div style={{fontSize:11,color:C.muted,marginTop:1}}>{f.tamanho}</div></div><div style={{display:"flex",gap:6}}><a href={f.url} target="_blank" rel="noreferrer" style={{width:30,height:30,borderRadius:7,border:`1px solid ${C.border}`,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none"}}>{Ic.down()}</a>{canManage(user)&&<button onClick={async()=>{await supabase.from("materiais").delete().eq("id",f.id);loadMateriais();}} style={{width:30,height:30,borderRadius:7,border:"none",background:"#FEF2F2",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Ic.trash()}</button>}</div></div>{fi<files.length-1&&<Divider m={14}/>}</div>))}</div>)}
              {files.length===0&&<div style={{textAlign:"center",padding:"16px",color:C.muted,fontSize:13}}>Nenhum arquivo nesta pasta.</div>}
            </div>)}
            {ai<AREAS.length-1&&!isOpen&&<Divider/>}
          </div>
        );
      })}
      <div style={{padding:"16px 20px",textAlign:"center"}}><span style={{fontSize:12,color:C.muted}}>Drive continua como backup automático</span></div>
    </div>),
  ];

  return(
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:C.text,position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;} input::placeholder,textarea::placeholder{color:#9CA3AF;}
        input:focus,textarea:focus,select:focus{outline:none;border-color:${C.blue}!important;}
        button{font-family:inherit;} ::-webkit-scrollbar{display:none;} select{font-family:inherit;}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes fabIn{from{transform:scale(0)}to{transform:scale(1)}}
      `}</style>
      <input ref={uploadRef} type="file" style={{display:"none"}} onChange={handleUpload}/>

      {/* Banner offline */}
      {offline&&<div style={{background:C.amber,padding:"8px 20px",display:"flex",alignItems:"center",gap:8,fontSize:12,fontWeight:600,color:"white"}}>{Ic.wifi()} Você está offline — mostrando dados salvos</div>}

      {/* DRAWER */}
      {drawer&&(<>
        <div onClick={()=>{setDrawer(false);setMembersTab(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:100,animation:"fadeIn .2s"}}/>
        <div style={{position:"fixed",top:0,right:0,bottom:0,width:280,background:C.white,zIndex:101,display:"flex",flexDirection:"column",animation:"slideIn .22s ease",boxShadow:"-6px 0 32px rgba(0,0,0,.15)"}}>
          {!membersTab?(
            <>
              <div style={{background:C.blue,padding:"36px 20px 24px"}}>
                <Avatar user={user} size={56}/>
                <div style={{color:C.white,fontWeight:700,fontSize:16,marginTop:12}}>{user.name}</div>
                <div style={{color:"rgba(255,255,255,.7)",fontSize:12,marginTop:4}}>{getRoleLabel(user.role)} · {user.area}</div>
              </div>
              <div style={{flex:1,overflowY:"auto"}}>
                <button onClick={()=>{setDrawer(false);setScreen("profile");}} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"16px 20px",background:"none",border:"none",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}>
                  <div style={{width:38,height:38,borderRadius:10,background:C.blueSoft,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ic.user()}</div>
                  <div style={{flex:1,textAlign:"left"}}><div style={{fontSize:14,fontWeight:600,color:C.text}}>Meu Perfil</div><div style={{fontSize:12,color:C.sub,marginTop:2}}>Editar informações e foto</div></div>
                  {Ic.chevR()}
                </button>
                <button onClick={()=>{setMembersTab(true);if(!members.length)loadMembers();}} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"16px 20px",background:"none",border:"none",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}>
                  <div style={{width:38,height:38,borderRadius:10,background:C.blueSoft,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ic.people()}</div>
                  <div style={{flex:1,textAlign:"left"}}><div style={{fontSize:14,fontWeight:600,color:C.text}}>Membros</div><div style={{fontSize:12,color:C.sub,marginTop:2}}>Ver todos os participantes</div></div>
                  {Ic.chevR()}
                </button>
              </div>
              <div style={{padding:"16px 20px 40px",borderTop:`1px solid ${C.border}`}}>
                <button onClick={logout} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"#FEF2F2",border:"none",borderRadius:10,cursor:"pointer"}}>
                  {Ic.logout(C.red)}<span style={{fontSize:14,fontWeight:600,color:C.red}}>Sair da conta</span>
                </button>
              </div>
            </>
          ):(
            <>
              <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"16px 20px",display:"flex",alignItems:"center",gap:10}}>
                <button onClick={()=>setMembersTab(false)} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex"}}>{Ic.back()}</button>
                <span style={{fontSize:15,fontWeight:700}}>Membros</span>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"8px 0"}}>
                {!members.length&&<Spinner/>}
                {["presidente","vice","diretor","membro"].map(role=>{
                  const group=members.filter(m=>m.role===role);
                  if(!group.length)return null;
                  const rl={presidente:"Presidência",vice:"Vice-Presidência",diretor:"Diretores",membro:"Assessores"};
                  return(
                    <div key={role}>
                      <div style={{padding:"12px 16px 6px"}}><span style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:C.muted,textTransform:"uppercase"}}>{rl[role]}</span></div>
                      {group.map(m=>(
                        <div key={m.id} style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`}}>
                          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:user.role==="presidente"&&m.id!==user.id?8:0}}>
                            <Avatar user={m} size={36}/>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div>
                              <div style={{fontSize:11,color:C.sub,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.area}</div>
                            </div>
                          </div>
                          {user.role==="presidente"&&m.id!==user.id&&(
                            <div style={{display:"flex",gap:6}}>
                              <select defaultValue={m.role} onChange={e=>updateMemberRole(m.id,e.target.value,m.area)} style={{flex:1,padding:"6px 8px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,color:C.text,background:C.bg}}>
                                <option value="membro">Assessor(a)</option>
                                <option value="diretor">Diretor(a)</option>
                                <option value="vice">Vice-Presidente</option>
                                <option value="presidente">Presidente</option>
                              </select>
                              <select defaultValue={m.area} onChange={e=>updateMemberRole(m.id,m.role,e.target.value)} style={{flex:2,padding:"6px 8px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,color:C.text,background:C.bg}}>
                                {["Presidência",...AREAS].map(a=><option key={a}>{a}</option>)}
                              </select>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </>)}

      {/* Header */}
      <div style={{position:"sticky",top:0,zIndex:40,background:C.white,borderBottom:`1px solid ${C.border}`,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:2.5,color:C.blue,textTransform:"uppercase"}}>Business Consultoria · UEL</div>
          <div style={{fontSize:19,fontWeight:700,marginTop:1}}>{TAB_LABEL[tab]}</div>
        </div>
        <button onClick={()=>setDrawer(true)} style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
          <Avatar user={user} size={38}/>
        </button>
      </div>

      {/* Swipeable body */}
      <div style={{paddingBottom:88,overflowY:"auto",height:"calc(100vh - 60px)"}}>
        <SwipeableTabs tabIndex={tabIndex} onChange={i=>setTab(TABS[i].id)}>
          {tabContents}
        </SwipeableTabs>
      </div>

      {/* Bottom Nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,zIndex:50,background:C.white,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-around",padding:"8px 0 18px"}}>
        {TABS.map(t=><NavTab key={t.id} active={tab===t.id} icon={t.icon} label={t.label} onClick={()=>setTab(t.id)}/>)}
      </div>
    </div>
  );
}
