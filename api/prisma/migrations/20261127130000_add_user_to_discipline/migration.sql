-- ATENÇÃO: as disciplinas já existentes não têm dono e serão apagadas
-- (atividades e notas somem junto, por causa do ON DELETE CASCADE).
DELETE FROM "Discipline";

-- AlterTable
ALTER TABLE "Discipline" ADD COLUMN "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Discipline_userId_idx" ON "Discipline"("userId");

-- AddForeignKey
ALTER TABLE "Discipline" ADD CONSTRAINT "Discipline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;