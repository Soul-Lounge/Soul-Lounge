function SuccessPage({ order }: { order: SubmittedOrder | null }) {
  const initialSeconds = (order?.etaMinutes ?? 35) * 60;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  if (!order) return null;

  return (
    <div className="success-page">
      <header className="success-page__header">
        <a href="/" aria-label="Soul Restaurant" className="brand">
          <div className="brand-copy">
            <strong>Soul</strong>
            <small>BBQ &amp; Tex-Mex</small>
          </div>
        </a>
        <a href="/" className="success-page__back">← Wróć do menu</a>
      </header>

      <main className="success-page__main">
        {/* Nagłówek z ikoną */}
        <div className="success-page__hero">
          <div className="success-page__icon" aria-hidden="true">✓</div>
          <div className="success-page__intro">
            <p className="section-kicker">Zamówienie przyjęte</p>
            <h2 className="success-page__title">Dzięki, {order.customer}.</h2>
            <p className="success-page__subtitle">
              Kuchnia już widzi zamówienie. Dostaniesz SMS gdy będzie gotowe.
            </p>
          </div>
        </div>

        {/* Główna siatka: odliczanie + szczegóły w jednym rzędzie */}
        <div className="success-page__grid">
          {/* Odliczanie */}
          <div className="success-page__countdown-box">
            <div className="countdown">
              <span>Szacowany czas oczekiwania</span>
              <strong>{formatCountdown(secondsLeft)}</strong>
              <small>{order.mode === "delivery" ? "Dowóz na terenie Legionowa" : "Odbiór osobisty w lokalu"}</small>
            </div>
          </div>

          {/* Szczegóły zamówienia */}
          <div className="success-page__details">
            {[
              { label: "Numer zamówienia", value: order.id },
              { label: "Łącznie do zapłaty", value: formatPrice(order.total) },
              { label: "Telefon kontaktowy", value: order.phone },
              ...(order.address ? [{ label: order.mode === "delivery" ? "Adres dostawy" : "Odbiór", value: order.address }] : []),
              { label: "Status płatności", value: "Opłacone ✓" },
            ].map(({ label, value }) => (
              <div key={label} className="success-page__detail-row">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Lista zamówionych pozycji - teraz jako kompaktowa sekcja pod siatką */}
        {order.lines.length > 0 && (
          <div className="success-page__lines">
            <p className="eyebrow">Zamówione pozycje</p>
            <div className="success-page__lines-list">
              {order.lines.map(({ item, quantity }) => (
                <div key={item.id} className="success-page__line-row">
                  <span>
                    {item.title} <span className="success-page__qty">× {quantity}</span>
                  </span>
                  <strong>{formatPrice(item.price * quantity)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Przycisk powrotu */}
        <div className="success-page__cta">
          <a href="/" className="btn btn-primary">Zamów ponownie</a>
        </div>
      </main>

      <footer className="success-page__footer">
        © 2026 Soul Restaurant · Legionowo
      </footer>
    </div>
  );
}