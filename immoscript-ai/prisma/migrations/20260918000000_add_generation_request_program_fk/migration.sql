-- Nettoie d'abord les éventuelles lignes déjà orphelines (Program supprimé sans que
-- GenerationRequest suive, faute de contrainte jusqu'ici) pour que l'ajout de la clé étrangère
-- ci-dessous ne puisse pas échouer contre des données existantes.
DELETE FROM "GenerationRequest" gr
WHERE NOT EXISTS (SELECT 1 FROM "Program" p WHERE p.id = gr."programId");

-- AddForeignKey
ALTER TABLE "GenerationRequest" ADD CONSTRAINT "GenerationRequest_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
