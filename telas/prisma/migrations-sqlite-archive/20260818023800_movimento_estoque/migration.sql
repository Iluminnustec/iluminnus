-- CreateTable
CREATE TABLE "MovimentoEstoque" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT NOT NULL,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemEstoqueId" TEXT NOT NULL,
    CONSTRAINT "MovimentoEstoque_itemEstoqueId_fkey" FOREIGN KEY ("itemEstoqueId") REFERENCES "ItemEstoque" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
