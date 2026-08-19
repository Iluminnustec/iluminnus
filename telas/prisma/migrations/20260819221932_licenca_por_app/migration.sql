-- CreateEnum
CREATE TYPE "StatusLicenca" AS ENUM ('ATIVA', 'SUSPENSA', 'CANCELADA');

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Licenca" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "status" "StatusLicenca" NOT NULL DEFAULT 'ATIVA',
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "empresaId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,

    CONSTRAINT "Licenca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "App_slug_key" ON "App"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Licenca_codigo_key" ON "Licenca"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Licenca_empresaId_appId_key" ON "Licenca"("empresaId", "appId");

-- AddForeignKey
ALTER TABLE "Licenca" ADD CONSTRAINT "Licenca_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licenca" ADD CONSTRAINT "Licenca_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed do App Telas (id fixo pra essa migration ficar idempotente se rodar
-- duas vezes por engano).
INSERT INTO "App" ("id", "nome", "slug", "createdAt")
VALUES ('app-telas', 'Telas', 'telas', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- Backfill: uma Licenca por Empresa já existente, reaproveitando o código
-- que estava na coluna antiga, ligada ao App Telas.
INSERT INTO "Licenca" ("id", "codigo", "status", "criadaEm", "empresaId", "appId")
SELECT
  UPPER(SUBSTRING(md5(random()::text || e."id"), 1, 25)),
  e."licenca",
  'ATIVA',
  CURRENT_TIMESTAMP,
  e."id",
  (SELECT "id" FROM "App" WHERE "slug" = 'telas')
FROM "Empresa" e
WHERE e."licenca" IS NOT NULL;

-- DropColumn
ALTER TABLE "Empresa" DROP COLUMN "licenca";
