import { useMemo, useState } from 'react';

const tabs = ['DOCUMENTOS', 'MANUTENÇÃO', 'CHECKLIST'];

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR');
}

export function VehicleDetailsPage({ vehicle, onClose }) {
  const alerts = vehicle.computedAlerts ?? vehicle.alertas;
  const [activeTab, setActiveTab] = useState('DOCUMENTOS');
  const [documents, setDocuments] = useState(vehicle.documentos ?? []);
  const [maintenanceList, setMaintenanceList] = useState(vehicle.manutencoes ?? []);
  const [checklistHistory, setChecklistHistory] = useState(vehicle.checklistHistorico ?? []);
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

  const documentosVencidos = useMemo(() => {
    const today = new Date();
    return documents.filter((doc) => new Date(doc.validade) < today).length;
  }, [documents]);

  const ultimaManutencao = useMemo(() => {
    if (maintenanceList.length === 0) return null;

    return [...maintenanceList].sort((a, b) => new Date(b.data) - new Date(a.data))[0];
  }, [maintenanceList]);

  const proximaManutencao = useMemo(() => {
    const items = maintenanceList.filter((item) => item.proximaRevisaoData);
    if (items.length === 0) return null;

    return [...items].sort((a, b) => new Date(a.proximaRevisaoData) - new Date(b.proximaRevisaoData))[0];
  }, [maintenanceList]);

  const maintenanceAlerts = useMemo(() => {
    const alerts = [];

    if (!proximaManutencao) {
      alerts.push('Nenhuma próxima revisão cadastrada.');
    } else {
      const isLateByDate = new Date(proximaManutencao.proximaRevisaoData) < new Date();
      const isLateByKm =
        proximaManutencao.proximaRevisaoKm && vehicle.detalhes.kmAtual >= proximaManutencao.proximaRevisaoKm;

      if (isLateByDate || isLateByKm) {
        alerts.push('Próxima revisão está vencida.');
      }
    }

    if (alerts.kmDesatualizado) {
      alerts.push('Quilometragem precisa de atualização.');
    }

    return alerts;
  }, [proximaManutencao, alerts]);

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

  function handleAddMaintenance(event) {
    event.preventDefault();

    setMaintenanceList((current) => [
      ...current,
      {
        id: Date.now(),
        data: newMaintenance.data,
        tipo: newMaintenance.tipo,
        descricao: newMaintenance.descricao,
        valor: Number(newMaintenance.valor || 0),
        km: Number(newMaintenance.km || 0),
        proximaRevisaoData: newMaintenance.proximaRevisaoData || null,
        proximaRevisaoKm: newMaintenance.proximaRevisaoKm ? Number(newMaintenance.proximaRevisaoKm) : null
      }
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
  }

  function handleSaveChecklist() {
    setChecklistHistory((current) => [
      {
        id: Date.now(),
        data: new Date().toISOString().slice(0, 10),
        responsavel: 'Operador Web',
        observacoes: Object.entries(checklist)
          .filter(([, checked]) => checked)
          .map(([item]) => item)
          .join(', ') || 'Checklist sem itens marcados'
      },
      ...current
    ]);
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
              <dd>{vehicle.detalhes.kmAtual.toLocaleString('pt-BR')} km</dd>
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
          <p>{proximaManutencao ? formatDate(proximaManutencao.proximaRevisaoData) : 'Não cadastrada'}</p>
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
            <input
              type="text"
              placeholder="Tipo"
              value={newMaintenance.tipo}
              onChange={(event) => setNewMaintenance((c) => ({ ...c, tipo: event.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Descrição"
              value={newMaintenance.descricao}
              onChange={(event) => setNewMaintenance((c) => ({ ...c, descricao: event.target.value }))}
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
              onChange={(event) => setNewMaintenance((c) => ({ ...c, proximaRevisaoData: event.target.value }))}
            />
            <input
              type="number"
              min="0"
              placeholder="Próxima revisão KM"
              value={newMaintenance.proximaRevisaoKm}
              onChange={(event) => setNewMaintenance((c) => ({ ...c, proximaRevisaoKm: event.target.value }))}
            />
            <button type="submit">Nova manutenção</button>
          </form>

          <div className="maintenance-alerts panel">
            <h4>Próxima revisão e alertas</h4>
            <p>
              Próxima revisão:{' '}
              {proximaManutencao
                ? `${formatDate(proximaManutencao.proximaRevisaoData)} / ${proximaManutencao.proximaRevisaoKm ?? '-'} km`
                : 'não cadastrada'}
            </p>
            <ul>
              {maintenanceAlerts.map((alert) => (
                <li key={alert}>{alert}</li>
              ))}
            </ul>
          </div>

          <ul className="list-table">
            {[...maintenanceList].reverse().map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.tipo}</strong>
                  <span>
                    {formatDate(item.data)} • {item.km.toLocaleString('pt-BR')} km
                  </span>
                </div>
                <span>R$ {Number(item.valor).toFixed(2)}</span>
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
