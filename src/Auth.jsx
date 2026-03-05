import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON    = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase         = createClient(SUPABASE_URL, SUPABASE_ANON);

const C = {
  bg:"#070a0f", bg2:"#0b0f18", bg3:"#0f1520",
  border:"#1a2535", border2:"#1f2e42",
  text:"#9bb5d5", textB:"#ddeeff", textD:"#3d5470",
  cyan:"#00d4ff", cyanD:"#0099cc",
  green:"#00ff88", purple:"#a855f7",
  red:"#ff3355", yellow:"#ffd700",
};

function GlowOrb({ x, y, color, size = 300 }) {
  return (
    <div style={{
      position: "fixed", left: x, top: y, width: size, height: size,
      borderRadius: "50%", background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
      pointerEvents: "none", zIndex: 0, transform: "translate(-50%,-50%)",
      filter: "blur(40px)",
    }} />
  );
}

export default function Auth({ onAuth }) {
  const [mode, setMode]       = useState("login"); // "login" | "signup" | "verify"
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [name, setName]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [info, setInfo]       = useState("");

  // Check if already logged in or returning from OAuth redirect
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) onAuth(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        onAuth(session);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleEmail = async () => {
    setLoading(true); setError(""); setInfo("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { name } },
        });
        if (error) throw error;
        setMode("verify");
        setInfo("Check your email for a confirmation link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const handleGitHub = async () => {
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const inputStyle = {
    width: "100%", background: C.bg3, border: `1px solid ${C.border2}`,
    borderRadius: 10, padding: "12px 14px", color: C.textB, fontSize: 14,
    outline: "none", fontFamily: "'Exo 2', sans-serif", boxSizing: "border-box",
    transition: "border-color .2s",
  };

  const btnPrimary = {
    width: "100%", padding: "13px", borderRadius: 10, border: "none",
    background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanD})`,
    color: "#000", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "'Exo 2', sans-serif", opacity: loading ? 0.6 : 1,
    transition: "opacity .2s",
  };

  const btnOAuth = (color) => ({
    width: "100%", padding: "12px", borderRadius: 10,
    background: C.bg3, border: `1px solid ${color}33`,
    color: C.textB, fontWeight: 600, fontSize: 13, cursor: "pointer",
    fontFamily: "'Exo 2', sans-serif", display: "flex", alignItems: "center",
    justifyContent: "center", gap: 10, transition: "border-color .2s, background .2s",
  });

  if (mode === "verify") {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:C.bg, fontFamily:"'Exo 2',sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Exo+2:wght@300;400;600;700;800&display=swap');`}</style>
        <GlowOrb x="30%" y="30%" color={C.cyan} size={400}/>
        <div style={{ textAlign:"center", padding:40, maxWidth:360, position:"relative", zIndex:1 }}>
          <div style={{ fontSize:48, marginBottom:20 }}>📬</div>
          <div style={{ fontSize:22, fontWeight:700, color:C.textB, marginBottom:10 }}>Check your email</div>
          <div style={{ fontSize:14, color:C.text, lineHeight:1.6, marginBottom:24 }}>
            We sent a confirmation link to <span style={{color:C.cyan}}>{email}</span>. Click it to activate your account.
          </div>
          <button onClick={()=>setMode("login")} style={{...btnPrimary, width:"auto", padding:"10px 24px"}}>
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display:"flex", height:"100vh", background:C.bg,
      fontFamily:"'Exo 2', sans-serif", overflow:"hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Exo+2:wght@300;400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #3d5470; }
        input:focus { border-color: #00d4ff55 !important; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }
      `}</style>

      {/* Glow orbs */}
      <GlowOrb x="20%"  y="20%"  color={C.cyan}   size={500}/>
      <GlowOrb x="80%"  y="70%"  color={C.purple}  size={400}/>
      <GlowOrb x="50%"  y="100%" color={C.green}   size={300}/>

      {/* Left panel — branding */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"60px 80px", position:"relative", zIndex:1,
      }}>
        {/* Logo */}
        <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:60}}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:`linear-gradient(135deg,${C.cyan},${C.purple})`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
          }}>⚡</div>
          <span style={{fontSize:14, fontWeight:700, color:C.textB, fontFamily:"'Share Tech Mono',monospace", letterSpacing:2}}>DEVSTUDIO</span>
        </div>

        <div style={{animation:"fadeUp .6s ease both"}}>
          <div style={{fontSize:11, color:C.cyan, fontFamily:"'Share Tech Mono',monospace", letterSpacing:3, marginBottom:16}}>YOUR AI CREATIVE TEAM</div>
          <h1 style={{fontSize:"clamp(32px,4vw,56px)", fontWeight:800, color:C.textB, lineHeight:1.1, marginBottom:20, margin:"0 0 20px"}}>
            Stop working<br/>
            <span style={{background:`linear-gradient(135deg,${C.cyan},${C.purple})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              alone.
            </span>
          </h1>
          <p style={{fontSize:16, color:C.text, lineHeight:1.7, maxWidth:380, margin:"0 0 48px"}}>
            Your AI studio is ready. Designer, Programmer, Analyst and more — collaborating on your ideas in real time.
          </p>
        </div>

        {/* Agent previews */}
        <div style={{display:"flex", flexDirection:"column", gap:10, animation:"fadeUp .6s .2s ease both", opacity:0, animationFillMode:"forwards"}}>
          {[
            {emoji:"🎯", name:"Coordinator", color:C.green,  msg:"I've broken down your goal into 5 tasks..."},
            {emoji:"🎨", name:"Designer",    color:C.cyan,   msg:"I'd recommend Option A for the core loop..."},
            {emoji:"💻", name:"Programmer",  color:"#ff8c42",msg:"Estimated 2-3 days for the prototype..."},
          ].map((a,i)=>(
            <div key={a.name} style={{
              display:"flex", alignItems:"center", gap:12, padding:"10px 14px",
              background:C.bg2, border:`1px solid ${a.color}25`,
              borderRadius:12, animation:`float ${3+i*.5}s ease-in-out infinite`,
              animationDelay:`${i*.3}s`, maxWidth:380,
            }}>
              <div style={{
                width:32, height:32, borderRadius:"50%", flexShrink:0,
                background:`${a.color}22`, border:`1.5px solid ${a.color}44`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:15,
              }}>{a.emoji}</div>
              <div>
                <div style={{fontSize:11, color:a.color, fontWeight:700, fontFamily:"'Share Tech Mono',monospace", marginBottom:2}}>{a.name}</div>
                <div style={{fontSize:12, color:C.text}}>{a.msg}</div>
              </div>
              <div style={{marginLeft:"auto", display:"flex", gap:3}}>
                {[0,1,2].map(j=><div key={j} style={{width:5,height:5,borderRadius:"50%",background:a.color,animation:"pulse 1s ease infinite",animationDelay:`${j*.15}s`}}/>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — auth form */}
      <div style={{
        width: 420, background:C.bg2, borderLeft:`1px solid ${C.border}`,
        display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"48px 40px", position:"relative", zIndex:1,
      }}>
        <div style={{animation:"fadeUp .4s ease both"}}>
          <div style={{fontSize:22, fontWeight:700, color:C.textB, marginBottom:4}}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </div>
          <div style={{fontSize:13, color:C.textD, marginBottom:28}}>
            {mode === "login" ? "Sign in to your studio" : "Start building with your AI team"}
          </div>

          {/* OAuth buttons */}
          <div style={{display:"flex", flexDirection:"column", gap:8, marginBottom:20}}>
            <button onClick={handleGoogle} disabled={loading} style={btnOAuth(C.cyan)}
              onMouseEnter={e=>e.currentTarget.style.borderColor=`${C.cyan}66`}
              onMouseLeave={e=>e.currentTarget.style.borderColor=`${C.cyan}33`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button onClick={handleGitHub} disabled={loading} style={btnOAuth(C.textD)}
              onMouseEnter={e=>e.currentTarget.style.borderColor=`${C.textD}66`}
              onMouseLeave={e=>e.currentTarget.style.borderColor=`${C.textD}33`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={C.textB}>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:20}}>
            <div style={{flex:1, height:1, background:C.border}}/>
            <span style={{fontSize:11, color:C.textD, fontFamily:"'Share Tech Mono',monospace"}}>OR</span>
            <div style={{flex:1, height:1, background:C.border}}/>
          </div>

          {/* Email form */}
          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            {mode === "signup" && (
              <input
                value={name} onChange={e=>setName(e.target.value)}
                placeholder="Your name" style={inputStyle}
              />
            )}
            <input
              type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="Email address" style={inputStyle}
              onKeyDown={e=>e.key==="Enter"&&handleEmail()}
            />
            <input
              type="password" value={password} onChange={e=>setPass(e.target.value)}
              placeholder="Password" style={inputStyle}
              onKeyDown={e=>e.key==="Enter"&&handleEmail()}
            />
          </div>

          {error && (
            <div style={{fontSize:12, color:C.red, background:`${C.red}12`, border:`1px solid ${C.red}30`, borderRadius:8, padding:"8px 12px", marginTop:12}}>
              {error}
            </div>
          )}
          {info && (
            <div style={{fontSize:12, color:C.green, background:`${C.green}12`, border:`1px solid ${C.green}30`, borderRadius:8, padding:"8px 12px", marginTop:12}}>
              {info}
            </div>
          )}

          <button onClick={handleEmail} disabled={loading} style={{...btnPrimary, marginTop:16}}>
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>

          <div style={{textAlign:"center", marginTop:20, fontSize:13, color:C.textD}}>
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <span onClick={()=>{setMode("signup");setError("");}} style={{color:C.cyan, cursor:"pointer", fontWeight:600}}>Sign up free</span>
              </>
            ) : (
              <>Already have an account?{" "}
                <span onClick={()=>{setMode("login");setError("");}} style={{color:C.cyan, cursor:"pointer", fontWeight:600}}>Sign in</span>
              </>
            )}
          </div>

          <div style={{marginTop:24, fontSize:11, color:C.textD, textAlign:"center", lineHeight:1.6}}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
