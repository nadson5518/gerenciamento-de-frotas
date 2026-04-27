import { useMemo, useState } from 'react';

const initialState = {
  placa: '',
  modelo: '',
  marca: '',
  ano: '',
  tipo: 'PROPRIO',
  status: 'ATIVO',
  chassi: '',
  renavam: '',
  kmAtual: '',
  dataUltimaKm: '',
  foto: null,
  documentos: []
};

export function VehicleForm({ onClose }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});

  const previewUrl = useMemo(() => {
    if (!form.foto) return null;
    return URL.createObjectURL(form.foto);
  }, [form.foto]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const nextErrors = {};

    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(form.placa.toUpperCase())) {
      nextErrors.placa = 'Placa inválida. Ex: ABC1D23';
    }

    if (!form.modelo.trim()) nextErrors.modelo = 'Modelo é obrigatório.';
    if (!form.marca.trim()) nextErrors.marca = 'Marca é obrigatória.';

    const ano = Number(form.ano);
    if (!ano || ano < 1900 || ano > 2100) {
      nextErrors.ano = 'Ano deve estar entre 1900 e 2100.';
    }

    if (form.chassi.trim().length < 8) {
      nextErrors.chassi = 'Chassi deve ter ao menos 8 caracteres.';
    }

    if (!/^\d{11}$/.test(form.renavam)) {
      nextErrors.renavam = 'Renavam deve ter 11 dígitos numéricos.';
    }

    if (form.kmAtual === '' || Number(form.kmAtual) < 0) {
      nextErrors.kmAtual = 'KM atual deve ser igual ou maior que 0.';
    }

    if (!form.dataUltimaKm) {
      nextErrors.dataUltimaKm = 'Informe a data da última atualização de KM.';
    }

    if (form.foto && !form.foto.type.startsWith('image/')) {
      nextErrors.foto = 'Arquivo de foto deve ser uma imagem válida.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
  event.preventDefault();
  if (!validate()) return;

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/veiculos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placa: form.placa,
        modelo: form.modelo,
        marca: form.marca,
        ano: Number(form.ano),
        tipo: form.tipo,
        status: form.status,
        chassi: form.chassi,
        renavam: form.renavam,
        km_atual: Number(form.kmAtual),
        data_ultima_atualizacao_km: form.dataUltimaKm,
        foto_url: null
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(`Erro ao salvar veículo: ${response.status} - ${JSON.stringify(data)}`);
    }

    alert('Veículo salvo com sucesso!');
    onClose();
    window.location.reload();
  } catch (error) {
    console.error('Erro completo ao salvar veículo:', error);
    alert(error.message);
  }
}

  return (
    <div className="form-overlay" onClick={onClose}>
      <section className="form-modal" onClick={(event) => event.stopPropagation()}>
        <header className="form-header">
          <h3>Novo veículo</h3>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </header>

        <form className="vehicle-form" onSubmit={handleSubmit}>
          <fieldset className="form-section">
            <legend>Dados</legend>
            <input
              type="text"
              placeholder="Placa"
              value={form.placa}
              onChange={(event) => setField('placa', event.target.value.toUpperCase())}
            />
            {errors.placa && <small>{errors.placa}</small>}
            <input
              type="text"
              placeholder="Modelo"
              value={form.modelo}
              onChange={(event) => setField('modelo', event.target.value)}
            />
            {errors.modelo && <small>{errors.modelo}</small>}
            <input
              type="text"
              placeholder="Marca"
              value={form.marca}
              onChange={(event) => setField('marca', event.target.value)}
            />
            {errors.marca && <small>{errors.marca}</small>}
            <input type="number" placeholder="Ano" value={form.ano} onChange={(event) => setField('ano', event.target.value)} />
            {errors.ano && <small>{errors.ano}</small>}
          </fieldset>

          <fieldset className="form-section">
            <legend>Legais</legend>
            <input
              type="text"
              placeholder="Chassi"
              value={form.chassi}
              onChange={(event) => setField('chassi', event.target.value)}
            />
            {errors.chassi && <small>{errors.chassi}</small>}
            <input
              type="text"
              placeholder="Renavam"
              value={form.renavam}
              onChange={(event) => setField('renavam', event.target.value.replace(/\D/g, ''))}
            />
            {errors.renavam && <small>{errors.renavam}</small>}
          </fieldset>

          <fieldset className="form-section">
            <legend>Operacional</legend>
            <select value={form.tipo} onChange={(event) => setField('tipo', event.target.value)}>
              <option value="PROPRIO">Próprio</option>
              <option value="ALUGADO">Alugado</option>
            </select>
            <select value={form.status} onChange={(event) => setField('status', event.target.value)}>
              <option value="ATIVO">Ativo</option>
              <option value="PARADO">Parado</option>
            </select>
            <input
              type="number"
              min="0"
              placeholder="KM atual"
              value={form.kmAtual}
              onChange={(event) => setField('kmAtual', event.target.value)}
            />
            {errors.kmAtual && <small>{errors.kmAtual}</small>}
            <input type="date" value={form.dataUltimaKm} onChange={(event) => setField('dataUltimaKm', event.target.value)} />
            {errors.dataUltimaKm && <small>{errors.dataUltimaKm}</small>}
          </fieldset>

          <fieldset className="form-section">
            <legend>Mídia</legend>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setField('foto', event.target.files?.[0] ?? null)}
            />
            {errors.foto && <small>{errors.foto}</small>}
            {previewUrl && <img src={previewUrl} alt="Pré-visualização" className="form-image-preview" />}
          </fieldset>

          <fieldset className="form-section">
            <legend>Documentos</legend>
            <input
              type="file"
              multiple
              onChange={(event) => setField('documentos', Array.from(event.target.files ?? []))}
            />
            <ul className="form-doc-list">
              {form.documentos.map((doc) => (
                <li key={doc.name}>{doc.name}</li>
              ))}
            </ul>
          </fieldset>

          <footer className="form-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar veículo
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
