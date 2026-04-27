function isDateExpired(dateValue, referenceDate = new Date()) {
  if (!dateValue) return false;
  return new Date(dateValue) < referenceDate;
}

export function getLatestScheduledMaintenance(maintenanceList = []) {
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
}

export function hasPendingMaintenance(maintenanceList = [], kmAtual = 0, referenceDate = new Date()) {
  if (!maintenanceList.length) return false;

  return maintenanceList.some((item) => {
    const reviewDate = item.proximaRevisaoData ? new Date(item.proximaRevisaoData) : null;
    const reviewKm = item.proximaRevisaoKm != null ? Number(item.proximaRevisaoKm) : null;

    const lateByDate = reviewDate ? reviewDate < referenceDate : false;
    const lateByKm = reviewKm != null ? kmAtual >= reviewKm : false;

    return lateByDate || lateByKm;
  });
}

export function buildMaintenanceAlerts({
  nextMaintenance,
  kmAtual,
  kmDesatualizado,
  referenceDate = new Date()
}) {
  if (!nextMaintenance) return ['Nenhuma próxima revisão cadastrada.'];

  const messages = [];

  const reviewDate = nextMaintenance.proximaRevisaoData
    ? new Date(nextMaintenance.proximaRevisaoData)
    : null;

  const reviewKm =
    nextMaintenance.proximaRevisaoKm != null
      ? Number(nextMaintenance.proximaRevisaoKm)
      : null;

  if (reviewDate && reviewDate < referenceDate) {
    messages.push(
      `${nextMaintenance.tipo} - ${nextMaintenance.descricao || 'Revisão'} vencida por data.`
    );
  } else if (reviewDate) {
    const diffMs = reviewDate - referenceDate;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 15) {
      messages.push(
        `${nextMaintenance.tipo} - ${nextMaintenance.descricao || 'Revisão'} próxima por data: vence em ${diffDays} dia(s).`
      );
    }
  }

  if (reviewKm !== null && kmAtual >= reviewKm) {
    messages.push(
      `${nextMaintenance.tipo} - ${nextMaintenance.descricao || 'Revisão'} vencida por quilometragem.`
    );
  } else if (reviewKm !== null) {
    const kmRestante = reviewKm - kmAtual;

    if (kmRestante <= 1000) {
      messages.push(`Revisão próxima por KM: faltam ${kmRestante.toLocaleString('pt-BR')} km.`);
    }
  }

  if (kmDesatualizado) {
    messages.push('Quilometragem precisa de atualização.');
  }

  return messages;
}

export function calculateVehicleAlerts(vehicle) {
  const today = new Date();
  const kmAtual = Number(vehicle?.detalhes?.kmAtual || 0);

  const documentoVencido = Array.isArray(vehicle.documentos)
    ? vehicle.documentos.some((doc) => isDateExpired(doc.validade, today))
    : false;

  let kmDesatualizado = false;
  if (vehicle?.detalhes?.ultimaAtualizacaoKm) {
    const lastKmUpdate = new Date(vehicle.detalhes.ultimaAtualizacaoKm);
    const diffMs = today - lastKmUpdate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    kmDesatualizado = diffDays > 7;
  }

  const manutencaoPendente = hasPendingMaintenance(vehicle.manutencoes, kmAtual, today);

  return {
    documentoVencido,
    manutencaoPendente,
    kmDesatualizado
  };
}

export function countVehicleAlerts(alerts) {
  return Object.values(alerts).filter(Boolean).length;
}
