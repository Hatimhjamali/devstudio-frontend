import { useState, useRef, useEffect, useCallback } from "react";

// ── CONFIG ────────────────────────────────────────────────────
// Change this to your Render backend URL when deployed
const API_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : "http://localhost:5001";

// ── THEME ─────────────────────────────────────────────────────
const C = {
  bg:"#070a0f", bg2:"#0b0f18", bg3:"#0f1520", bg4:"#131c28",
  border:"#1a2535", border2:"#1f2e42",
  text:"#9bb5d5", textB:"#ddeeff", textD:"#3d5470",
  cyan:"#00d4ff", cyanD:"#0099cc",
  green:"#00ff88", orange:"#ff8c42",
  purple:"#a855f7", pink:"#ff4da6",
  yellow:"#ffd700", red:"#ff3355",
};

const AGENTS = [
  { id:"coord",    name:"Coordinator", emoji:"🎯", color:C.green,  role:"Plans & organizes" },
  { id:"designer", name:"Designer",    emoji:"🎨", color:C.cyan,   role:"Game design & systems" },
  { id:"prog",     name:"Programmer",  emoji:"💻", color:C.orange, role:"Code & implementation" },
  { id:"analyst",  name:"Analyst",     emoji:"📊", color:C.purple, role:"Data & balance" },
  { id:"market",   name:"Marketing",   emoji:"📣", color:C.pink,   role:"Community & growth" },
];

const INIT_STUDIOS  = [{ id:"s1", name:"The Studio", agents:["coord","designer","prog","analyst","market"] }];
const INIT_OFFICES  = [
  { id:"o1", name:"Coordinator", agents:["coord"] },
  { id:"o2", name:"Designer",    agents:["designer"] },
  { id:"o3", name:"Programmer",  agents:["prog"] },
  { id:"o4", name:"Analyst",     agents:["analyst"] },
  { id:"o5", name:"Marketing",   agents:["market"] },
];
const INIT_PROJECTS = [
  { id:"p1", name:"EquaNeutral", color:C.cyan },
  { id:"p2", name:"Project Nova", color:C.purple },
];

function agentById(id) { return AGENTS.find(a=>a.id===id); }
function timeNow() { return new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false}); }
function uid() { return Math.random().toString(36).slice(2,9); }

// ── STYLES ────────────────────────────────────────────────────
const S = {
  btn:(col=C.cyan)=>({background:`linear-gradient(135deg,${col},${col}bb)`,border:"none",borderRadius:8,color:"#000",fontWeight:700,fontSize:12,cursor:"pointer",padding:"8px 16px",fontFamily:"'Exo 2',sans-serif"}),
  btnGhost:{background:"none",border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontSize:12,cursor:"pointer",padding:"8px 16px",fontFamily:"'Exo 2',sans-serif"},
  input:{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:"9px 12px",color:C.textB,fontSize:13,outline:"none",fontFamily:"'Exo 2',sans-serif",width:"100%",boxSizing:"border-box"},
  card:{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px"},
};

// ── TOAST ─────────────────────────────────────────────────────
function useToast() {
  const [toasts,setToasts]=useState([]);
  const toast=useCallback((msg,type="info")=>{
    const id=uid();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3200);
  },[]);
  return {toasts,toast};
}
function ToastContainer({toasts}) {
  return (
    <div style={{position:"fixed",bottom:24,right:24,zIndex:999,display:"flex",flexDirection:"column",gap:8}}>
      {toasts.map(t=>(
        <div key={t.id} style={{
          background:C.bg2,border:`1px solid ${t.type==="err"?C.red:t.type==="warn"?C.yellow:C.cyan}44`,
          borderLeft:`3px solid ${t.type==="err"?C.red:t.type==="warn"?C.yellow:C.cyan}`,
          borderRadius:10,padding:"10px 14px",fontSize:12,color:C.textB,
          boxShadow:`0 4px 20px rgba(0,0,0,.5)`,animation:"slideInRight .2s ease",maxWidth:280,
        }}>{t.msg}</div>
      ))}
    </div>
  );
}

// ── AVATAR ────────────────────────────────────────────────────
function Avatar({agentId,size=32}) {
  const a=agentById(agentId);
  if (!a) return null;
  return <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,background:`radial-gradient(circle at 35% 35%,${a.color}33,${a.color}11)`,border:`1.5px solid ${a.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.44,boxShadow:`0 0 ${size/3}px ${a.color}22`}}>{a.emoji}</div>;
}

function Badge({agentId}) {
  const a=agentById(agentId);
  if (!a) return null;
  return <span style={{fontSize:10,padding:"1px 7px",borderRadius:20,background:`${a.color}15`,border:`1px solid ${a.color}35`,color:a.color,fontFamily:"'Share Tech Mono',monospace",letterSpacing:.5}}>{a.emoji} {a.name}</span>;
}

// ── MESSAGE ───────────────────────────────────────────────────
function Message({msg,onRightClick}) {
  const isUser=msg.from==="user";
  const agent=!isUser?agentById(msg.from):null;

  const fmt=(text)=>text.split("\n").map((line,i)=>{
    if (!line) return <div key={i} style={{height:5}}/>;
    if (line.startsWith("**")&&line.endsWith("**")) return <div key={i} style={{fontWeight:700,color:C.textB,margin:"3px 0"}}>{line.slice(2,-2)}</div>;
    if (line.startsWith("• ")||line.startsWith("- ")||line.startsWith("* ")) return <div key={i} style={{paddingLeft:10,lineHeight:1.65}}><span style={{color:agent?.color||C.cyan,marginRight:6,fontWeight:700}}>›</span>{line.slice(2)}</div>;
    if (line.startsWith("⚠️")||line.startsWith("⚠")) return <div key={i} style={{color:C.yellow,background:`${C.yellow}10`,borderRadius:6,padding:"4px 8px",fontSize:12,margin:"3px 0"}}>{line}</div>;
    if (line.startsWith("```")||line.endsWith("```")) return null;
    return <div key={i} style={{lineHeight:1.65}}>{line}</div>;
  });

  if (isUser) return (
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14,padding:"0 4px",animation:"slideIn .18s ease"}}>
      <div style={{maxWidth:"62%"}}>
        <div onContextMenu={e=>{e.preventDefault();onRightClick(e,msg.text);}} style={{background:`linear-gradient(135deg,${C.cyan}22,${C.cyan}0d)`,border:`1px solid ${C.cyan}30`,borderRadius:"14px 14px 3px 14px",padding:"10px 14px",cursor:"context-menu"}}>
          <div style={{fontSize:13,color:C.textB,lineHeight:1.65}}>{msg.text}</div>
        </div>
        <div style={{fontSize:10,color:C.textD,textAlign:"right",marginTop:3,fontFamily:"'Share Tech Mono',monospace"}}>{msg.ts}</div>
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",gap:10,marginBottom:14,padding:"0 4px",animation:"slideIn .18s ease"}}>
      <Avatar agentId={msg.from} size={34}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <span style={{fontSize:12,fontWeight:700,color:agent?.color,fontFamily:"'Share Tech Mono',monospace",letterSpacing:.5}}>{agent?.name}</span>
          <span style={{fontSize:10,color:C.textD,fontFamily:"'Share Tech Mono',monospace"}}>{msg.ts}</span>
          {msg.streaming&&<span style={{fontSize:9,color:C.cyan,fontFamily:"'Share Tech Mono',monospace",animation:"pulse 1s infinite"}}>streaming...</span>}
        </div>
        <div onContextMenu={e=>{e.preventDefault();onRightClick(e,msg.text);}} style={{background:C.bg3,border:`1px solid ${C.border}`,borderLeft:`2px solid ${agent?.color}55`,borderRadius:"3px 14px 14px 14px",padding:"10px 14px",cursor:"context-menu"}}>
          <div style={{fontSize:13,color:C.text}}>{fmt(msg.text)}</div>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator({agentId}) {
  const ag=agentById(agentId);
  return (
    <div style={{display:"flex",gap:10,marginBottom:12,alignItems:"center",animation:"slideIn .18s ease"}}>
      <Avatar agentId={agentId} size={34}/>
      <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderLeft:`2px solid ${ag?.color}55`,borderRadius:"3px 14px 14px 14px",padding:"10px 16px",display:"flex",gap:5,alignItems:"center"}}>
        <span style={{fontSize:10,color:ag?.color,fontFamily:"'Share Tech Mono',monospace",marginRight:6}}>{ag?.name}</span>
        {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:ag?.color,animation:"pulse 1s ease infinite",animationDelay:`${i*.18}s`}}/>)}
      </div>
    </div>
  );
}

// ── CHAT INPUT ────────────────────────────────────────────────
function ChatInput({onSend,agents,briefMode,setBriefMode,disabled}) {
  const [val,setVal]=useState("");
  const taRef=useRef();
  const send=()=>{
    const t=val.trim();
    if (!t||disabled) return;
    if (t.toLowerCase().startsWith("/brief start")) setBriefMode(true);
    if (t.toLowerCase().startsWith("/brief end"))   setBriefMode(false);
    onSend(t);
    setVal("");
    setTimeout(()=>taRef.current?.focus(),10);
  };
  return (
    <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`,background:C.bg2}}>
      {briefMode&&<div style={{fontSize:10,color:C.yellow,background:`${C.yellow}12`,border:`1px solid ${C.yellow}30`,borderRadius:6,padding:"4px 12px",marginBottom:8,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1,display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:C.red,animation:"pulse 1s ease infinite"}}/>
        RECORDING BRIEF — type /brief end to save
      </div>}
      <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
        <div style={{flex:1,background:C.bg3,border:`1px solid ${briefMode?C.yellow+"55":disabled?C.border:C.border2}`,borderRadius:12,padding:"10px 14px",transition:"border-color .2s",opacity:disabled?.6:1}}>
          <textarea ref={taRef} value={val} onChange={e=>setVal(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder={disabled?"Agents are responding...":"Message your team... @agent, /brief start, /ref"}
            disabled={disabled} rows={1}
            style={{width:"100%",background:"none",border:"none",outline:"none",color:C.textB,fontSize:13,resize:"none",fontFamily:"'Exo 2',sans-serif",lineHeight:1.55,maxHeight:120}}
          />
        </div>
        <button onClick={send} disabled={disabled} style={{...S.btn(disabled?C.textD:C.cyan),width:42,height:42,padding:0,borderRadius:10,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:disabled?"not-allowed":"pointer"}}>↑</button>
      </div>
      <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
        {agents.map(id=>{const a=agentById(id);return a?<button key={id} onClick={()=>setVal(v=>v+`@${a.name.toLowerCase()} `)} style={{fontSize:10,padding:"2px 8px",borderRadius:20,cursor:"pointer",background:`${a.color}12`,border:`1px solid ${a.color}30`,color:a.color,fontFamily:"'Share Tech Mono',monospace"}}>{a.emoji} @{a.name.toLowerCase()}</button>:null;})}
        {agents.length>1&&<button onClick={()=>setVal(v=>v+"/all ")} style={{fontSize:10,padding:"2px 8px",borderRadius:20,cursor:"pointer",background:`${C.textD}12`,border:`1px solid ${C.textD}25`,color:C.textD,fontFamily:"'Share Tech Mono',monospace"}}>/all</button>}
        <button onClick={()=>setVal(v=>v+(briefMode?"/brief end":"/brief start "))} style={{fontSize:10,padding:"2px 8px",borderRadius:20,cursor:"pointer",background:`${C.yellow}12`,border:`1px solid ${C.yellow}30`,color:C.yellow,fontFamily:"'Share Tech Mono',monospace"}}>⏺ {briefMode?"end brief":"start brief"}</button>
        <button onClick={()=>setVal(v=>v+"/ref ")} style={{fontSize:10,padding:"2px 8px",borderRadius:20,cursor:"pointer",background:`${C.purple}12`,border:`1px solid ${C.purple}30`,color:C.purple,fontFamily:"'Share Tech Mono',monospace"}}>🔗 /ref</button>
      </div>
    </div>
  );
}

// ── CONTEXT MENU ──────────────────────────────────────────────
function ContextMenu({x,y,text,briefs,onSaveNew,onAddExisting,onClose}) {
  const ref=useRef();
  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))onClose();};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[onClose]);
  return (
    <div ref={ref} style={{position:"fixed",left:Math.min(x,window.innerWidth-200),top:Math.min(y,window.innerHeight-200),zIndex:500,background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:10,padding:6,boxShadow:`0 8px 30px rgba(0,0,0,.6)`,minWidth:180}}>
      <div style={{fontSize:10,color:C.textD,padding:"4px 10px 6px",fontFamily:"'Share Tech Mono',monospace",borderBottom:`1px solid ${C.border}`,marginBottom:4}}>SELECTION</div>
      <button onClick={onSaveNew} style={{display:"block",width:"100%",textAlign:"left",background:"none",border:"none",color:C.textB,fontSize:12,padding:"7px 12px",cursor:"pointer",borderRadius:6}}>📌 Save as new Brief</button>
      {briefs.length>0&&<><div style={{fontSize:10,color:C.textD,padding:"4px 10px 2px",fontFamily:"'Share Tech Mono',monospace"}}>ADD TO EXISTING</div>
      {briefs.map(b=><button key={b.id} onClick={()=>onAddExisting(b.id)} style={{display:"block",width:"100%",textAlign:"left",background:"none",border:"none",color:C.text,fontSize:11,padding:"5px 12px",cursor:"pointer",borderRadius:6}}>→ {b.name}</button>)}</>}
    </div>
  );
}

function BriefSaveModal({text,agents,onSave,onClose}) {
  const [name,setName]=useState("");
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:600}}>
      <div style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,padding:24,width:380,boxShadow:`0 20px 60px rgba(0,0,0,.6)`}}>
        <div style={{fontSize:16,fontWeight:700,color:C.textB,marginBottom:4}}>📌 Save as Brief</div>
        <div style={{fontSize:12,color:C.textD,marginBottom:12}}>Reference later with /ref [name]</div>
        <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:C.text,marginBottom:14,maxHeight:80,overflowY:"auto",lineHeight:1.5}}>{text?.slice(0,200)}{text?.length>200?"...":""}</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Brief name..." autoFocus style={{...S.input,marginBottom:14}} onKeyDown={e=>{if(e.key==="Enter"&&name.trim())onSave(name.trim());}}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{...S.btnGhost,flex:1}}>Cancel</button>
          <button onClick={()=>name.trim()&&onSave(name.trim())} style={{...S.btn(C.cyan),flex:1,opacity:name.trim()?1:.4}}>Save Brief</button>
        </div>
      </div>
    </div>
  );
}

function NewRoomModal({type,onClose,onConfirm}) {
  const [name,setName]=useState("");
  const [selected,setSelected]=useState([]);
  const toggle=id=>type==="office"?setSelected([id]):setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const valid=name.trim()&&selected.length>=(type==="office"?1:2);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:600}}>
      <div style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,padding:24,width:380,boxShadow:`0 20px 60px rgba(0,0,0,.6)`}}>
        <div style={{fontSize:16,fontWeight:700,color:C.textB,marginBottom:4}}>New {type==="studio"?"Studio":"Office"}</div>
        <div style={{fontSize:12,color:C.textD,marginBottom:14}}>{type==="studio"?"Select 2+ agents — becomes a Studio":"Select 1 agent — becomes an Office"}</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name..." autoFocus style={{...S.input,marginBottom:12}} onKeyDown={e=>{if(e.key==="Enter"&&valid)onConfirm({name:name.trim(),agents:selected});}}/>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
          {AGENTS.map(a=>(
            <div key={a.id} onClick={()=>toggle(a.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",background:selected.includes(a.id)?`${a.color}15`:C.bg3,border:`1px solid ${selected.includes(a.id)?a.color+"44":C.border}`}}>
              <span style={{fontSize:18}}>{a.emoji}</span>
              <div><div style={{fontSize:12,color:selected.includes(a.id)?a.color:C.textB,fontWeight:600}}>{a.name}</div><div style={{fontSize:10,color:C.textD}}>{a.role}</div></div>
              {selected.includes(a.id)&&<div style={{marginLeft:"auto",color:a.color,fontWeight:700}}>✓</div>}
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{...S.btnGhost,flex:1}}>Cancel</button>
          <button onClick={()=>valid&&onConfirm({name:name.trim(),agents:selected})} style={{...S.btn(C.cyan),flex:1,opacity:valid?1:.4,cursor:valid?"pointer":"not-allowed"}}>Create</button>
        </div>
      </div>
    </div>
  );
}

// ── BRIEFS PAGE ───────────────────────────────────────────────
function BriefsPage({briefs,onDelete,onRef}) {
  return (
    <div style={{flex:1,overflowY:"auto",padding:24}}>
      <div style={{fontSize:18,fontWeight:700,color:C.textB,marginBottom:4}}>📌 Briefs</div>
      <div style={{fontSize:12,color:C.textD,marginBottom:20}}>Saved conversations. Use /ref [name] to inject into any chat.</div>
      {briefs.length===0&&<div style={{textAlign:"center",padding:"60px 0",color:C.textD}}>
        <div style={{fontSize:32,marginBottom:10}}>📭</div>
        <div style={{fontSize:13}}>No briefs yet. Use /brief start in any chat.</div>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {briefs.map(b=>(
          <div key={b.id} style={{...S.card,transition:"border-color .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.cyan+"44"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:C.textB,marginBottom:2}}>{b.name}</div><div style={{fontSize:10,color:C.textD,fontFamily:"'Share Tech Mono',monospace"}}>{b.date} · {b.project||"Project"}</div></div>
              <button onClick={()=>onDelete(b.id)} style={{background:"none",border:"none",color:C.textD,cursor:"pointer",fontSize:14,padding:2}}>✕</button>
            </div>
            <div style={{fontSize:11,color:C.text,lineHeight:1.5,marginBottom:10,opacity:.7}}>{b.preview}</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>{b.agents.map(a=><Badge key={a} agentId={a}/>)}</div>
            <button onClick={()=>onRef(b.name)} style={{...S.btnGhost,width:"100%",fontSize:11,padding:"6px",border:`1px solid ${C.purple}44`,color:C.purple}}>🔗 /ref {b.name}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────
function Sidebar({activeRoom,setActiveRoom,projects,activeProject,setActiveProject,studios,offices,briefs,onNewStudio,onNewOffice,view,setView}) {
  const [collapsed,setCollapsed]=useState(false);
  const proj=projects.find(p=>p.id===activeProject);
  return (
    <div style={{width:collapsed?52:230,minWidth:collapsed?52:230,height:"100%",background:C.bg2,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",transition:"width .2s,min-width .2s",overflow:"hidden"}}>
      <div style={{padding:"14px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${C.cyan},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>⚡</div>
        {!collapsed&&<span style={{fontSize:12,fontWeight:700,color:C.textB,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1.5}}>DEVSTUDIO</span>}
        <div style={{flex:1}}/>
        <button onClick={()=>setCollapsed(!collapsed)} style={{background:"none",border:"none",color:C.textD,cursor:"pointer",fontSize:14,padding:2}}>{collapsed?"»":"«"}</button>
      </div>
      {!collapsed&&<>
        <div style={{padding:"10px 12px 6px"}}>
          <div style={{fontSize:9,color:C.textD,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",marginBottom:7}}>PROJECTS</div>
          {projects.map(p=>(
            <div key={p.id} onClick={()=>setActiveProject(p.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 8px",borderRadius:7,cursor:"pointer",marginBottom:2,background:activeProject===p.id?`${p.color}14`:"transparent",border:`1px solid ${activeProject===p.id?p.color+"30":"transparent"}`}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:p.color,flexShrink:0,boxShadow:`0 0 6px ${p.color}`}}/>
              <span style={{fontSize:12,color:activeProject===p.id?C.textB:C.text,fontWeight:activeProject===p.id?600:400}}>{p.name}</span>
            </div>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",borderRadius:7,cursor:"pointer",color:C.textD,fontSize:11,border:`1px dashed ${C.border}`,marginTop:4}}>＋ New Project</div>
        </div>
        <div style={{height:1,background:C.border,margin:"4px 12px"}}/>
        <div style={{flex:1,overflowY:"auto",padding:"6px 12px"}}>
          <div style={{fontSize:9,color:C.textD,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",marginBottom:6}}>STUDIOS</div>
          {studios.map(s=><RoomRow key={s.id} room={s} active={view==="chat"&&activeRoom?.id===s.id} onClick={()=>{setActiveRoom(s);setView("chat");}} type="studio"/>)}
          <div onClick={onNewStudio} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 8px",borderRadius:7,cursor:"pointer",color:C.textD,fontSize:11,border:`1px dashed ${C.border}`,marginBottom:10,marginTop:2}}>＋ New Studio</div>
          <div style={{fontSize:9,color:C.textD,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",marginBottom:6}}>OFFICES</div>
          {offices.map(o=><RoomRow key={o.id} room={o} active={view==="chat"&&activeRoom?.id===o.id} onClick={()=>{setActiveRoom(o);setView("chat");}} type="office"/>)}
          <div onClick={onNewOffice} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 8px",borderRadius:7,cursor:"pointer",color:C.textD,fontSize:11,border:`1px dashed ${C.border}`,marginTop:2}}>＋ New Office</div>
        </div>
        <div onClick={()=>setView("briefs")} style={{margin:"6px 12px",padding:"8px 10px",borderRadius:8,cursor:"pointer",background:view==="briefs"?`${C.yellow}12`:"transparent",border:`1px solid ${view==="briefs"?C.yellow+"33":C.border}`,display:"flex",alignItems:"center",gap:8}}>
          <span>📌</span>
          <div><div style={{fontSize:12,color:view==="briefs"?C.yellow:C.text,fontWeight:view==="briefs"?600:400}}>Briefs</div><div style={{fontSize:10,color:C.textD}}>{briefs.length} saved</div></div>
        </div>
        <div style={{borderTop:`1px solid ${C.border}`,padding:"10px 12px",display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.cyan}44,${C.purple}44)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:C.textB}}>H</div>
          <div><div style={{fontSize:12,color:C.textB,fontWeight:600}}>Hatim</div><div style={{fontSize:10,color:C.green,fontFamily:"'Share Tech Mono',monospace"}}>● online</div></div>
        </div>
      </>}
    </div>
  );
}

function RoomRow({room,active,onClick,type}) {
  const [hov,setHov]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 8px",borderRadius:7,cursor:"pointer",marginBottom:2,background:active?`${C.cyan}10`:hov?C.bg3:"transparent",border:`1px solid ${active?C.cyan+"28":"transparent"}`}}>
      <span style={{fontSize:12}}>{type==="studio"?"🎬":"🚪"}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,color:active?C.textB:C.text,fontWeight:active?600:400,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{room.name}</div>
        <div style={{fontSize:10,color:C.textD}}>{room.agents.length} agent{room.agents.length!==1?"s":""}</div>
      </div>
    </div>
  );
}

function RightPanel({agents,typing,briefs,onRefBrief}) {
  return (
    <div style={{width:190,background:C.bg2,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",padding:"14px 10px",gap:6,overflowY:"auto"}}>
      <div style={{fontSize:9,color:C.textD,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",marginBottom:4}}>TEAM</div>
      {agents.map(id=>{
        const a=agentById(id);
        const isTyping=typing.includes(id);
        return a?(
          <div key={id} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 9px",borderRadius:9,background:isTyping?`${a.color}10`:C.bg3,border:`1px solid ${isTyping?a.color+"40":C.border}`,transition:"all .3s"}}>
            <Avatar agentId={id} size={26}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,color:isTyping?a.color:C.textB,fontWeight:600}}>{a.name}</div>
              <div style={{fontSize:9,color:isTyping?a.color:C.textD,fontFamily:"'Share Tech Mono',monospace"}}>{isTyping?"typing...":"online"}</div>
            </div>
            <div style={{width:6,height:6,borderRadius:"50%",background:isTyping?a.color:C.green,boxShadow:`0 0 6px ${isTyping?a.color:C.green}`,flexShrink:0}}/>
          </div>
        ):null;
      })}
      {briefs.length>0&&<>
        <div style={{height:1,background:C.border,margin:"8px 0 4px"}}/>
        <div style={{fontSize:9,color:C.textD,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace",marginBottom:4}}>BRIEFS</div>
        {briefs.slice(0,3).map(b=>(
          <div key={b.id} onClick={()=>onRefBrief(b.name)} style={{...S.card,cursor:"pointer",marginBottom:4}}>
            <div style={{fontSize:11,color:C.textB,fontWeight:600,marginBottom:1}}>{b.name}</div>
            <div style={{fontSize:9,color:C.purple,fontFamily:"'Share Tech Mono',monospace"}}>/ref</div>
          </div>
        ))}
      </>}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function App() {
  const {toasts,toast} = useToast();
  const [view,setView]               = useState("chat");
  const [activeProject,setActiveProject] = useState("p1");
  const [projects]                   = useState(INIT_PROJECTS);
  const [studios,setStudios]         = useState(INIT_STUDIOS);
  const [offices,setOffices]         = useState(INIT_OFFICES);
  const [activeRoom,setActiveRoom]   = useState(INIT_STUDIOS[0]);
  const [messages,setMessages]       = useState({});
  const [typing,setTyping]           = useState([]);
  const [briefMode,setBriefMode]     = useState(false);
  const [briefBuffer,setBriefBuffer] = useState([]);
  const [briefs,setBriefs]           = useState([]);
  const [modal,setModal]             = useState(null);
  const [ctxMenu,setCtxMenu]         = useState(null);
  const [briefSaveModal,setBriefSaveModal] = useState(null);
  const [sending,setSending]         = useState(false);
  const feedRef = useRef();

  const curMsgs = messages[activeRoom?.id] || [];

  useEffect(()=>{
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  },[curMsgs,typing,activeRoom]);

  // ── SEND MESSAGE (real streaming API) ───────────────────────
  const sendMessage = async (text) => {
    if (!activeRoom || sending) return;

    const roomId = activeRoom.id;

    // Optimistically add user message
    const userMsg = { id:uid(), from:"user", text, ts:timeNow() };
    setMessages(m=>({...m,[roomId]:[...(m[roomId]||[]),userMsg]}));
    if (briefMode) setBriefBuffer(b=>[...b,userMsg]);

    // Handle /brief end
    if (text.toLowerCase().includes("/brief end") && briefMode) {
      setBriefSaveModal({ text:briefBuffer.map(m=>m.text).join("\n"), agents:activeRoom.agents });
      setBriefMode(false);
      setBriefBuffer([]);
      return;
    }

    setSending(true);

    try {
      const resp = await fetch(`${API_URL}/api/chat/stream`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          room_id:    roomId,
          agents:     activeRoom.agents,
          text,
          project_id: activeProject,
        }),
      });

      if (!resp.ok) throw new Error(`Server error: ${resp.status}`);

      const reader  = resp.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";
      const streamingMsgs = {}; // agent_id -> msg_id

      while (true) {
        const {done, value} = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, {stream:true});
        const lines = buffer.split("\n");
        buffer = lines.pop(); // incomplete line stays in buffer

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "agent_start") {
              streamingMsgs[event.agent_id] = event.msg_id;
              setTyping(t=>[...t, event.agent_id]);
              // Add empty streaming message
              const initMsg = { id:event.msg_id, from:event.agent_id, text:"", ts:event.ts, streaming:true };
              setMessages(m=>({...m,[roomId]:[...(m[roomId]||[]),initMsg]}));
            }

            if (event.type === "token") {
              const msgId = streamingMsgs[event.agent_id];
              setTyping(t=>t.filter(x=>x!==event.agent_id));
              setMessages(m=>{
                const msgs = m[roomId]||[];
                return {...m,[roomId]:msgs.map(msg=>
                  msg.id===msgId ? {...msg, text:msg.text+event.token, streaming:true} : msg
                )};
              });
            }

            if (event.type === "agent_done") {
              setTyping(t=>t.filter(x=>x!==event.agent_id));
              const msgId = streamingMsgs[event.agent_id];
              setMessages(m=>{
                const msgs = m[roomId]||[];
                return {...m,[roomId]:msgs.map(msg=>
                  msg.id===msgId ? {...msg, text:event.message.text, streaming:false} : msg
                )};
              });
              if (briefMode) {
                setBriefBuffer(b=>[...b, event.message]);
              }
            }

            if (event.type === "done") {
              setTyping([]);
            }

          } catch(_) { /* skip malformed events */ }
        }
      }

    } catch (err) {
      toast(`Connection error: ${err.message}`, "err");
      // Fallback: add error message
      setMessages(m=>({...m,[roomId]:[...(m[roomId]||[]),{
        id:uid(), from:"coord", text:`⚠️ Could not reach the backend. Make sure the server is running at ${API_URL}`, ts:timeNow()
      }]}));
    } finally {
      setSending(false);
      setTyping([]);
    }
  };

  const saveBrief = (name) => {
    const proj = projects.find(p=>p.id===activeProject);
    const b = {
      id:      uid(),
      name,
      date:    new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),
      project: proj?.name||"",
      agents:  briefSaveModal.agents,
      preview: briefSaveModal.text.slice(0,150)+"...",
    };
    setBriefs(bs=>[...bs,b]);
    setBriefSaveModal(null);
    toast(`Brief "${name}" saved 📌`);

    // Also save to backend
    fetch(`${API_URL}/api/briefs`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({...b,project_id:activeProject}),
    }).catch(()=>{});
  };

  const deleteBrief = (id) => {
    setBriefs(b=>b.filter(x=>x.id!==id));
    fetch(`${API_URL}/api/briefs/${id}`,{method:"DELETE"}).catch(()=>{});
    toast("Brief deleted","warn");
  };

  const refBrief = (name) => {
    const ta = document.querySelector("textarea");
    if (ta) { ta.value=`/ref ${name} `; ta.focus(); }
    toast(`/ref ${name} ready to send`);
  };

  const createRoom = ({name,agents}) => {
    const isStudio = modal==="studio" || agents.length>1;
    const id = `${isStudio?"s":"o"}${uid()}`;
    const room = {id,name,agents};
    if (isStudio) setStudios(s=>[...s,room]);
    else          setOffices(o=>[...o,room]);
    setActiveRoom(room);
    setView("chat");
    setModal(null);
    toast(`${isStudio?"Studio":"Office"} "${name}" created`);
  };

  return (
    <div style={{display:"flex",height:"100vh",background:C.bg,fontFamily:"'Exo 2','Segoe UI',sans-serif",color:C.text,overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Exo+2:wght@300;400;600;700&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#1c2840;border-radius:3px;}
        textarea::placeholder,input::placeholder{color:#3d5470;}
        button:hover{filter:brightness(1.12);}
        @keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}
        @keyframes slideIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
      `}</style>

      <Sidebar activeRoom={activeRoom} setActiveRoom={setActiveRoom} projects={projects} activeProject={activeProject} setActiveProject={setActiveProject} studios={studios} offices={offices} briefs={briefs} onNewStudio={()=>setModal("studio")} onNewOffice={()=>setModal("office")} view={view} setView={setView}/>

      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {view==="briefs" ? (
          <BriefsPage briefs={briefs} onDelete={deleteBrief} onRef={refBrief}/>
        ) : <>
          {/* Header */}
          <div style={{padding:"11px 18px",borderBottom:`1px solid ${C.border}`,background:C.bg2,display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:17}}>{activeRoom?.agents?.length>1?"🎬":"🚪"}</div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:C.textB}}>{activeRoom?.name||"—"}</div>
              <div style={{display:"flex",gap:5,marginTop:3,flexWrap:"wrap"}}>{activeRoom?.agents?.map(a=><Badge key={a} agentId={a}/>)}</div>
            </div>
            <div style={{flex:1}}/>
            {briefMode&&<div style={{fontSize:10,color:C.red,background:`${C.red}15`,border:`1px solid ${C.red}33`,borderRadius:20,padding:"3px 10px",fontFamily:"'Share Tech Mono',monospace",display:"flex",alignItems:"center",gap:6}}><div style={{width:7,height:7,borderRadius:"50%",background:C.red,animation:"pulse 1s ease infinite"}}/>REC</div>}
            {sending&&<div style={{fontSize:10,color:C.cyan,fontFamily:"'Share Tech Mono',monospace",animation:"pulse 1s infinite"}}>agents responding...</div>}
            <div style={{fontSize:10,color:C.textD,fontFamily:"'Share Tech Mono',monospace",background:C.bg3,border:`1px solid ${C.border}`,borderRadius:20,padding:"3px 10px"}}>{projects.find(p=>p.id===activeProject)?.name}</div>
          </div>

          {/* Feed */}
          <div ref={feedRef} style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
            {curMsgs.length===0&&!sending&&(
              <div style={{textAlign:"center",padding:"60px 0",color:C.textD}}>
                <div style={{fontSize:38,marginBottom:10}}>{activeRoom?.agents?.length>1?"🎬":"🚪"}</div>
                <div style={{fontSize:14,color:C.text,marginBottom:5}}>{activeRoom?.name}</div>
                <div style={{fontSize:12}}>Your team is ready. Start the conversation.</div>
                <div style={{fontSize:11,marginTop:6,opacity:.5}}>Tip: /brief start to record · /ref to reference briefs · @agent to mention</div>
              </div>
            )}
            {curMsgs.map(m=>(
              <Message key={m.id} msg={m} onRightClick={(e,text)=>setCtxMenu({x:e.clientX,y:e.clientY,text})}/>
            ))}
            {typing.filter(id=>!curMsgs.find(m=>m.from===id&&m.streaming)).map(id=>(
              <TypingIndicator key={id} agentId={id}/>
            ))}
          </div>

          <ChatInput onSend={sendMessage} agents={activeRoom?.agents||[]} briefMode={briefMode} setBriefMode={setBriefMode} disabled={sending}/>
        </>}
      </div>

      {view==="chat"&&activeRoom&&<RightPanel agents={activeRoom.agents} typing={typing} briefs={briefs} onRefBrief={refBrief}/>}

      {modal&&<NewRoomModal type={modal} onClose={()=>setModal(null)} onConfirm={createRoom}/>}
      {briefSaveModal&&<BriefSaveModal text={briefSaveModal.text} agents={briefSaveModal.agents} onSave={saveBrief} onClose={()=>setBriefSaveModal(null)}/>}
      {ctxMenu&&<ContextMenu x={ctxMenu.x} y={ctxMenu.y} text={ctxMenu.text} briefs={briefs}
        onSaveNew={()=>{setBriefSaveModal({text:ctxMenu.text,agents:activeRoom?.agents||[]});setCtxMenu(null);}}
        onAddExisting={id=>{setBriefs(bs=>bs.map(b=>b.id===id?{...b,preview:b.preview+" [+excerpt]"}:b));toast("Added to brief");setCtxMenu(null);}}
        onClose={()=>setCtxMenu(null)}
      />}
      <ToastContainer toasts={toasts}/>
    </div>
  );
}
