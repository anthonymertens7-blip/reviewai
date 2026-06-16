import { useState, useEffect } from "react";
import { useUser, useAuth, UserButton } from "@clerk/clerk-react";

const PLANS = {
  free: { name: "Free", reviews: 3 },
  pro:  { name: "Pro",  reviews: Infinity, price: "9€/mois" },
};

const severityConfig = {
  high:   { color: "#FF4757", bg: "#FF475715", label: "Critique" },
  medium: { color: "#FFA502", bg: "#FFA50215", label: "Moyen" },
  low:    { color: "#2ED573", bg: "#2ED57315", label: "Faible" },
};

const typeIcon = { bug: "🐛", performance: "⚡", style: "✨", security: "🔐" };

const SAMPLE_CODE = `// Gestion des utilisateurs
let tempData = [];

async function getUser(userId) {
  const query = \`SELECT * FROM users WHERE id = \${userId}\`;
  const result = await db.query(query);
  let user = null;
  for (let i = 0; i < result.length; i++) {
    user = users.find(u => u.id === result[i].id);
  }
  return user;
}

const password = "admin1234";
const apiKey = "sk-prod-abc123xyz";`;


function ScoreRing({ score }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#2ED573" : score >= 50 ? "#FFA502" : "#FF4757";
  return (
    <svg width="96" height="96" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx="48" cy="48" r={r} fill="none" stroke="#1a1a2e" strokeWidth="8" />
      <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x="48" y="52" textAnchor="middle"
        style={{ transform: "rotate(90deg) translate(0px,-96px)", fill: color, fontSize: "20px", fontWeight: "700", fontFamily: "monospace" }}>
        {score}
      </text>
    </svg>
  );
}

export default function ReviewApp() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [code, setCode] = useState(SAMPLE_CODE);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState("free");
  const [reviewsUsed, setReviewsUsed] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [activeIssue, setActiveIssue] = useState(null);

  const canReview = plan === "pro" || reviewsUsed < PLANS.free.reviews;

  useEffect(() => {
    if (!user) return;
    getToken().then(token =>
      fetch("/api/status", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setReviewsUsed(d.reviewsUsed || 0))
        .catch(() => {})
    );
  }, [user]);

  async function handleReview() {
    if (!canReview) { setShowUpgrade(true); return; }
    setLoading(true);
    setReview(null);
    setError(null);
    setActiveIssue(null);
    try {
      const token = await getToken();
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.limitReached) { setShowUpgrade(true); return; }
        throw new Error(data.error || "Erreur inconnue");
      }
      setReview(data);
      setReviewsUsed(data.reviewsUsed);
    } catch (err) {
      setError(err.message || "Erreur lors de l'analyse. Réessaie !");
    } finally {
      setLoading(false);
    }
  }

  const countBySeverity = (sev) => review?.issues?.filter(i => i.severity === sev).length || 0;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a14", color: "#e0e0f0",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    }}>
      <div style={{
        position: "fixed", inset: 0, opacity: 0.04, pointerEvents: "none",
        backgroundImage: "linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <header style={{
        padding: "16px 24px", borderBottom: "1px solid #ffffff10",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 10,
        background: "#0a0a14cc",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
          }}>⚙</div>
          <span style={{ fontSize: "16px", fontWeight: "700", color: "#fff" }}>
            review<span style={{ color: "#a855f7" }}>AI</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {plan === "free" && (
            <span style={{ fontSize: "11px", color: "#ffffff50" }}>
              {reviewsUsed}/{PLANS.free.reviews} reviews
            </span>
          )}
          <button onClick={() => setPlan(p => p === "free" ? "pro" : "free")} style={{
            padding: "5px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
            background: plan === "pro" ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "#ffffff15",
            color: "#fff", fontSize: "11px", fontWeight: "600", fontFamily: "inherit",
          }}>
            {plan === "pro" ? "✦ PRO" : "Passer Pro"}
          </button>
          <span style={{ fontSize: "12px", color: "#ffffff60" }}>
            {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
          </span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            display: "inline-block", padding: "4px 12px", borderRadius: "20px",
            background: "#7c3aed20", border: "1px solid #7c3aed50",
            fontSize: "11px", color: "#a855f7", marginBottom: "14px", letterSpacing: "0.1em",
          }}>GÉNÉRATEUR DE CODE REVIEW — PROPULSÉ PAR IA</div>
          <h1 style={{
            fontSize: "clamp(26px, 5vw, 44px)", fontWeight: "800", lineHeight: 1.1, margin: "0 0 10px",
            background: "linear-gradient(135deg, #fff 30%, #a855f7)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Ton code reviewé<br />en quelques secondes</h1>
          <p style={{ color: "#ffffff60", fontSize: "13px", margin: 0 }}>
            Bugs • Sécurité • Performance • Best practices
          </p>
        </div>

        <div style={{
          background: "#0d0d1a", border: "1px solid #ffffff12", borderRadius: "12px",
          overflow: "hidden", marginBottom: "14px",
        }}>
          <div style={{
            padding: "10px 16px", borderBottom: "1px solid #ffffff08",
            display: "flex", alignItems: "center", gap: "8px", background: "#0a0a12",
          }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map(c => (
              <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
            ))}
            <span style={{ marginLeft: "8px", fontSize: "11px", color: "#ffffff30" }}>code.js</span>
          </div>
          <textarea value={code} onChange={e => setCode(e.target.value)} style={{
            width: "100%", minHeight: "200px", background: "transparent",
            border: "none", outline: "none", color: "#c9d1d9", fontSize: "13px",
            lineHeight: "1.7", padding: "20px", resize: "vertical",
            boxSizing: "border-box", fontFamily: "inherit",
          }} placeholder="// Colle ton code ici..." />
        </div>

        <button onClick={handleReview} disabled={loading || !code.trim()} style={{
          width: "100%", padding: "16px", borderRadius: "10px", border: "none",
          cursor: loading ? "wait" : "pointer",
          background: loading ? "#ffffff15" : "linear-gradient(135deg, #7c3aed, #a855f7)",
          color: "#fff", fontSize: "15px", fontWeight: "700", fontFamily: "inherit",
          transition: "all 0.2s", opacity: !code.trim() ? 0.4 : 1,
          boxShadow: loading ? "none" : "0 8px 32px #7c3aed40",
        }}>
          {loading ? "⟳ Analyse IA en cours..." : "⚡ Lancer la review"}
        </button>

        {loading && (
          <div style={{ marginTop: "12px", height: "2px", background: "#ffffff10", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: "40%", borderRadius: "2px",
              background: "linear-gradient(90deg, #7c3aed, #a855f7)",
              animation: "slide 1.5s ease-in-out infinite",
            }} />
            <style>{`@keyframes slide { 0%{margin-left:-40%} 100%{margin-left:140%} }`}</style>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: "16px", padding: "14px 16px",
            background: "#FF475715", border: "1px solid #FF475740",
            borderRadius: "8px", color: "#FF4757", fontSize: "13px",
          }}>⚠ {error}</div>
        )}

        {review && (
          <div style={{ marginTop: "28px", animation: "fadeIn 0.4s ease" }}>
            <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }`}</style>
            <div style={{
              background: "#0d0d1a", border: "1px solid #ffffff12", borderRadius: "12px",
              padding: "24px", display: "flex", gap: "24px", alignItems: "center",
              marginBottom: "14px", flexWrap: "wrap",
            }}>
              <ScoreRing score={review.score} />
              <div style={{ flex: 1, minWidth: "180px" }}>
                <div style={{ fontSize: "10px", color: "#ffffff40", marginBottom: "6px", letterSpacing: "0.1em" }}>SCORE QUALITÉ</div>
                <div style={{ fontSize: "14px", color: "#ffffff90", lineHeight: "1.5" }}>{review.summary}</div>
                <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {countBySeverity("high") > 0 && <span style={{ padding: "3px 10px", borderRadius: "20px", background: "#FF475720", fontSize: "11px", color: "#FF4757" }}>🔴 {countBySeverity("high")} critique{countBySeverity("high") > 1 ? "s" : ""}</span>}
                  {countBySeverity("medium") > 0 && <span style={{ padding: "3px 10px", borderRadius: "20px", background: "#FFA50220", fontSize: "11px", color: "#FFA502" }}>🟡 {countBySeverity("medium")} moyen{countBySeverity("medium") > 1 ? "s" : ""}</span>}
                  {countBySeverity("low") > 0 && <span style={{ padding: "3px 10px", borderRadius: "20px", background: "#2ED57320", fontSize: "11px", color: "#2ED573" }}>🟢 {countBySeverity("low")} faible{countBySeverity("low") > 1 ? "s" : ""}</span>}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {review.issues.map((issue, i) => {
                const sev = severityConfig[issue.severity] || severityConfig.low;
                const isActive = activeIssue === i;
                return (
                  <div key={i} onClick={() => setActiveIssue(isActive ? null : i)} style={{
                    background: "#0d0d1a",
                    border: `1px solid ${isActive ? sev.color + "50" : "#ffffff10"}`,
                    borderLeft: `3px solid ${sev.color}`,
                    borderRadius: "10px", padding: "16px", cursor: "pointer", transition: "all 0.2s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span>{typeIcon[issue.type] || "💡"}</span>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>{issue.title}</span>
                        {issue.line > 0 && <span style={{ fontSize: "10px", color: "#ffffff40" }}>ligne {issue.line}</span>}
                      </div>
                      <span style={{
                        padding: "2px 8px", borderRadius: "4px", background: sev.bg, color: sev.color,
                        fontSize: "10px", fontWeight: "700", whiteSpace: "nowrap",
                      }}>{sev.label}</span>
                    </div>
                    {isActive && (
                      <div style={{ marginTop: "12px" }}>
                        <p style={{ margin: "0 0 10px", color: "#ffffff70", fontSize: "13px", lineHeight: "1.6" }}>{issue.description}</p>
                        {issue.fix && (
                          <div style={{ background: "#0a0a12", borderRadius: "6px", padding: "10px 14px", border: "1px solid #2ED57330" }}>
                            <div style={{ fontSize: "10px", color: "#2ED573", marginBottom: "4px" }}>✓ FIX SUGGÉRÉ</div>
                            <code style={{ fontSize: "12px", color: "#c9d1d9", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{issue.fix}</code>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showUpgrade && (
          <div style={{
            position: "fixed", inset: 0, background: "#00000080",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, backdropFilter: "blur(4px)",
          }} onClick={() => setShowUpgrade(false)}>
            <div style={{
              background: "#0d0d1a", border: "1px solid #7c3aed50", borderRadius: "16px",
              padding: "32px", maxWidth: "360px", width: "90%", textAlign: "center",
            }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>✦</div>
              <h2 style={{ margin: "0 0 8px", fontSize: "20px", color: "#fff" }}>Limite atteinte</h2>
              <p style={{ color: "#ffffff60", fontSize: "13px", margin: "0 0 24px", lineHeight: "1.6" }}>
                Tu as utilisé tes 3 reviews gratuites.<br />Passe à Pro pour des reviews illimitées.
              </p>
              <div style={{ background: "#ffffff08", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#a855f7" }}>9€<span style={{ fontSize: "14px", color: "#ffffff50" }}>/mois</span></div>
                <div style={{ fontSize: "12px", color: "#ffffff60", marginTop: "4px" }}>Reviews illimitées • Fixes détaillés • Priorité</div>
              </div>
              <button onClick={() => { setPlan("pro"); setShowUpgrade(false); }} style={{
                width: "100%", padding: "14px",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                border: "none", borderRadius: "8px", color: "#fff",
                fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit",
              }}>Passer à Pro →</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}