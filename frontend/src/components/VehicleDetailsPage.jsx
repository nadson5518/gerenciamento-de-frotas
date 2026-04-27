import { useMemo, useState } from 'react';
import { createMaintenance, updateVehicle } from '../services/api.js';
import {
  buildMaintenanceAlerts,
  getLatestScheduledMaintenance
} from '../utils/alerts.js';

const API_URL = import.meta.env.VITE_API_URL;

const tabs = ['DOCUMENTOS', 'MANUTENÇÃO', 'CHECKLIST'];

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR');
}

const initialMaintenanceForm = {
  data: '',
  tipo: 'Preventiva',
  descricao: '',
  valor: '',
  km: '',
  proximaRevisaoData: '',
  proximaRevisaoKm: ''
};

export function VehicleDetailsPage({
  vehicle,
  onClose,
  onUpdateVehicle,
  onAddMaintenance,
  onFeedback
}) {
  const alerts = vehicle.computedAlerts ?? vehicle.alertas ?? {};
  const [activeTab, setActiveTab] = useState('DOCUMENTOS');
  const [documents, setDocuments] = useState(vehicle.documentos ?? []);
  const [checklistHistory, setChecklistHistory] = useState(vehicle.checklistHistorico ?? []);
  const [checklist, setChecklist] = useState({
    pneus: false,
    freios: false,
    oleo: false,
    luzes: false
  });
  const [newMaintenance, setNewMaintenance] = useState(initialMaintenanceForm);
  const [novoKm, setNovoKm] = useState('');
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);
  const [isSavingKm, setIsSavingKm] = useState(false);

  const maintenanceList = vehicle.manutencoes ?? [];
  const currentKm = Number(vehicle?.detalhes?.kmAtual || 0);
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
          `${API_URL}/api/manutencoes?veiculo_id=${vehicle.id}`
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
    if (!maintenanceList.length) return null;
    return [...maintenanceList].sort((a, b) => new Date(b.data) - new Date(a.data))[0];
  }, [maintenanceList]);

  const proximaManutencao = useMemo(
    () => getLatestScheduledMaintenance(maintenanceList),
    [maintenanceList]
  );

  const maintenanceAlerts = useMemo(
    () =>
      buildMaintenanceAlerts({
        nextMaintenance: proximaManutencao,
        kmAtual: currentKm,
        kmDesatualizado: alerts?.kmDesatualizado
      }),
    [alerts?.kmDesatualizado, currentKm, proximaManutencao]
  );

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
    if (isSavingMaintenance) return;

    try {
      setIsSavingMaintenance(true);

      const data = await createMaintenance({
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
      const response = await fetch(`${API_URL}/api/manutencoes`, {
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

      onAddMaintenance?.(vehicle.id, {
        id: data.id,
        data: data.data,
        tipo: data.tipo,
        descricao: data.descricao || '',
        valor: Number(data.valor || 0),
        km: Number(data.km || 0),
        proximaRevisaoData: data.proxima_revisao_data,
        proximaRevisaoKm: data.proxima_revisao_km
      });

      setNewMaintenance(initialMaintenanceForm);
      onFeedback?.('Manutenção salva com sucesso!', 'success');
    } catch (error) {
      console.error(error);
      onFeedback?.(error.message || 'Erro ao salvar manutenção.', 'error');
    } finally {
      setIsSavingMaintenance(false);
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

    onFeedback?.('Checklist salvo localmente no painel.', 'success');
  }

  async function handleUpdateKm() {
    if (isSavingKm) return;

    const kmInformado = Number(novoKm);
    if (!novoKm || Number.isNaN(kmInformado)) {
      onFeedback?.('Informe um KM válido.', 'error');
      return;
    }

    if (kmInformado < currentKm) {
      onFeedback?.('O KM não pode ser menor que o atual.', 'error');
      return;
    }

    try {
      setIsSavingKm(true);
    const response = await fetch(
      `${API_URL}/api/veiculos/${localVehicle.id}`,
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

      const updatedApiVehicle = await updateVehicle(vehicle.id, {
        km_atual: kmInformado,
        data_ultima_atualizacao_km: new Date().toISOString().slice(0, 10)
      });

      onUpdateVehicle?.({
        ...vehicle,
        detalhes: {
          ...vehicle.detalhes,
          kmAtual: Number(updatedApiVehicle.km_atual || kmInformado),
          ultimaAtualizacaoKm: updatedApiVehicle.data_ultima_atualizacao_km
        }
      });

      setNovoKm('');
      onFeedback?.('KM atualizado com sucesso!', 'success');
    } catch (error) {
      console.error(error);
      onFeedback?.(error.message || 'Erro ao atualizar KM.', 'error');
    } finally {
      setIsSavingKm(false);
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
              <dd>{currentKm.toLocaleString('pt-BR')} km</dd>
            </div>

            <div>
              <dt>Atualizar KM</dt>
              <dd>
                <div className="km-update-row">
                  <input
                    type="number"
                    placeholder="Novo KM"
                    value={novoKm}
                    onChange={(event) => setNovoKm(event.target.value)}
                    min="0"
                    style={{ width: '120px' }}
                  />

                  <button type="button" onClick={handleUpdateKm} disabled={isSavingKm}>
                    {isSavingKm ? 'Salvando...' : 'OK'}
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
              onChange={(event) => setNewMaintenance((current) => ({ ...current, data: event.target.value }))}
              required
            />

            <select
              value={newMaintenance.tipo}
              onChange={(event) => setNewMaintenance((current) => ({ ...current, tipo: event.target.value }))}
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
                setNewMaintenance((current) => ({ ...current, descricao: event.target.value }))
              }
              required
            />

            <input
              type="number"
              min="0"
              placeholder="Valor"
              value={newMaintenance.valor}
              onChange={(event) => setNewMaintenance((current) => ({ ...current, valor: event.target.value }))}
            />

            <input
              type="number"
              min="0"
              placeholder="KM"
              value={newMaintenance.km}
              onChange={(event) => setNewMaintenance((current) => ({ ...current, km: event.target.value }))}
            />

            <input
              type="date"
              value={newMaintenance.proximaRevisaoData}
              onChange={(event) =>
                setNewMaintenance((current) => ({ ...current, proximaRevisaoData: event.target.value }))
              }
            />

            <input
              type="number"
              min="0"
              placeholder="Próxima revisão KM"
              value={newMaintenance.proximaRevisaoKm}
              onChange={(event) =>
                setNewMaintenance((current) => ({ ...current, proximaRevisaoKm: event.target.value }))
              }
            />

            <button type="submit" disabled={isSavingMaintenance}>
              {isSavingMaintenance ? 'Salvando...' : 'Nova manutenção'}
            </button>
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
              {maintenanceAlerts.map((alertMessage) => {
                const isCritical = alertMessage.toLowerCase().includes('vencida');
                return (
                  <li
                    key={alertMessage}
                    className={isCritical ? 'alert-critical' : 'alert-warning'}
                  >
                    {alertMessage}
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
