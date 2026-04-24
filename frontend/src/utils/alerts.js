export function calculateVehicleAlerts(vehicle) {
  const today = new Date();
  const kmAtual = Number(vehicle?.detalhes?.kmAtual || 0);

  let documentoVencido = false;
  let manutencaoPendente = false;
  let kmDesatualizado = false;

  if (Array.isArray(vehicle.documentos)) {
    documentoVencido = vehicle.documentos.some((doc) => {
      if (!doc.validade) return false;
      return new Date(doc.validade) < today;
    });
  }

  if (vehicle?.detalhes?.ultimaAtualizacaoKm) {
    const lastKmUpdate = new Date(vehicle.detalhes.ultimaAtualizacaoKm);
    const diffMs = today - lastKmUpdate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    kmDesatualizado = diffDays > 7;
  }

  if (Array.isArray(vehicle.manutencoes) && vehicle.manutencoes.length > 0) {
    manutencaoPendente = vehicle.manutencoes.some((item) => {
      const reviewDate = item.proximaRevisaoData ? new Date(item.proximaRevisaoData) : null;
      const reviewKm = item.proximaRevisaoKm != null ? Number(item.proximaRevisaoKm) : null;

      const lateByDate = reviewDate ? reviewDate < today : false;
      const lateByKm = reviewKm != null ? kmAtual >= reviewKm : false;

      return lateByDate || lateByKm;
    });
  }

  return {
    documentoVencido,
    manutencaoPendente,
    kmDesatualizado
  };
}

export function countVehicleAlerts(alerts) {
  return Object.values(alerts).filter(Boolean).length;
}