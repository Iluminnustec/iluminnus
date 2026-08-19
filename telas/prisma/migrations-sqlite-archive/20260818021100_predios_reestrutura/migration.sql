/*
  Warnings:

  - You are about to drop the column `telaId` on the `Cobranca` table. All the data in the column will be lost.
  - You are about to drop the column `bairro` on the `Tela` table. All the data in the column will be lost.
  - You are about to drop the column `cep` on the `Tela` table. All the data in the column will be lost.
  - You are about to drop the column `cidade` on the `Tela` table. All the data in the column will be lost.
  - You are about to drop the column `clienteId` on the `Tela` table. All the data in the column will be lost.
  - You are about to drop the column `endereco` on the `Tela` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `Tela` table. All the data in the column will be lost.
  - Added the required column `predioId` to the `Tela` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN "planoTelas" INTEGER;

-- CreateTable
CREATE TABLE "Predio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "bairro" TEXT,
    "cidade" TEXT NOT NULL DEFAULT 'João Pessoa',
    "estado" TEXT NOT NULL DEFAULT 'PB',
    "cep" TEXT,
    "sindicoNome" TEXT,
    "sindicoContato" TEXT,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cobranca" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "vencimento" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataPagamento" DATETIME,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clienteId" TEXT NOT NULL,
    CONSTRAINT "Cobranca_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Cobranca" ("clienteId", "createdAt", "dataPagamento", "descricao", "id", "observacoes", "status", "updatedAt", "valor", "vencimento") SELECT "clienteId", "createdAt", "dataPagamento", "descricao", "id", "observacoes", "status", "updatedAt", "valor", "vencimento" FROM "Cobranca";
DROP TABLE "Cobranca";
ALTER TABLE "new_Cobranca" RENAME TO "Cobranca";
CREATE TABLE "new_Tela" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'TV_ELEVADOR',
    "especificacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVA',
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "predioId" TEXT NOT NULL,
    CONSTRAINT "Tela_predioId_fkey" FOREIGN KEY ("predioId") REFERENCES "Predio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tela" ("createdAt", "especificacoes", "id", "nome", "observacoes", "status", "updatedAt") SELECT "createdAt", "especificacoes", "id", "nome", "observacoes", "status", "updatedAt" FROM "Tela";
DROP TABLE "Tela";
ALTER TABLE "new_Tela" RENAME TO "Tela";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
