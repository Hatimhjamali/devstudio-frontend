import { useState } from "react";

const C = {
  bg:"#070a0f", bg2:"#0b0f18", bg3:"#0f1520",
  border:"#1a2535", text:"#9bb5d5", textB:"#ddeeff", textD:"#3d5470",
  cyan:"#00d4ff",
};

const TERMS = `
# Terms of Service

**Last updated: March 2026**

## 1. Acceptance
By using DevStudio you agree to these terms. If you do not agree, do not use the service.

## 2. Description
DevStudio is an AI-powered creative studio that provides access to multiple AI agents to assist with game development and creative projects.

## 3. Account
You must provide accurate information when creating an account. You are responsible for keeping your account secure. You must be at least 13 years old to use DevStudio.

## 4. Free and Pro Plans
The free plan includes 3 sessions per day, 1 project, and 5 briefs. The Pro plan (₹400/month) includes unlimited sessions, projects, briefs, and custom agents. We reserve the right to change pricing with 30 days notice.

## 5. Payments
Payments are processed by Razorpay. Subscriptions renew monthly. You may cancel at any time. No refunds for partial months.

## 6. Your Content
You own the content you create using DevStudio. We do not claim ownership of your projects, briefs, or conversations. We may use anonymised, aggregated data to improve the service.

## 7. Acceptable Use
You may not use DevStudio to create harmful, illegal, or abusive content. You may not attempt to reverse engineer or copy the service. You may not share your account with others.

## 8. AI Limitations
AI agents may produce inaccurate or incomplete information. DevStudio is a tool to assist your work, not replace professional judgement. We are not responsible for decisions made based on AI output.

## 9. Availability
We aim for high availability but do not guarantee uninterrupted service. Free tier instances may experience delays due to hosting limitations.

## 10. Termination
We may suspend or terminate accounts that violate these terms. You may delete your account at any time.

## 11. Liability
DevStudio is provided as-is. We are not liable for any damages arising from use of the service. Our total liability is limited to the amount you paid in the last 30 days.

## 12. Changes
We may update these terms at any time. Continued use of the service constitutes acceptance of updated terms.

## 13. Contact
For questions about these terms, contact us at support@devstudio.io
`;

const PRIVACY = `
# Privacy Policy

**Last updated: March 2026**

## 1. What We Collect
We collect information you provide when signing up (name, email), content you create (projects, messages, briefs), and usage data (session counts, feature usage). When signing in with Google or GitHub we receive your name, email, and profile picture.

## 2. How We Use It
We use your data to provide the DevStudio service, save your projects and conversations, enforce plan limits, and improve the product. We do not sell your data to third parties.

## 3. AI Processing
Your messages are sent to Groq (our AI provider) to generate responses. Groq processes these messages according to their own privacy policy. We do not store raw AI model inputs beyond what is necessary to provide conversation history.

## 4. Data Storage
Your data is stored in Supabase (PostgreSQL database) with row-level security — only you can access your own data. Data is stored in servers located in Singapore.

## 5. Payments
Payment information is handled entirely by Razorpay. We do not store card numbers, UPI IDs, or other payment details on our servers.

## 6. Cookies
We use cookies only for authentication (keeping you logged in). We do not use advertising or tracking cookies.

## 7. Third Party Services
DevStudio uses: Supabase (database and auth), Groq (AI), Razorpay (payments), Render (backend hosting), Vercel (frontend hosting). Each has their own privacy policy.

## 8. Data Retention
We retain your data as long as your account is active. If you delete your account, your profile data is removed. Project and message data is retained for service continuity.

## 9. Your Rights
You may request a copy of your data, correct inaccurate data, or delete your account at any time by contacting us.

## 10. Children
DevStudio is not intended for children under 13. We do not knowingly collect data from children under 13.

## 11. Changes
We may update this policy. We will notify users of significant changes by email.

## 12. Contact
For privacy questions, contact us at privacy@devstudio.io
`;

function renderMd(text) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("# "))  return <h1 key={i} style={{fontSize:24,fontWeight:800,color:C.textB,margin:"0 0 8px"}}>{line.slice(2)}</h1>;
    if (line.startsWith("## ")) return <h2 key={i} style={{fontSize:16,fontWeight:700,color:C.textB,margin:"24px 0 8px",paddingTop:16,borderTop:`1px solid ${C.border}`}}>{line.slice(3)}</h2>;
    if (line.startsWith("**") && line.endsWith("**")) return <p key={i} style={{fontSize:12,color:C.textD,margin:"0 0 20px"}}>{line.slice(2,-2)}</p>;
    if (!line.trim()) return <div key={i} style={{height:4}}/>;
    return <p key={i} style={{fontSize:13,color:C.text,lineHeight:1.7,margin:"0 0 6px"}}>{line}</p>;
  });
}

export default function Legal({ onClose }) {
  const [tab, setTab] = useState("terms");

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.85)",
      backdropFilter:"blur(6px)", display:"flex", alignItems:"center",
      justifyContent:"center", zIndex:700, fontFamily:"'Exo 2',sans-serif",
      padding:20,
    }}>
      <div style={{
        background:C.bg2, border:`1px solid #1f2e42`,
        borderRadius:20, width:"100%", maxWidth:640, maxHeight:"85vh",
        display:"flex", flexDirection:"column",
        boxShadow:"0 30px 80px rgba(0,0,0,.7)",
      }}>
        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", padding:"16px 20px",
          borderBottom:`1px solid ${C.border}`, gap:10,
        }}>
          <div style={{display:"flex", gap:6}}>
            {["terms","privacy"].map(t => (
              <button key={t} onClick={()=>setTab(t)} style={{
                padding:"6px 16px", borderRadius:20, border:"none", cursor:"pointer",
                fontFamily:"'Exo 2',sans-serif", fontSize:12, fontWeight:600,
                background: tab===t ? C.cyan : C.bg3,
                color: tab===t ? "#000" : C.textD,
              }}>
                {t === "terms" ? "Terms of Service" : "Privacy Policy"}
              </button>
            ))}
          </div>
          <div style={{flex:1}}/>
          <button onClick={onClose} style={{
            background:"none", border:"none", color:C.textD,
            fontSize:18, cursor:"pointer", padding:4,
          }}>✕</button>
        </div>

        {/* Content */}
        <div style={{flex:1, overflowY:"auto", padding:"24px 28px"}}>
          {renderMd(tab === "terms" ? TERMS : PRIVACY)}
        </div>

        <div style={{
          padding:"12px 20px", borderTop:`1px solid ${C.border}`,
          fontSize:11, color:C.textD, textAlign:"center",
        }}>
          © 2026 Hatim Jamali. All rights reserved.
        </div>
      </div>
    </div>
  );
}
