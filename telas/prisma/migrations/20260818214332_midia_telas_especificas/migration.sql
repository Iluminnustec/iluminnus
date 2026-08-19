-- AlterTable
ALTER TABLE "Midia" ALTER COLUMN "playlistId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_MidiaTelas" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MidiaTelas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MidiaTelas_B_index" ON "_MidiaTelas"("B");

-- AddForeignKey
ALTER TABLE "_MidiaTelas" ADD CONSTRAINT "_MidiaTelas_A_fkey" FOREIGN KEY ("A") REFERENCES "Midia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MidiaTelas" ADD CONSTRAINT "_MidiaTelas_B_fkey" FOREIGN KEY ("B") REFERENCES "Tela"("id") ON DELETE CASCADE ON UPDATE CASCADE;
