-- CreateEnum
CREATE TYPE "StatusComissaoIndicacao" AS ENUM ('PENDENTE', 'PAGA');

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "indicadorId" TEXT;

-- CreateTable
CREATE TABLE "Indicador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "contato" TEXT,
    "chavePix" TEXT,
    "percentualPadrao" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Indicador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComissaoIndicacao" (
    "id" TEXT NOT NULL,
    "percentual" DOUBLE PRECISION NOT NULL,
    "valorPago" DOUBLE PRECISION NOT NULL,
    "valorComissao" DOUBLE PRECISION NOT NULL,
    "status" "StatusComissaoIndicacao" NOT NULL DEFAULT 'PENDENTE',
    "dataPagamentoComissao" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indicadorId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "pagamentoAssinaturaId" TEXT NOT NULL,

    CONSTRAINT "ComissaoIndicacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComissaoIndicacao_pagamentoAssinaturaId_key" ON "ComissaoIndicacao"("pagamentoAssinaturaId");

-- CreateIndex
CREATE INDEX "ComissaoIndicacao_indicadorId_idx" ON "ComissaoIndicacao"("indicadorId");

-- CreateIndex
CREATE INDEX "ComissaoIndicacao_empresaId_idx" ON "ComissaoIndicacao"("empresaId");

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_indicadorId_fkey" FOREIGN KEY ("indicadorId") REFERENCES "Indicador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComissaoIndicacao" ADD CONSTRAINT "ComissaoIndicacao_indicadorId_fkey" FOREIGN KEY ("indicadorId") REFERENCES "Indicador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComissaoIndicacao" ADD CONSTRAINT "ComissaoIndicacao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComissaoIndicacao" ADD CONSTRAINT "ComissaoIndicacao_pagamentoAssinaturaId_fkey" FOREIGN KEY ("pagamentoAssinaturaId") REFERENCES "PagamentoAssinatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;
