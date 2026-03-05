import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import Auth from "./Auth.jsx";
import App from "./studio.jsx";

function Root() {
  const [session, setSession] = useState(null);
  if (!session) return <Auth onAuth={setSession} />;
  return <App session={session} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
