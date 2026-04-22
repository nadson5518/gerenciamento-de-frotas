export const vehicles = [
  {
    id: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1618146484648-2ac6f6f60f20?auto=format&fit=crop&w=1000&q=80',
    placa: 'ABC1D23',
    modelo: 'Ford Transit',
    tipo: 'PROPRIO',
    status: 'ATIVO',
    alertas: {
      documentoVencido: false,
      manutencaoPendente: true,
      kmDesatualizado: false
    },
    detalhes: {
      marca: 'Ford',
      ano: 2022,
      chassi: '9BWZZZ377VT004251',
      renavam: '12345678901',
      kmAtual: 58230,
      ultimaAtualizacaoKm: '2026-04-19'
    },
    documentos: [
      { id: 1, tipo: 'CRLV', validade: '2026-10-12', arquivoUrl: '#' },
      { id: 2, tipo: 'Seguro', validade: '2026-08-01', arquivoUrl: '#' }
    ],
    manutencoes: [
      { id: 1, data: '2026-03-15', tipo: 'Preventiva', descricao: 'Troca de óleo', valor: 820, km: 56000 },
      {
        id: 2,
        data: '2026-04-28',
        tipo: 'Preventiva',
        descricao: 'Revisão completa',
        valor: 1450,
        km: 60000,
        proximaRevisaoData: '2026-07-28',
        proximaRevisaoKm: 70000
      }
    ],
    checklistHistorico: [
      { id: 1, data: '2026-04-20', responsavel: 'Carlos Mendes', observacoes: 'Sem anomalias' },
      { id: 2, data: '2026-04-10', responsavel: 'Fernanda Oliveira', observacoes: 'Calibrar pneus' }
    ]
  },
  {
    id: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1566473965997-3de9c817e938?auto=format&fit=crop&w=1000&q=80',
    placa: 'XYZ9K88',
    modelo: 'Mercedes Sprinter',
    tipo: 'ALUGADO',
    status: 'PARADO',
    alertas: {
      documentoVencido: true,
      manutencaoPendente: true,
      kmDesatualizado: true
    },
    detalhes: {
      marca: 'Mercedes',
      ano: 2021,
      chassi: '9BWZZZ377VT004252',
      renavam: '10987654321',
      kmAtual: 91340,
      ultimaAtualizacaoKm: '2026-03-10'
    },
    documentos: [
      { id: 1, tipo: 'CRLV', validade: '2026-01-20', arquivoUrl: '#' },
      { id: 2, tipo: 'Seguro', validade: '2025-12-15', arquivoUrl: '#' }
    ],
    manutencoes: [
      {
        id: 1,
        data: '2026-02-10',
        tipo: 'Corretiva',
        descricao: 'Freios',
        valor: 2100,
        km: 90000,
        proximaRevisaoData: '2026-04-15',
        proximaRevisaoKm: 92000
      }
    ],
    checklistHistorico: [
      { id: 1, data: '2026-04-01', responsavel: 'João Lima', observacoes: 'Luz de alerta no painel' }
    ]
  },
  {
    id: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1000&q=80',
    placa: 'QWE4R56',
    modelo: 'Renault Master',
    tipo: 'PROPRIO',
    status: 'ATIVO',
    alertas: {
      documentoVencido: false,
      manutencaoPendente: false,
      kmDesatualizado: true
    },
    detalhes: {
      marca: 'Renault',
      ano: 2020,
      chassi: '9BWZZZ377VT004253',
      renavam: '11223344556',
      kmAtual: 34900,
      ultimaAtualizacaoKm: '2026-01-30'
    },
    documentos: [{ id: 1, tipo: 'CRLV', validade: '2026-11-05', arquivoUrl: '#' }],
    manutencoes: [
      {
        id: 1,
        data: '2026-01-15',
        tipo: 'Preventiva',
        descricao: 'Alinhamento e balanceamento',
        valor: 480,
        km: 33000,
        proximaRevisaoData: '2026-06-15',
        proximaRevisaoKm: 40000
      }
    ],
    checklistHistorico: [
      { id: 1, data: '2026-04-18', responsavel: 'Mariana Souza', observacoes: 'OK' }
    ]
  }
];
