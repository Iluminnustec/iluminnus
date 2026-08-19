-- CreateTable
CREATE TABLE "Despesa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'OUTROS',
    "fornecedor" TEXT,
    "valorTotal" REAL NOT NULL,
    "dataCompra" DATETIME NOT NULL,
    "formaPagamento" TEXT NOT NULL DEFAULT 'A_VISTA',
    "numeroParcelas" INTEGER NOT NULL DEFAULT 1,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DespesaParcela" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "valor" REAL NOT NULL,
    "vencimento" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataPagamento" DATETIME,
    "despesaId" TEXT NOT NULL,
    CONSTRAINT "DespesaParcela_despesaId_fkey" FOREIGN KEY ("despesaId") REFERENCES "Despesa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemEstoque" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "categoria" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "valorUnitario" REAL,
    "fornecedor" TEXT,
    "dataEntrada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DISPONIVEL',
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
