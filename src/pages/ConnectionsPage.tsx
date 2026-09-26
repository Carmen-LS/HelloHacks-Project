import { Layout } from '../components/Layout'

export function ConnectionsPage() {
  return (
    <Layout>
      <section className="page-intro connections-intro">
        <div><p className="eyebrow">Good company makes the journey</p><h1>Connections</h1><p>Your community will grow with every quest you join.</p></div>
      </section>
      <section className="connections-empty">
        <div className="connections-illustration" aria-hidden="true"><span>☀</span><span>♧</span><span>♡</span></div>
        <p className="eyebrow">A place to find your people</p>
        <h2>Your connections are just around the corner.</h2>
        <p>When you meet people through activities, they’ll be easy to find here. We’re making space for future conversations, too.</p>
        <span className="coming-soon-pill"><span aria-hidden="true">✦</span> Chat coming soon</span>
      </section>
    </Layout>
  )
}
