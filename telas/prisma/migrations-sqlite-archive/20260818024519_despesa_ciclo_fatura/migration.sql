-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Despesa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'OUTROS',
    "fornecedor" TEXT,
    "valorTotal" REAL NOT NULL,
    "dataCompra" DATETIME NOT NULL,
    "formaPagamento" TEXT NOT NULL DEFAULT 'A_VISTA',
    "numeroParcelas" INTEGER NOT NULL DEFAULT 1,
    "faturarMesSeguinte" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Despesa" ("categoria", "createdAt", "dataCompra", "descricao", "formaPagamento", "fornecedor", "id", "numeroParcelas", "observacoes", "updatedAt", "valorTotal") SELECT "categoria", "createdAt", "dataCompra", "descricao", "formaPagamento", "fornecedor", "id", "numeroParcelas", "observacoes", "updatedAt", "valorTotal" FROM "Despesa";
DROP TABLE "Despesa";
ALTER TABLE "new_Despesa" RENAME TO "Despesa";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
