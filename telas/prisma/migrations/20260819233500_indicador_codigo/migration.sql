-- AlterTable
-- Tabela Indicador ainda está vazia em produção (feature recém-criada),
-- então dá pra adicionar a coluna NOT NULL direto, sem precisar de backfill.
ALTER TABLE "Indicador" ADD COLUMN "codigo" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Indicador_codigo_key" ON "Indicador"("codigo");
