import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import Auth from "./Auth.jsx";
import App from "./studio.jsx";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function Root() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    // Get initial session — handles OAuth hash in URL automatically
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    // Listen for all auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Still loading — show nothing to avoid flash
  if (session === undefined) {
    return (
      <div style={{
        height: "100vh", background: "#070a0f",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "linear-gradient(135deg,#00d4ff,#a855f7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, animation: "pulse 1s ease infinite",
        }}>⚡</div>
        <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
      </div>
    );
  }

  if (!session) return <Auth onAuth={setSession} supabase={supabase} />;
  return <App session={session} supabase={supabase} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
