function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(dateA, dateB) {
  const diff = startOfDay(dateA).getTime() - startOfDay(dateB).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function calculateVehicleAlerts(vehicle, referenceDate = new Date()) {
  const today = startOfDay(referenceDate);
  const isFriday = today.getDay() === 5;

  const lastKmUpdate = vehicle.detalhes?.ultimaAtualizacaoKm ? startOfDay(vehicle.detalhes.ultimaAtualizacaoKm) : null;
  const kmDaysWithoutUpdate = lastKmUpdate ? daysBetween(today, lastKmUpdate) : 999;
  const kmDesatualizado = isFriday ? kmDaysWithoutUpdate >= 7 : kmDaysWithoutUpdate >= 15;

  const maintenanceByDate = (vehicle.manutencoes ?? []).some((item) => {
    if (!item.proximaRevisaoData) return false;
    return startOfDay(item.proximaRevisaoData) <= today;
  });

  const maintenanceByKm = (vehicle.manutencoes ?? []).some((item) => {
    if (!item.proximaRevisaoKm) return false;
    return Number(vehicle.detalhes?.kmAtual ?? 0) >= Number(item.proximaRevisaoKm);
  });

  const manutencaoPendente = maintenanceByDate || maintenanceByKm;

  const documentoVencido = (vehicle.documentos ?? []).some((doc) => startOfDay(doc.validade) < today);

  return {
    kmDesatualizado,
    manutencaoPendente,
    documentoVencido
  };
}

export function countVehicleAlerts(alerts) {
  return Object.values(alerts).filter(Boolean).length;
}
