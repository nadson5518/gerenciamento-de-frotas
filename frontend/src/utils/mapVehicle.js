export function mapVehicle(apiVehicle) {
  const kmAtual = Number(apiVehicle.km_atual || 0);

  return {
    id: apiVehicle.id,
    placa: apiVehicle.placa,
    modelo: apiVehicle.modelo,
    tipo: apiVehicle.tipo,
    status: apiVehicle.status,
    imageUrl:
      apiVehicle.foto_url ||
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="18">Sem foto</text></svg>',

    detalhes: {
      marca: apiVehicle.marca,
      ano: apiVehicle.ano,
      chassi: apiVehicle.chassi,
      renavam: apiVehicle.renavam,
      kmAtual,
      ultimaAtualizacaoKm: apiVehicle.data_ultima_atualizacao_km || null
    },

    documentos: [],
    manutencoes: apiVehicle.manutencoes || [],
    checklistHistorico: [],

    alertas: {
      documentoVencido: false,
      manutencaoPendente: false,
      kmDesatualizado: false
    }
  };
}