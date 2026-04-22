CREATE TABLE IF NOT EXISTS veiculos (
  id BIGSERIAL PRIMARY KEY,
  placa VARCHAR(10) NOT NULL UNIQUE,
  modelo VARCHAR(100) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  ano SMALLINT NOT NULL CHECK (ano BETWEEN 1900 AND 2100),
  chassi VARCHAR(30) NOT NULL UNIQUE,
  renavam VARCHAR(20) NOT NULL UNIQUE,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('PROPRIO', 'ALUGADO')),
  status VARCHAR(10) NOT NULL DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'PARADO')),
  km_atual INTEGER NOT NULL DEFAULT 0 CHECK (km_atual >= 0),
  data_ultima_atualizacao_km TIMESTAMP,
  foto_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS motoristas (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  telefone VARCHAR(30),
  nota NUMERIC(3, 1) NOT NULL DEFAULT 0 CHECK (nota >= 0 AND nota <= 10),
  status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS veiculos_motorista (
  id BIGSERIAL PRIMARY KEY,
  motorista_id BIGINT NOT NULL REFERENCES motoristas(id) ON DELETE CASCADE,
  placa VARCHAR(10) NOT NULL REFERENCES veiculos(placa) ON UPDATE CASCADE,
  modelo VARCHAR(100) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  ano SMALLINT NOT NULL CHECK (ano BETWEEN 1900 AND 2100),
  chassi VARCHAR(30) NOT NULL,
  renavam VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_veiculos_motorista_chassi UNIQUE (chassi),
  CONSTRAINT uq_veiculos_motorista_renavam UNIQUE (renavam)
);

CREATE TABLE IF NOT EXISTS rotas_modelo (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  descricao TEXT,
  valor_cobrado NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (valor_cobrado >= 0),
  valor_pago NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (valor_pago >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rotas (
  id BIGSERIAL PRIMARY KEY,
  data DATE NOT NULL,
  motorista_id BIGINT NOT NULL REFERENCES motoristas(id) ON DELETE RESTRICT,
  rota_modelo_id BIGINT NOT NULL REFERENCES rotas_modelo(id) ON DELETE RESTRICT,
  valor_cobrado NUMERIC(12, 2) NOT NULL CHECK (valor_cobrado >= 0),
  valor_pago NUMERIC(12, 2) NOT NULL CHECK (valor_pago >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contratos (
  id BIGSERIAL PRIMARY KEY,
  veiculo_id BIGINT NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  empresa VARCHAR(150) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  valor_recebido NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (valor_recebido >= 0),
  valor_pago NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (valor_pago >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_contratos_periodo CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

CREATE TABLE IF NOT EXISTS manutencoes (
  id BIGSERIAL PRIMARY KEY,
  veiculo_id BIGINT NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT,
  valor NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (valor >= 0),
  km INTEGER NOT NULL DEFAULT 0 CHECK (km >= 0),
  proxima_revisao_data DATE,
  proxima_revisao_km INTEGER CHECK (proxima_revisao_km IS NULL OR proxima_revisao_km >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documentos (
  id BIGSERIAL PRIMARY KEY,
  veiculo_id BIGINT NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  tipo VARCHAR(60) NOT NULL,
  validade DATE NOT NULL,
  arquivo_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklist (
  id BIGSERIAL PRIMARY KEY,
  veiculo_id BIGINT NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  responsavel VARCHAR(120) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fechamento_mensal (
  id BIGSERIAL PRIMARY KEY,
  mes SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano SMALLINT NOT NULL CHECK (ano BETWEEN 2000 AND 2200),
  total_recebido NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total_recebido >= 0),
  total_pago NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total_pago >= 0),
  total_manutencao NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total_manutencao >= 0),
  lucro NUMERIC(14, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'ABERTO',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_fechamento_mensal_competencia UNIQUE (mes, ano)
);

CREATE INDEX IF NOT EXISTS idx_veiculos_status ON veiculos(status);
CREATE INDEX IF NOT EXISTS idx_veiculos_motorista_motorista_id ON veiculos_motorista(motorista_id);
CREATE INDEX IF NOT EXISTS idx_rotas_data ON rotas(data);
CREATE INDEX IF NOT EXISTS idx_rotas_motorista_id ON rotas(motorista_id);
CREATE INDEX IF NOT EXISTS idx_rotas_modelo_id ON rotas(rota_modelo_id);
CREATE INDEX IF NOT EXISTS idx_contratos_veiculo_id ON contratos(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_manutencoes_veiculo_id ON manutencoes(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_documentos_veiculo_id ON documentos(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_checklist_veiculo_id ON checklist(veiculo_id);
