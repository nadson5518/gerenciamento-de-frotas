import { useMemo, useState } from 'react';

const routesData = [
  { id: 1, date: '2026-04-03', received: 480, paid: 330 },
  { id: 2, date: '2026-04-10', received: 350, paid: 240 },
  { id: 3, date: '2026-05-02', received: 890, paid: 640 }
];

const contractsData = [
  { id: 1, date: '2026-04-01', received: 8200, paid: 5600 },
  { id: 2, date: '2026-05-01', received: 7000, paid: 5100 }
];

const maintenancesData = [
  { id: 1, date: '2026-04-06', cost: 1200 },
  { id: 2, date: '2026-04-19', cost: 890 },
  { id: 3, date: '2026-05-08', cost: 470 }
];

const vehiclesPaymentData = [
  { id: 1, name: 'Custos veículos', date: '2026-04-30', value: 2100 },
  { id: 2, name: 'Custos veículos', date: '2026-05-30', value: 1800 }
];

const driversPaymentData = [
  { id: 1, name: 'Pagamento motoristas', date: '2026-04-30', value: 3900 },
  { id: 2, name: 'Pagamento motoristas', date: '2026-05-30', value: 3500 }
];

function byPeriod(itemDate, month, year) {
  const date = new Date(itemDate);
  return date.getMonth() + 1 === Number(month) && date.getFullYear() === Number(year);
}

function currency(value) {
  return `R$ ${value.toFixed(2)}`;
}

export function MonthlyClosingForm({ onClose }) {
  const today = new Date();
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year, setYear] = useState(String(today.getFullYear()));
  const [isClosed, setIsClosed] = useState(false);

  const calculations = useMemo(() => {
    const routes = routesData.filter((item) => byPeriod(item.date, month, year));
    const contracts = contractsData.filter((item) => byPeriod(item.date, month, year));
    const maintenances = maintenancesData.filter((item) => byPeriod(item.date, month, year));
    const vehiclesPayments = vehiclesPaymentData.filter((item) => byPeriod(item.date, month, year));
    const driversPayments = driversPaymentData.filter((item) => byPeriod(item.date, month, year));

    const totalRecebido = [...routes, ...contracts].reduce((sum, item) => sum + item.received, 0);
    const totalPagoOperacao = [...routes, ...contracts].reduce((sum, item) => sum + item.paid, 0);
    const manutencao = maintenances.reduce((sum, item) => sum + item.cost, 0);
    const bmPagamento = [...vehiclesPayments, ...driversPayments].reduce((sum, item) => sum + item.value, 0);
    const totalPago = totalPagoOperacao + manutencao + bmPagamento;
    const lucro = totalRecebido - totalPago;

    return {
      totalRecebido,
      totalPago,
      manutencao,
      lucro,
      bmCobranca: [...contracts, ...routes],
      bmPagamentoItems: [...vehiclesPayments, ...driversPayments]
    };
  }, [month, year]);

  function handleGeneratePdf() {
    const content = `
      <html>
        <head><title>Fechamento ${month}/${year}</title></head>
        <body>
          <h1>Fechamento mensal ${month}/${year}</h1>
          <p>Total recebido: ${currency(calculations.totalRecebido)}</p>
          <p>Total pago: ${currency(calculations.totalPago)}</p>
          <p>Manutenção: ${currency(calculations.manutencao)}</p>
          <p>Lucro: ${currency(calculations.lucro)}</p>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }

  function handleCloseMonth() {
    setIsClosed(true);
  }

  return (
    <div className="form-overlay" onClick={onClose}>
      <section className="form-modal" onClick={(event) => event.stopPropagation()}>
        <header className="form-header">
          <h3>Fechamento mensal</h3>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </header>

        <div className="vehicle-form">
          <fieldset className="form-section">
            <legend>Competência</legend>
            <select value={month} onChange={(event) => setMonth(event.target.value)} disabled={isClosed}>
              {Array.from({ length: 12 }).map((_, index) => {
                const value = String(index + 1);
                return (
                  <option key={value} value={value}>
                    {value.padStart(2, '0')}
                  </option>
                );
              })}
            </select>
            <input type="number" value={year} onChange={(event) => setYear(event.target.value)} disabled={isClosed} />
          </fieldset>

          <fieldset className="form-section">
            <legend>Resumo financeiro</legend>
            <div className="summary-inline-grid">
              <article>
                <span>Total recebido</span>
                <strong>{currency(calculations.totalRecebido)}</strong>
              </article>
              <article>
                <span>Total pago</span>
                <strong>{currency(calculations.totalPago)}</strong>
              </article>
              <article>
                <span>Manutenção</span>
                <strong>{currency(calculations.manutencao)}</strong>
              </article>
              <article>
                <span>Lucro</span>
                <strong className={calculations.lucro < 0 ? 'text-negative' : 'text-positive'}>
                  {currency(calculations.lucro)}
                </strong>
              </article>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>BM cobrança (contratos + rotas)</legend>
            <ul className="list-table">
              {calculations.bmCobranca.map((item) => (
                <li key={`c-${item.id}-${item.date}`}>
                  <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                  <span>Recebido: {currency(item.received)} | Pago: {currency(item.paid)}</span>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset className="form-section">
            <legend>BM pagamento (veículos + motoristas)</legend>
            <ul className="list-table">
              {calculations.bmPagamentoItems.map((item) => (
                <li key={`p-${item.id}-${item.date}`}>
                  <span>{item.name}</span>
                  <span>{currency(item.value)}</span>
                </li>
              ))}
            </ul>
          </fieldset>

          <footer className="form-footer">
            {!isClosed ? (
              <button type="button" className="btn-secondary" onClick={handleCloseMonth}>
                Fechar mês (bloquear edição)
              </button>
            ) : (
              <span className="tag-closed">Fechamento concluído — edição bloqueada</span>
            )}
            <button type="button" className="btn-primary" onClick={handleGeneratePdf}>
              Gerar PDF
            </button>
          </footer>
        </div>
      </section>
    </div>
  );
}
