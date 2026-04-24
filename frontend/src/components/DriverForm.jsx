import { useMemo, useState } from 'react';

const initialState = {
  nome: '',
  telefone: '',
  documento: '',
  nota: 5,
  veiculoId: '',
  status: 'ATIVO',
  observacoes: ''
};

function getNotaColor(nota) {
  if (nota <= 3) return 'nota-badge nota-badge--low';
  if (nota <= 7) return 'nota-badge nota-badge--mid';
  return 'nota-badge nota-badge--high';
}

export function DriverForm({ vehicles, onClose }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});

  const vehicleOptions = useMemo(
    () => vehicles.map((vehicle) => ({ id: vehicle.id, label: `${vehicle.placa} • ${vehicle.modelo}` })),
    [vehicles]
  );

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.nome.trim()) nextErrors.nome = 'Nome é obrigatório.';

    const nota = Number(form.nota);
    if (Number.isNaN(nota) || nota < 0 || nota > 10) {
      nextErrors.nota = 'Nota deve estar entre 0 e 10.';
    }

    if (!form.veiculoId) {
      nextErrors.veiculoId = 'Selecione um veículo vinculado.';
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
          <h3>Cadastro de motorista</h3>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </header>

        <form className="vehicle-form" onSubmit={handleSubmit}>
          <fieldset className="form-section">
            <legend>Dados</legend>
            <input
              type="text"
              placeholder="Nome completo"
              value={form.nome}
              onChange={(event) => setField('nome', event.target.value)}
            />
            {errors.nome && <small>{errors.nome}</small>}

            <input
              type="tel"
              placeholder="Telefone"
              value={form.telefone}
              onChange={(event) => setField('telefone', event.target.value)}
            />

            <input
              type="text"
              placeholder="Documento"
              value={form.documento}
              onChange={(event) => setField('documento', event.target.value)}
            />
          </fieldset>

          <fieldset className="form-section">
            <legend>Nota (0-10)</legend>
            <div className="nota-row">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={form.nota}
                onChange={(event) => setField('nota', event.target.value)}
              />
              <strong className={getNotaColor(Number(form.nota))}>{Number(form.nota).toFixed(0)}</strong>
            </div>
            {errors.nota && <small>{errors.nota}</small>}
          </fieldset>

          <fieldset className="form-section">
            <legend>Veículo vinculado</legend>
            <select value={form.veiculoId} onChange={(event) => setField('veiculoId', event.target.value)}>
              <option value="">Selecione um veículo</option>
              {vehicleOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.veiculoId && <small>{errors.veiculoId}</small>}
          </fieldset>

          <fieldset className="form-section">
            <legend>Status</legend>
            <select value={form.status} onChange={(event) => setField('status', event.target.value)}>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
              <option value="BLOQUEADO">Bloqueado</option>
            </select>
          </fieldset>

          <fieldset className="form-section">
            <legend>Observações</legend>
            <textarea
              rows="4"
              placeholder="Anotações importantes sobre o motorista"
              value={form.observacoes}
              onChange={(event) => setField('observacoes', event.target.value)}
            />
          </fieldset>

          <footer className="form-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar motorista
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
