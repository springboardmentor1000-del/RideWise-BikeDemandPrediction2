import "../../styles/dashboard.css";

/* ===================== HOME PAGE ===================== */

export default function Home() {
  return (
    <div className="page home-page">
      {/* ================= HERO ================= */}
      <section className="home-hero">
        <h1>
          RideWise <span>Demand Intelligence</span>
        </h1>
        <p>
          Visual insights to understand when, where, and why bike demand changes.
        </p>
      </section>

      {/* ================= DEMAND BY TIME ================= */}
      <section className="visual-prediction">
        <h2>Demand Pattern by Time</h2>

        <div className="time-demand">
          <span>12 AM</span>
          <div className="bar low" title="Low Demand"></div>
          <div className="bar high" title="Morning Peak"></div>
          <div className="bar medium" title="Afternoon"></div>
          <div className="bar high" title="Evening Peak"></div>
          <div className="bar low" title="Night Low"></div>
          <span>12 AM</span>
        </div>
      </section>

      {/* ================= FACTOR INFLUENCE ================= */}
      <section className="factor-section">
        <h2>What Influences Demand</h2>

        <div className="influence-grid">
          <Influence
            icon="🌦️"
            label="Weather"
            insight="Rain and storms reduce ridership"
          />
          <Influence
            icon="⏰"
            label="Time of Day"
            insight="Morning and evening are peak hours"
          />
          <Influence
            icon="📅"
            label="Day Type"
            insight="Weekends increase leisure demand"
          />
          <Influence
            icon="📍"
            label="Location"
            insight="Business hubs show higher demand"
          />
        </div>
      </section>

      {/* ================= SCENARIO CARDS ================= */}
      <section className="scenario-section">
        <h2>Typical Scenarios</h2>

        <div className="scenario-grid">
          <Scenario title="Sunny Evening" result="High Demand" />
          <Scenario title="Rainy Morning" result="Low Demand" />
          <Scenario title="Weekend Afternoon" result="Medium–High Demand" />
        </div>
      </section>
    </div>
  );
}

/* ===================== COMPONENTS ===================== */

function Influence({ icon, label, insight }) {
  return (
    <div className="influence-card">
      <div className="icon">{icon}</div>
      <span>{label}</span>
      <div className="hover-info">{insight}</div>
    </div>
  );
}

function Scenario({ title, result }) {
  return (
    <div className="scenario-card">
      <h4>{title}</h4>
      <p>{result}</p>
    </div>
  );
}
