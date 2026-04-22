import { useMemo, useState } from 'react';

export function ContractForm({ vehicles, onClose }) {
  const [form, setForm] = useState({
    veiculoId: '',
    empresa: '',
    valorRecebido: '',
    valorPago: '',
    status: 'ATIVO'
  });
  const [contracts, setContracts] = useState([]);
  const [errors, setErrors] = useState({});

  const lucro = Number(form.valorRecebido || 0) - Number(form.valorPago || 0);

  const vehicleOptions = useMemo(
    () => vehicles.map((vehicle) => ({ id: vehicle.id, label: `${vehicle.placa} • ${vehicle.modelo}` })),
    [vehicles]
  );

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.veiculoId) nextErrors.veiculoId = 'Selecione um veículo.';
    if (!form.empresa.trim()) nextErrors.empresa = 'Empresa é obrigatória.';
    if (form.valorRecebido === '' || Number(form.valorRecebido) < 0) {
      nextErrors.valorRecebido = 'Valor recebido deve ser >= 0.';
    }
    if (form.valorPago === '' || Number(form.valorPago) < 0) {
      nextErrors.valorPago = 'Valor pago deve ser >= 0.';
    }

    if (form.status === 'ATIVO') {
      const hasActiveContract = contracts.some(
        (contract) => contract.veiculoId === Number(form.veiculoId) && contract.status === 'ATIVO'
      );

      if (hasActiveContract) {
        nextErrors.status = 'Regra: apenas 1 contrato ativo por veículo.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setContracts((current) => [
      {
        id: Date.now(),
        veiculoId: Number(form.veiculoId),
        empresa: form.empresa,
        valorRecebido: Number(form.valorRecebido),
        valorPago: Number(form.valorPago),
        lucro,
        status: form.status
      },
      ...current
    ]);

    setForm({
      veiculoId: '',
      empresa: '',
      valorRecebido: '',
      valorPago: '',
      status: 'ATIVO'
    });
  }

  function getVehicleLabel(vehicleId) {
    return vehicleOptions.find((option) => option.id === vehicleId)?.label ?? 'Veículo';
  }

  return (
    <div className="form-overlay" onClick={onClose}>
      <section className="form-modal" onClick={(event) => event.stopPropagation()}>
        <header className="form-header">
          <h3>Cadastro de contrato</h3>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </header>

        <form className="vehicle-form" onSubmit={handleSubmit}>
          <fieldset className="form-section">
            <legend>Dados do contrato</legend>
            <select value={form.veiculoId} onChange={(event) => setField('veiculoId', event.target.value)}>
              <option value="">Selecione veículo</option>
              {vehicleOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.veiculoId && <small>{errors.veiculoId}</small>}

            <input
              type="text"
              placeholder="Empresa"
              value={form.empresa}
              onChange={(event) => setField('empresa', event.target.value)}
            />
            {errors.empresa && <small>{errors.empresa}</small>}

            <select value={form.status} onChange={(event) => setField('status', event.target.value)}>
              <option value="ATIVO">ATIVO</option>
              <option value="ENCERRADO">ENCERRADO</option>
            </select>
            {errors.status && <small>{errors.status}</small>}
          </fieldset>

          <fieldset className="form-section">
            <legend>Valores</legend>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Valor recebido"
              value={form.valorRecebido}
              onChange={(event) => setField('valorRecebido', event.target.value)}
            />
            {errors.valorRecebido && <small>{errors.valorRecebido}</small>}

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Valor pago"
              value={form.valorPago}
              onChange={(event) => setField('valorPago', event.target.value)}
            />
            {errors.valorPago && <small>{errors.valorPago}</small>}

            <p className={`lucro-value ${lucro < 0 ? 'lucro-value--negative' : 'lucro-value--positive'}`}>
              Lucro automático: R$ {lucro.toFixed(2)}
            </p>
          </fieldset>

          <fieldset className="form-section">
            <legend>Contratos cadastrados</legend>
            <ul className="list-table">
              {contracts.map((contract) => (
                <li key={contract.id}>
                  <div>
                    <strong>{getVehicleLabel(contract.veiculoId)}</strong>
                    <span>{contract.empresa}</span>
                  </div>
                  <div className="row-actions">
                    <span className={contract.status === 'ATIVO' ? 'tag-active' : 'tag-closed'}>{contract.status}</span>
                    <span>Lucro: R$ {contract.lucro.toFixed(2)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </fieldset>

          <footer className="form-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Fechar
            </button>
            <button type="submit" className="btn-primary">
              Salvar contrato
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
