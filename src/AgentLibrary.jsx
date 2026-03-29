import { useState } from "react";

const C = {
  bg:"#070a0f", bg2:"#0b0f18", bg3:"#0f1520",
  border:"#1a2535", border2:"#1f2e42",
  text:"#9bb5d5", textB:"#ddeeff", textD:"#3d5470",
  cyan:"#00d4ff", green:"#00ff88", purple:"#a855f7",
  yellow:"#ffd700", orange:"#ff8c42", pink:"#ff4da6",
  red:"#ff3355",
};

const ALL_AGENTS = [
  // Core Team
  { id:"coord",       emoji:"🎯", name:"Project Manager",          color:C.green,  cat:"Core Team",        role:"Schedules, milestones, keeps team on track" },
  { id:"designer",    emoji:"🎨", name:"Game Designer",             color:C.cyan,   cat:"Core Team",        role:"Mechanics, systems, core loop design" },
  { id:"prog",        emoji:"💻", name:"Programmer",                color:C.orange, cat:"Core Team",        role:"Implementation, code, technical architecture" },
  { id:"analyst",     emoji:"📊", name:"Balance Analyst",           color:C.purple, cat:"Core Team",        role:"Numbers, difficulty curves, progression balance" },
  { id:"market",      emoji:"📣", name:"Marketing Manager",         color:C.pink,   cat:"Core Team",        role:"Audience, social media, devlogs, positioning" },
  { id:"uiux",        emoji:"🖼️", name:"UI/UX Designer",            color:"#60efff", cat:"Core Team",       role:"Menus, HUD, player interface design" },
  // Art & Audio
  { id:"sound",       emoji:"🎵", name:"Sound Designer",            color:"#b084f7", cat:"Art & Audio",     role:"SFX, music direction, audio feedback loops" },
  { id:"chararist",   emoji:"🎭", name:"Character Artist",          color:"#ff6b9d", cat:"Art & Audio",     role:"Character design, personality, visual identity" },
  { id:"envarst",     emoji:"🌍", name:"Environment Artist",        color:"#4ade80", cat:"Art & Audio",     role:"World building, level aesthetics, atmosphere" },
  { id:"concept",     emoji:"✏️", name:"Concept Artist",            color:"#fbbf24", cat:"Art & Audio",     role:"Early visuals, mood boards, art direction" },
  { id:"anim",        emoji:"🎬", name:"Animator",                  color:"#f97316", cat:"Art & Audio",     role:"Movement, feel, character animation direction" },
  // Writing & Narrative
  { id:"narrative",   emoji:"📖", name:"Narrative Designer",        color:"#818cf8", cat:"Writing",         role:"Story, world lore, plot structure, narrative systems" },
  { id:"dialogue",    emoji:"✍️", name:"Dialogue Writer",           color:"#a78bfa", cat:"Writing",         role:"Character voice, conversations, scripts" },
  { id:"leveldes",    emoji:"🗺️", name:"Level Designer",            color:"#34d399", cat:"Writing",         role:"Layout, pacing, player flow through spaces" },
  { id:"puzzle",      emoji:"🧩", name:"Puzzle Designer",           color:"#60a5fa", cat:"Writing",         role:"Challenge design, logic puzzles, difficulty" },
  // Production & Business
  { id:"monetise",    emoji:"💰", name:"Monetisation Strategist",   color:C.yellow, cat:"Business",         role:"IAP, ads, pricing, ethical monetisation design" },
  { id:"growth",      emoji:"📈", name:"Growth Hacker",             color:"#10b981", cat:"Business",        role:"ASO, virality loops, retention strategies" },
  { id:"publisher",   emoji:"🤝", name:"Publisher Relations",       color:"#6ee7b7", cat:"Business",        role:"Pitch decks, finding publishers, deal advice" },
  { id:"qa",          emoji:"📋", name:"QA Tester",                 color:"#94a3b8", cat:"Business",        role:"Bug mindset, edge cases, test plans" },
  // Niche Specialists
  { id:"psychologist",emoji:"🧠", name:"Player Psychologist",       color:"#c084fc", cat:"Specialists",     role:"Motivation, dopamine loops, engagement design" },
  { id:"localise",    emoji:"🌐", name:"Localisation Manager",      color:"#22d3ee", cat:"Specialists",     role:"Global markets, cultural sensitivity, translation" },
  { id:"access",      emoji:"♿", name:"Accessibility Consultant",  color:"#86efac", cat:"Specialists",     role:"Making games playable for everyone" },
  { id:"viral",       emoji:"🔥", name:"Viral Content Creator",     color:"#fb923c", cat:"Specialists",     role:"TikTok/YouTube clips, shareable game moments" },
  { id:"aisystems",   emoji:"🤖", name:"AI Systems Designer",       color:"#38bdf8", cat:"Specialists",     role:"Procedural generation, AI enemies, dynamic systems" },
  { id:"lawyer",      emoji:"⚖️", name:"Games Lawyer",              color:"#fcd34d", cat:"Specialists",     role:"IP, contracts, platform terms (not real legal advice)" },
];

const CATEGORIES = ["All", "Core Team", "Art & Audio", "Writing", "Business", "Specialists"];

export default function AgentLibrary({ onClose, usedAgents = [], onAddAgent }) {
  const [cat,    setCat]    = useState("All");
  const [search, setSearch] = useState("");
  const [added,  setAdded]  = useState(new Set());

  const filtered = ALL_AGENTS.filter(a => {
    const matchCat    = cat === "All" || a.cat === cat;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = (agent) => {
    if (usedAgents.includes(agent.id) || added.has(agent.id)) return;
    onAddAgent(agent);
    setAdded(prev => new Set([...prev, agent.id]));
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.85)",
      backdropFilter:"blur(6px)", display:"flex", alignItems:"center",
      justifyContent:"center", zIndex:600, padding:20,
      fontFamily:"'Exo 2', sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Exo+2:wght@300;400;600;700;800&display=swap');`}</style>

      <div style={{
        background:C.bg2, border:`1px solid ${C.border2}`,
        borderRadius:20, width:"100%", maxWidth:720,
        maxHeight:"88vh", display:"flex", flexDirection:"column",
        boxShadow:"0 40px 100px rgba(0,0,0,.8)",
      }}>

        {/* Header */}
        <div style={{padding:"20px 24px 0", borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex", alignItems:"center", marginBottom:16}}>
            <div>
              <div style={{fontSize:18, fontWeight:800, color:C.textB}}>Agent Library</div>
              <div style={{fontSize:12, color:C.textD}}>25 specialist agents — add any to your project</div>
            </div>
            <div style={{flex:1}}/>
            <button onClick={onClose} style={{background:"none",border:"none",color:C.textD,fontSize:20,cursor:"pointer",padding:4}}>✕</button>
          </div>

          {/* Search */}
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search agents..."
            style={{
              width:"100%", background:C.bg3, border:`1px solid ${C.border2}`,
              borderRadius:10, padding:"9px 14px", color:C.textB, fontSize:13,
              outline:"none", fontFamily:"'Exo 2',sans-serif", marginBottom:14,
              boxSizing:"border-box",
            }}
          />

          {/* Category tabs */}
          <div style={{display:"flex", gap:6, overflowX:"auto", paddingBottom:1}}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={()=>setCat(c)} style={{
                padding:"5px 14px", borderRadius:20, border:"none", cursor:"pointer",
                fontFamily:"'Exo 2',sans-serif", fontSize:11, fontWeight:600,
                whiteSpace:"nowrap", flexShrink:0,
                background: cat===c ? C.cyan : C.bg3,
                color: cat===c ? "#000" : C.textD,
              }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Agent Grid */}
        <div style={{flex:1, overflowY:"auto", padding:20}}>
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",
            gap:10,
          }}>
            {filtered.map(agent => {
              const isUsed    = usedAgents.includes(agent.id);
              const justAdded = added.has(agent.id);
              const taken     = isUsed || justAdded;

              return (
                <div key={agent.id} style={{
                  background: C.bg3,
                  border:`1px solid ${taken ? agent.color+"33" : C.border}`,
                  borderRadius:12, padding:"14px",
                  display:"flex", alignItems:"center", gap:12,
                  opacity: taken ? 0.6 : 1,
                  transition:"border-color .2s, opacity .2s",
                }}
                  onMouseEnter={e=>{ if(!taken) e.currentTarget.style.borderColor=agent.color+"55"; }}
                  onMouseLeave={e=>{ if(!taken) e.currentTarget.style.borderColor=C.border; }}
                >
                  {/* Emoji */}
                  <div style={{
                    width:44, height:44, borderRadius:12, flexShrink:0,
                    background:`${agent.color}18`, border:`1.5px solid ${agent.color}40`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                  }}>{agent.emoji}</div>

                  {/* Info */}
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13, fontWeight:700, color:C.textB, marginBottom:2}}>{agent.name}</div>
                    <div style={{fontSize:10, color:C.textD, lineHeight:1.4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{agent.role}</div>
                    <div style={{
                      fontSize:9, color:agent.color, fontFamily:"'Share Tech Mono',monospace",
                      letterSpacing:1, marginTop:4, textTransform:"uppercase",
                    }}>{agent.cat}</div>
                  </div>

                  {/* Add button */}
                  <button
                    onClick={()=>handleAdd(agent)}
                    disabled={taken}
                    style={{
                      padding:"6px 14px", borderRadius:8, border:"none",
                      background: justAdded ? `${C.green}22` : taken ? C.bg3 : `${agent.color}22`,
                      color: justAdded ? C.green : taken ? C.textD : agent.color,
                      border: `1px solid ${justAdded ? C.green+"44" : taken ? C.border : agent.color+"44"}`,
                      fontFamily:"'Exo 2',sans-serif", fontSize:11, fontWeight:700,
                      cursor: taken ? "not-allowed" : "pointer",
                      flexShrink:0, whiteSpace:"nowrap",
                      transition:"all .2s",
                    }}
                  >
                    {justAdded ? "✓ Added" : isUsed ? "In project" : "+ Add"}
                  </button>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{textAlign:"center", padding:"60px 0", color:C.textD}}>
              <div style={{fontSize:32, marginBottom:10}}>🔍</div>
              <div style={{fontSize:13}}>No agents match your search.</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding:"12px 24px", borderTop:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", gap:8,
          fontSize:11, color:C.textD,
        }}>
          <span>{ALL_AGENTS.length} agents total</span>
          <span style={{color:C.border}}>·</span>
          <span style={{color:C.green}}>{usedAgents.length + added.size} in your project</span>
          <div style={{flex:1}}/>
          <button onClick={onClose} style={{
            padding:"7px 18px", borderRadius:8, border:`1px solid ${C.border2}`,
            background:"none", color:C.text, cursor:"pointer",
            fontFamily:"'Exo 2',sans-serif", fontSize:12,
          }}>Done</button>
        </div>
      </div>
    </div>
  );
}

// Export the full agent list so studio.jsx can use it
export { ALL_AGENTS };
