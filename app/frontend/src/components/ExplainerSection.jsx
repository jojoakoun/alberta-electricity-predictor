import "../App.css"

export default function ExplainerSection() {
  return (
    <section className="explainer-grid">
      <article className="info-card">
        <span className="info-icon">🏭</span>
        <h3>How the pool price works</h3>
        <p>
          Generators bid into the market each hour. The accepted
          market-clearing price becomes the pool price paid across the system.
        </p>
      </article>

      <article className="info-card">
        <span className="info-icon">📈</span>
        <h3>Why spikes happen</h3>
        <p>
          High demand, outages, or tighter supply can push the hourly clearing
          price up quickly, especially in stressed evening periods.
        </p>
      </article>

      <article className="info-card">
        <span className="info-icon">💡</span>
        <h3>Why this app helps</h3>
        <p>
          It turns hourly market data into simple timing decisions so households
          can shift flexible usage to cheaper windows.
        </p>
      </article>
    </section>
  )
}