# Sistema de Gestão de Frotas

Estrutura inicial de um sistema completo de gestão de frotas com:

- **Frontend**: React + Vite (dashboard responsivo e componentizado)
- **Backend**: Node.js + Express
- **Banco de dados**: PostgreSQL
- **Arquitetura**: separação clara entre frontend e backend

## Estrutura

```bash
.
├── backend
├── frontend
├── db
└── docker-compose.yml
```

## Como executar

### 1) Banco de dados (PostgreSQL)

```bash
docker compose up -d postgres
```

### 2) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Servidor API: `http://localhost:3333`

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicação web: `http://localhost:5173`

## Endpoints da API

- `GET /api/health`
- CRUD completo em:
  - `/api/veiculos`
  - `/api/motoristas`
  - `/api/rotas-modelo`
  - `/api/rotas`
  - `/api/contratos`
  - `/api/manutencoes`
  - `/api/documentos`
  - `/api/fechamento-mensal`

## Banco de dados

Arquivo de schema inicial em `db/schema.sql` com tabelas:

- `veiculos`
- `motoristas`
- `veiculos_motorista`
- `rotas_modelo`
- `rotas`
- `contratos`
- `manutencoes`
- `documentos`
- `checklist`
- `fechamento_mensal`

