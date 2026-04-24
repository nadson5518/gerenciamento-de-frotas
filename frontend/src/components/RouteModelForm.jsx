import { useMemo, useState } from 'react';

const initialState = {
  nome: '',
  descricao: '',
  valorCobrado: '',
  valorPago: ''
};

export function RouteModelForm({ onClose }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});

  const lucro = useMemo(() => {
    const cobrado = Number(form.valorCobrado || 0);
    const pago = Number(form.valorPago || 0);
    return cobrado - pago;
  }, [form.valorCobrado, form.valorPago]);

  const prejuizo = lucro < 0;

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.nome.trim()) {
      nextErrors.nome = 'Nome da rota é obrigatório.';
    }

    if (form.valorCobrado === '' || Number(form.valorCobrado) < 0) {
      nextErrors.valorCobrado = 'Valor cobrado deve ser maior ou igual a 0.';
    }

    if (form.valorPago === '' || Number(form.valorPago) < 0) {
      nextErrors.valorPago = 'Valor pago deve ser maior ou igual a 0.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    onClose();
  }

  return (
    <div className="form-overlay" onClick={onClose}>
      <section className="form-modal" onClick={(event) => event.stopPropagation()}>
        <header className="form-header">
          <h3>Cadastro de rota fixa</h3>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </header>

        <form className="vehicle-form" onSubmit={handleSubmit}>
          <fieldset className="form-section">
            <legend>Dados</legend>
            <input
              type="text"
              placeholder="Nome da rota"
              value={form.nome}
              onChange={(event) => setField('nome', event.target.value)}
            />
            {errors.nome && <small>{errors.nome}</small>}

            <textarea
              rows="4"
              placeholder="Descrição"
              value={form.descricao}
              onChange={(event) => setField('descricao', event.target.value)}
            />
          </fieldset>

          <fieldset className="form-section">
            <legend>Valores</legend>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Valor cobrado"
              value={form.valorCobrado}
              onChange={(event) => setField('valorCobrado', event.target.value)}
            />
            {errors.valorCobrado && <small>{errors.valorCobrado}</small>}

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Valor pago"
              value={form.valorPago}
              onChange={(event) => setField('valorPago', event.target.value)}
            />
            {errors.valorPago && <small>{errors.valorPago}</small>}
          </fieldset>

          <fieldset className="form-section">
            <legend>Lucro automático</legend>
            <p className={`lucro-value ${prejuizo ? 'lucro-value--negative' : 'lucro-value--positive'}`}>
              R$ {lucro.toFixed(2)}
            </p>
            {prejuizo && <p className="lucro-alert">⚠️ Alerta de prejuízo: esta rota está com lucro negativo.</p>}
          </fieldset>

          <footer className="form-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar rota fixa
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
