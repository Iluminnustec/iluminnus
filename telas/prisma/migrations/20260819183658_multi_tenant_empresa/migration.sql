/*
  Warnings:

  - Added the required column `empresaId` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Cobranca` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Comissao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Despesa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `FechamentoComissao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `ItemEstoque` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Midia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Playlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Predio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Proposta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Tela` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('ATIVA', 'ATRASADA', 'SUSPENSA', 'CANCELADA');

-- AlterEnum
ALTER TYPE "Cargo" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Cobranca" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Comissao" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Despesa" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Dispositivo" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "FechamentoComissao" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ItemEstoque" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LogAtividade" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "Midia" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Predio" ADD COLUMN     "empresaId" TEXT NOT NULL,
ALTER COLUMN "cidade" DROP NOT NULL,
ALTER COLUMN "cidade" DROP DEFAULT,
ALTER COLUMN "estado" DROP NOT NULL,
ALTER COLUMN "estado" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Proposta" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tela" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "dominio" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assinatura" (
    "id" TEXT NOT NULL,
    "plano" TEXT NOT NULL,
    "valorMensal" DOUBLE PRECISION NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "status" "StatusAssinatura" NOT NULL DEFAULT 'ATIVA',
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proximoVencimento" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "Assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagamentoAssinatura" (
    "id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "referencia" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registradoPor" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assinaturaId" TEXT NOT NULL,

    CONSTRAINT "PagamentoAssinatura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_slug_key" ON "Empresa"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_dominio_key" ON "Empresa"("dominio");

-- CreateIndex
CREATE UNIQUE INDEX "Assinatura_empresaId_key" ON "Assinatura"("empresaId");

-- CreateIndex
CREATE INDEX "Cliente_empresaId_idx" ON "Cliente"("empresaId");

-- CreateIndex
CREATE INDEX "Cobranca_empresaId_idx" ON "Cobranca"("empresaId");

-- CreateIndex
CREATE INDEX "Comissao_empresaId_idx" ON "Comissao"("empresaId");

-- CreateIndex
CREATE INDEX "Despesa_empresaId_idx" ON "Despesa"("empresaId");

-- CreateIndex
CREATE INDEX "Dispositivo_empresaId_idx" ON "Dispositivo"("empresaId");

-- CreateIndex
CREATE INDEX "FechamentoComissao_empresaId_idx" ON "FechamentoComissao"("empresaId");

-- CreateIndex
CREATE INDEX "ItemEstoque_empresaId_idx" ON "ItemEstoque"("empresaId");

-- CreateIndex
CREATE INDEX "LogAtividade_empresaId_idx" ON "LogAtividade"("empresaId");

-- CreateIndex
CREATE INDEX "Midia_empresaId_idx" ON "Midia"("empresaId");

-- CreateIndex
CREATE INDEX "Playlist_empresaId_idx" ON "Playlist"("empresaId");

-- CreateIndex
CREATE INDEX "Predio_empresaId_idx" ON "Predio"("empresaId");

-- CreateIndex
CREATE INDEX "Proposta_empresaId_idx" ON "Proposta"("empresaId");

-- CreateIndex
CREATE INDEX "Tela_empresaId_idx" ON "Tela"("empresaId");

-- CreateIndex
CREATE INDEX "Usuario_empresaId_idx" ON "Usuario"("empresaId");

-- CreateIndex
CREATE INDEX "Venda_empresaId_idx" ON "Venda"("empresaId");

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoAssinatura" ADD CONSTRAINT "PagamentoAssinatura_assinaturaId_fkey" FOREIGN KEY ("assinaturaId") REFERENCES "Assinatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAtividade" ADD CONSTRAINT "LogAtividade_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Predio" ADD CONSTRAINT "Predio_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tela" ADD CONSTRAINT "Tela_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispositivo" ADD CONSTRAINT "Dispositivo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Midia" ADD CONSTRAINT "Midia_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobranca" ADD CONSTRAINT "Cobranca_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Despesa" ADD CONSTRAINT "Despesa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FechamentoComissao" ADD CONSTRAINT "FechamentoComissao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemEstoque" ADD CONSTRAINT "ItemEstoque_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
