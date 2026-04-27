import { useEffect, useMemo, useState } from 'react';

const tabs = ['DOCUMENTOS', 'MANUTENÇÃO', 'CHECKLIST'];

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR');
}

export function VehicleDetailsPage({ vehicle, onClose, onUpdateVehicle }) {
  const alerts = vehicle.computedAlerts ?? vehicle.alertas ?? {};

  const [activeTab, setActiveTab] = useState('DOCUMENTOS');
  const [documents, setDocuments] = useState(vehicle.documentos ?? []);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [checklistHistory, setChecklistHistory] = useState(vehicle.checklistHistorico ?? []);
  const [novoKm, setNovoKm] = useState('');
  const [localVehicle, setLocalVehicle] = useState(vehicle);

useEffect(() => {
  setLocalVehicle(vehicle);
  setNovoKm('');
}, [vehicle.id]);

  const [checklist, setChecklist] = useState({
    pneus: false,
    freios: false,
    oleo: false,
    luzes: false
  });

  const [newMaintenance, setNewMaintenance] = useState({
    data: '',
    tipo: 'Preventiva',
    descricao: '',
    valor: '',
    km: '',
    proximaRevisaoData: '',
    proximaRevisaoKm: ''
  });

  useEffect(() => {
    async function loadMaintenances() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/manutencoes?veiculo_id=${vehicle.id}`
        );

        if (!response.ok) {
          throw new Error(`Erro ao buscar manutenções: ${response.status}`);
        }

        const data = await response.json();

        const mapped = data.map((item) => ({
          id: item.id,
          data: item.data,
          tipo: item.tipo,
          descricao: item.descricao || '',
          valor: Number(item.valor || 0),
          km: Number(item.km || 0),
          proximaRevisaoData: item.proxima_revisao_data,
          proximaRevisaoKm: item.proxima_revisao_km
        }));

        setMaintenanceList(mapped);
      } catch (error) {
        console.error('Erro ao carregar manutenções:', error);
      }
    }

    loadMaintenances();
  }, [vehicle.id]);

  const documentosVencidos = useMemo(() => {
    const today = new Date();
    return documents.filter((doc) => new Date(doc.validade) < today).length;
  }, [documents]);

  const ultimaManutencao = useMemo(() => {
    if (maintenanceList.length === 0) return null;

    return [...maintenanceList].sort((a, b) => new Date(b.data) - new Date(a.data))[0];
  }, [maintenanceList]);

  const proximaManutencao = useMemo(() => {
  const grouped = new Map();

  maintenanceList.forEach((item) => {
    const key = `${item.tipo}-${item.descricao || ''}`;
    const current = grouped.get(key);

    if (!current || new Date(item.data) > new Date(current.data)) {
      grouped.set(key, item);
    }
  });

  const latestServices = Array.from(grouped.values()).filter(
    (item) => item.proximaRevisaoData || item.proximaRevisaoKm
  );

  if (latestServices.length === 0) return null;

  return latestServices.sort((a, b) => {
    const aDate = a.proximaRevisaoData ? new Date(a.proximaRevisaoData).getTime() : Infinity;
    const bDate = b.proximaRevisaoData ? new Date(b.proximaRevisaoData).getTime() : Infinity;
    return aDate - bDate;
  })[0];
}, [maintenanceList]);

  const maintenanceAlerts = useMemo(() => {
    const messages = [];
    const today = new Date();
    const kmAtual = Number(vehicle?.detalhes?.kmAtual || 0);

    if (!proximaManutencao) {
      messages.push('Nenhuma próxima revisão cadastrada.');
      return messages;
    }

    const reviewDate = proximaManutencao.proximaRevisaoData
      ? new Date(proximaManutencao.proximaRevisaoData)
      : null;

    const reviewKm =
      proximaManutencao.proximaRevisaoKm != null
        ? Number(proximaManutencao.proximaRevisaoKm)
        : null;

    if (reviewDate && reviewDate < today) {
  messages.push(`${proximaManutencao.tipo} - ${proximaManutencao.descricao || 'Revisão'} vencida por data.`);
    } else if (reviewDate) {
      const diffMs = reviewDate - today;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 15) {
        messages.push(`${proximaManutencao.tipo} - ${proximaManutencao.descricao || 'Revisão'} próxima por data: vence em ${diffDays} dia(s).`);
      }
    }

    if (reviewKm !== null && kmAtual >= reviewKm) {
  messages.push(`${proximaManutencao.tipo} - ${proximaManutencao.descricao || 'Revisão'} vencida por quilometragem.`);
    } else if (reviewKm !== null) {
      const kmRestante = reviewKm - kmAtual;

      if (kmRestante <= 1000) {
        messages.push(
          `Revisão próxima por KM: faltam ${kmRestante.toLocaleString('pt-BR')} km.`
        );
      }
    }

    if (alerts?.kmDesatualizado) {
      messages.push('Quilometragem precisa de atualização.');
    }

    return messages;
  }, [proximaManutencao, vehicle, alerts]);

  function handleUploadDocument(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setDocuments((current) => [
      ...current,
      {
        id: Date.now(),
        tipo: file.name.split('.').at(0) || 'Arquivo',
        validade: new Date().toISOString().slice(0, 10),
        arquivoUrl: URL.createObjectURL(file)
      }
    ]);
  }

  async function handleAddMaintenance(event) {
    event.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/manutencoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veiculo_id: vehicle.id,
          data: newMaintenance.data,
          tipo: newMaintenance.tipo,
          descricao: newMaintenance.descricao,
          valor: Number(newMaintenance.valor || 0),
          km: Number(newMaintenance.km || 0),
          proxima_revisao_data: newMaintenance.proximaRevisaoData || null,
          proxima_revisao_km: newMaintenance.proximaRevisaoKm
            ? Number(newMaintenance.proximaRevisaoKm)
            : null
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          `Erro ao salvar manutenção: ${response.status} - ${JSON.stringify(data)}`
        );
      }

      setMaintenanceList((current) => [
        {
          id: data.id,
          data: data.data,
          tipo: data.tipo,
          descricao: data.descricao || '',
          valor: Number(data.valor || 0),
          km: Number(data.km || 0),
          proximaRevisaoData: data.proxima_revisao_data,
          proximaRevisaoKm: data.proxima_revisao_km
        },
        ...current
      ]);

      setNewMaintenance({
        data: '',
        tipo: 'Preventiva',
        descricao: '',
        valor: '',
        km: '',
        proximaRevisaoData: '',
        proximaRevisaoKm: ''
      });

      alert('Manutenção salva com sucesso!');
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  function handleSaveChecklist() {
    setChecklistHistory((current) => [
      {
        id: Date.now(),
        data: new Date().toISOString().slice(0, 10),
        responsavel: 'Operador Web',
        observacoes:
          Object.entries(checklist)
            .filter(([, checked]) => checked)
            .map(([item]) => item)
            .join(', ') || 'Checklist sem itens marcados'
      },
      ...current
    ]);
  }

  async function atualizarKm() {
  try {
    const kmAtualVeiculo = Number(localVehicle?.detalhes?.kmAtual || 0);
    const kmInformado = Number(novoKm);

    if (!novoKm || Number.isNaN(kmInformado)) {
      alert('Informe um KM válido.');
      return;
    }

    if (kmInformado < kmAtualVeiculo) {
      alert('O KM não pode ser menor que o atual.');
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/veiculos/${localVehicle.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          km_atual: kmInformado,
          data_ultima_atualizacao_km: new Date().toISOString().slice(0, 10)
        })
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(`Erro ao atualizar KM: ${response.status}`);
    }

    // 🔥 atualiza localmente (detalhe)
    const updatedVehicle = {
      ...localVehicle,
      detalhes: {
        ...localVehicle.detalhes,
        kmAtual: kmInformado,
        ultimaAtualizacaoKm: new Date().toISOString()
      }
    };

    setLocalVehicle(updatedVehicle);

    // 🔥 atualiza no App (lista / cards)
    onUpdateVehicle(updatedVehicle);

    setNovoKm('');

    alert('KM atualizado com sucesso!');
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

  return (
    <section className="details-page panel">
      <header className="details-header">
        <img src={vehicle.imageUrl} alt={vehicle.placa} className="details-header__image" />

        <div className="details-header__content">
          <div className="details-header__title-row">
            <h3>{vehicle.placa}</h3>
            <button type="button" className="details-header__close" onClick={onClose}>
              Fechar
            </button>
          </div>

          <p className="details-header__model">{vehicle.modelo}</p>

          <dl className="details-header__meta-grid">
  <div>
    <dt>Tipo</dt>
    <dd>{vehicle.tipo}</dd>
  </div>

  <div>
    <dt>Status</dt>
    <dd>{vehicle.status}</dd>
  </div>

  <div>
    <dt>Chassi</dt>
    <dd>{vehicle.detalhes.chassi}</dd>
  </div>

  <div>
    <dt>Renavam</dt>
    <dd>{vehicle.detalhes.renavam}</dd>
  </div>

  <div>
    <dt>KM</dt>
    <dd>{Number(localVehicle.detalhes.kmAtual || 0).toLocaleString('pt-BR')} km</dd>
  </div>

  <div>
    <dt>Atualizar KM</dt>
    <dd>
      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          type="number"
          placeholder="Novo KM"
          value={novoKm}
          onChange={(e) => setNovoKm(e.target.value)}
          min="0"
          style={{ width: '120px' }}
        />

        <button type="button" onClick={atualizarKm}>
          OK
        </button>
      </div>
    </dd>
  </div>
</dl>
        </div>
      </header>

      <section className="details-summary-grid">
        <article className="summary-card">
          <h4>Documentos vencidos</h4>
          <p>{documentosVencidos}</p>
        </article>

        <article className="summary-card">
          <h4>Próxima manutenção</h4>
          <p>
            {proximaManutencao
              ? `${formatDate(proximaManutencao.proximaRevisaoData)}${
                  proximaManutencao.proximaRevisaoKm
                    ? ` • ${Number(proximaManutencao.proximaRevisaoKm).toLocaleString('pt-BR')} km`
                    : ''
                }`
              : 'Não cadastrada'}
          </p>
        </article>

        <article className="summary-card">
          <h4>Última manutenção</h4>
          <p>{ultimaManutencao ? formatDate(ultimaManutencao.data) : 'Sem histórico'}</p>
        </article>
      </section>

      <section className="panel">
        <h4>Alertas no detalhe</h4>
        <ul className="alert-list">
          {alerts.kmDesatualizado && <li>KM: verificar atualização (regra semanal de sexta-feira).</li>}
          {alerts.manutencaoPendente && <li>Manutenção pendente por data/KM.</li>}
          {alerts.documentoVencido && <li>Documentos com vencimento expirado.</li>}
          {!alerts.kmDesatualizado && !alerts.manutencaoPendente && !alerts.documentoVencido && (
            <li>Sem alertas ativos.</li>
          )}
        </ul>
      </section>

      <nav className="details-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'is-active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 'DOCUMENTOS' && (
        <section className="details-tab-content">
          <div className="tab-actions">
            <label className="upload-button">
              Upload documento
              <input type="file" onChange={handleUploadDocument} hidden />
            </label>
          </div>

          <ul className="list-table">
            {documents.map((doc) => {
              const isExpired = new Date(doc.validade) < new Date();
              return (
                <li key={doc.id}>
                  <div>
                    <strong>{doc.tipo}</strong>
                    <span>Validade: {formatDate(doc.validade)}</span>
                  </div>
                  <div className="row-actions">
                    {isExpired && <span className="tag-warning">Vencido</span>}
                    <a href={doc.arquivoUrl} download>
                      Download
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {activeTab === 'MANUTENÇÃO' && (
        <section className="details-tab-content">
          <form className="maintenance-form" onSubmit={handleAddMaintenance}>
            <input
              type="date"
              value={newMaintenance.data}
              onChange={(event) => setNewMaintenance((c) => ({ ...c, data: event.target.value }))}
              required
            />

            <select
              value={newMaintenance.tipo}
              onChange={(event) => setNewMaintenance((c) => ({ ...c, tipo: event.target.value }))}
              required
            >
              <option value="Preventiva">Preventiva</option>
              <option value="Corretiva">Corretiva</option>
              <option value="Troca de Óleo">Troca de Óleo</option>
              <option value="Revisão Geral">Revisão Geral</option>
              <option value="Freios">Freios</option>
              <option value="Pneus">Pneus</option>
              <option value="Elétrica">Elétrica</option>
            </select>

            <input
              type="text"
              placeholder="Descrição"
              value={newMaintenance.descricao}
              onChange={(event) =>
                setNewMaintenance((c) => ({ ...c, descricao: event.target.value }))
              }
              required
            />

            <input
              type="number"
              min="0"
              placeholder="Valor"
              value={newMaintenance.valor}
              onChange={(event) => setNewMaintenance((c) => ({ ...c, valor: event.target.value }))}
            />

            <input
              type="number"
              min="0"
              placeholder="KM"
              value={newMaintenance.km}
              onChange={(event) => setNewMaintenance((c) => ({ ...c, km: event.target.value }))}
            />

            <input
              type="date"
              value={newMaintenance.proximaRevisaoData}
              onChange={(event) =>
                setNewMaintenance((c) => ({ ...c, proximaRevisaoData: event.target.value }))
              }
            />

            <input
              type="number"
              min="0"
              placeholder="Próxima revisão KM"
              value={newMaintenance.proximaRevisaoKm}
              onChange={(event) =>
                setNewMaintenance((c) => ({ ...c, proximaRevisaoKm: event.target.value }))
              }
            />

            <button type="submit">Nova manutenção</button>
          </form>

          <div className="maintenance-alerts panel">
            <h4>Próxima revisão e alertas</h4>
            <p>
  <strong>
    {proximaManutencao
      ? `${proximaManutencao.tipo} - ${proximaManutencao.descricao || 'Sem descrição'}`
      : 'Nenhuma revisão cadastrada'}
  </strong>
  <br />
  {proximaManutencao
    ? `${formatDate(proximaManutencao.proximaRevisaoData)} / ${
        proximaManutencao.proximaRevisaoKm ?? '-'
      } km`
    : ''}
</p>

            <ul className="maintenance-alert-list">
              {maintenanceAlerts.map((alert) => {
                const isCritical = alert.toLowerCase().includes('vencida');
                return (
                  <li key={alert} className={isCritical ? 'alert-critical' : 'alert-warning'}>
                    {alert}
                  </li>
                );
              })}
            </ul>
          </div>

          <ul className="list-table">
            {[...maintenanceList].reverse().map((item) => (
              <li key={item.id}>
                <div>
                  <strong>
                   {item.tipo}
                   {item.descricao ? ` - ${item.descricao}` : ''}
                  </strong>
                  <span>
                    {formatDate(item.data)} • {Number(item.km || 0).toLocaleString('pt-BR')} km
                  </span>
                </div>
                <span>R$ {Number(item.valor || 0).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'CHECKLIST' && (
        <section className="details-tab-content">
          <div className="checklist-current panel">
            <h4>Checklist atual</h4>
            <div className="checklist-grid">
              {Object.keys(checklist).map((item) => (
                <label key={item}>
                  <input
                    type="checkbox"
                    checked={checklist[item]}
                    onChange={(event) =>
                      setChecklist((current) => ({
                        ...current,
                        [item]: event.target.checked
                      }))
                    }
                  />
                  {item}
                </label>
              ))}
            </div>
            <button type="button" onClick={handleSaveChecklist}>
              Salvar checklist
            </button>
          </div>

          <ul className="list-table">
            {checklistHistory.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{formatDate(item.data)}</strong>
                  <span>{item.responsavel}</span>
                </div>
                <span>{item.observacoes}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}