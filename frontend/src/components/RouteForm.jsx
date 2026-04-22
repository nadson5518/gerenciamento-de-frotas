import { useMemo, useState } from 'react';

const routeTemplates = [
  { id: 1, nome: 'Centro x Aeroporto', valorCobrado: 480, valorPago: 330 },
  { id: 2, nome: 'Zona Sul x Zona Norte', valorCobrado: 350, valorPago: 240 },
  { id: 3, nome: 'Interior x Capital', valorCobrado: 890, valorPago: 640 }
];

export function RouteForm({ vehicles, onClose }) {
  const [form, setForm] = useState({
    data: '',
    motorista: '',
    rotaPadraoId: '',
    valorCobrado: 0,
    valorPago: 0
  });
  const [errors, setErrors] = useState({});
  const [createdRoutes, setCreatedRoutes] = useState([]);

  const lucroAtual = Number(form.valorCobrado || 0) - Number(form.valorPago || 0);

  const financialSummary = useMemo(() => {
    return createdRoutes.reduce(
      (acc, route) => {
        acc.totalRecebido += route.valorCobrado;
        acc.totalPago += route.valorPago;
        acc.totalLucro += route.lucro;
        return acc;
      },
      { totalRecebido: 0, totalPago: 0, totalLucro: 0 }
    );
  }, [createdRoutes]);

  const drivers = useMemo(() => vehicles.map((vehicle) => `Motorista ${vehicle.placa}`), [vehicles]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleTemplateChange(id) {
    const template = routeTemplates.find((item) => item.id === Number(id));

    if (!template) {
      setForm((current) => ({ ...current, rotaPadraoId: '', valorCobrado: 0, valorPago: 0 }));
      return;
    }

    setForm((current) => ({
      ...current,
      rotaPadraoId: id,
      valorCobrado: template.valorCobrado,
      valorPago: template.valorPago
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.data) nextErrors.data = 'Data é obrigatória.';
    if (!form.motorista) nextErrors.motorista = 'Motorista é obrigatório.';
    if (!form.rotaPadraoId) nextErrors.rotaPadraoId = 'Selecione uma rota padrão.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    const template = routeTemplates.find((item) => item.id === Number(form.rotaPadraoId));

    setCreatedRoutes((current) => [
      {
        id: Date.now(),
        data: form.data,
        motorista: form.motorista,
        rotaPadrao: template?.nome ?? '-',
        valorCobrado: Number(form.valorCobrado),
        valorPago: Number(form.valorPago),
        lucro: lucroAtual
      },
      ...current
    ]);

    setForm((current) => ({ ...current, data: '', motorista: '' }));
  }

  return (
    <div className="form-overlay" onClick={onClose}>
      <section className="form-modal" onClick={(event) => event.stopPropagation()}>
        <header className="form-header">
          <h3>Cadastro de rota</h3>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </header>

        <form className="vehicle-form" onSubmit={handleSubmit}>
          <fieldset className="form-section">
            <legend>Dados da rota</legend>
            <input type="date" value={form.data} onChange={(event) => setField('data', event.target.value)} />
            {errors.data && <small>{errors.data}</small>}

            <select value={form.motorista} onChange={(event) => setField('motorista', event.target.value)}>
              <option value="">Selecione motorista</option>
              {drivers.map((driver) => (
                <option key={driver} value={driver}>
                  {driver}
                </option>
              ))}
            </select>
            {errors.motorista && <small>{errors.motorista}</small>}

            <select value={form.rotaPadraoId} onChange={(event) => handleTemplateChange(event.target.value)}>
              <option value="">Selecione rota padrão</option>
              {routeTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.nome}
                </option>
              ))}
            </select>
            {errors.rotaPadraoId && <small>{errors.rotaPadraoId}</small>}
          </fieldset>

          <fieldset className="form-section">
            <legend>Valores (auto preenchidos)</legend>
            <input
              type="number"
              value={form.valorCobrado}
              onChange={(event) => setField('valorCobrado', event.target.value)}
              min="0"
              step="0.01"
            />
            <input
              type="number"
              value={form.valorPago}
              onChange={(event) => setField('valorPago', event.target.value)}
              min="0"
              step="0.01"
            />
            <p className={`lucro-value ${lucroAtual < 0 ? 'lucro-value--negative' : 'lucro-value--positive'}`}>
              Lucro da rota: R$ {lucroAtual.toFixed(2)}
            </p>
          </fieldset>

          <fieldset className="form-section route-summary">
            <legend>Resumo financeiro</legend>
            <div className="summary-inline-grid">
              <article>
                <span>Total recebido</span>
                <strong>R$ {financialSummary.totalRecebido.toFixed(2)}</strong>
              </article>
              <article>
                <span>Total pago</span>
                <strong>R$ {financialSummary.totalPago.toFixed(2)}</strong>
              </article>
              <article>
                <span>Total lucro</span>
                <strong className={financialSummary.totalLucro < 0 ? 'text-negative' : 'text-positive'}>
                  R$ {financialSummary.totalLucro.toFixed(2)}
                </strong>
              </article>
            </div>

            <ul className="list-table">
              {createdRoutes.map((route) => (
                <li key={route.id}>
                  <div>
                    <strong>{route.rotaPadrao}</strong>
                    <span>
                      {new Date(route.data).toLocaleDateString('pt-BR')} • {route.motorista}
                    </span>
                  </div>
                  <span>Lucro: R$ {route.lucro.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </fieldset>

          <footer className="form-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Fechar
            </button>
            <button type="submit" className="btn-primary">
              Salvar rota
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
