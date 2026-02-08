export default function OfflinePage() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh' }}>
      <h1>You&apos;re offline</h1>
      <p>Some content may be available from cache. Reconnect to sync and load the latest data.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}
      >
        Retry
      </button>
    </main>
  );
}
