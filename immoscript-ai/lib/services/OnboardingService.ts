import { prisma } from "@/lib/prisma";
import type { ListingOutput } from "@/lib/ai/schemas";

// Exemple réel, produit par le pipeline de génération (AIService.generateContent, type
// "listing_short") à partir des champs ci-dessous — pas un texte écrit à la main. Même donnée que
// components/home/ShowcaseExample.tsx sur la page d'accueil, pour que la promesse faite avant
// inscription soit exactement ce que le nouvel utilisateur retrouve dans son compte.
const DEMO_LISTING: ListingOutput = {
  title: "T3 vue Garonne aux Rives d'Argent - Bacalan",
  description:
    "À Bordeaux-Bacalan, dans la résidence neuve Les Rives d'Argent en bord de fleuve, découvrez ce T3 traversant de 64 m² au 2ème étage. Baigné de lumière grâce à ses larges baies vitrées, il offre une vue dégagée sur la Garonne et un balcon de 9 m² plein Sud-Ouest. Idéal pour jeunes actifs et primo-accédants séduits par un cadre de vie premium, à deux pas du tramway et de la Cité du Vin. Parking et cave inclus, DPE B. Un quartier en pleine mutation, une résidence à taille humaine (48 lots) : le moment idéal pour investir dans votre futur chez-vous.",
  highlights: [
    "T3 traversant de 64 m² avec balcon 9 m²",
    "Vue dégagée sur la Garonne",
    "Orientation Sud-Ouest",
    "Parking sécurisé et cave inclus",
    "DPE B / GES A",
    "Tramway ligne B à 4 min à pied",
  ],
  cta: "Réservez votre visite dès aujourd'hui",
};

export class OnboardingService {
  /**
   * Programme d'exemple créé une seule fois à la création d'une organisation, pour que le premier
   * écran ne soit jamais vide : l'utilisateur a immédiatement un programme, un lot et un contenu
   * généré à explorer (régénérer, éditer, exporter...) avant même d'avoir saisi ses propres
   * données. Entièrement pré-rempli sans appel IA (contenu figé, voir DEMO_LISTING) : ne coûte
   * rien et ne consomme aucun quota. Un programme comme un autre une fois créé — supprimable,
   * modifiable, sans aucun traitement spécial ailleurs dans l'app.
   */
  static async seedDemoProgram(organizationId: string, userId: string): Promise<void> {
    const program = await prisma.program.create({
      data: {
        organizationId,
        name: "Les Rives d'Argent (exemple)",
        address: "12 quai des Chartrons",
        city: "Bordeaux",
        district: "Bacalan",
        description: "Résidence neuve de standing en bord de Garonne, architecture contemporaine, larges baies vitrées.",
        programType: "neuf",
        environment: "Bord de fleuve, quartier en pleine mutation",
        transport: "Tramway ligne B à 4 minutes à pied, gare Saint-Jean à 10 minutes",
        shops: "Commerces de proximité, Cité du Vin à 5 minutes",
        amenities: "Parking sécurisé, local à vélos, espaces verts paysagers",
        isCoOwnership: true,
        condoLotsCount: 48,
      },
    });

    const lot = await prisma.lot.create({
      data: {
        programId: program.id,
        reference: "B-204",
        propertyType: "T3",
        roomsCount: 3,
        livingArea: 64,
        outdoorArea: 9,
        floor: 2,
        orientation: "Sud-Ouest",
        exposure: "Traversant",
        view: "Vue dégagée sur la Garonne",
        hasBalcony: true,
        hasParking: true,
        hasCellar: true,
        dpeEnergyClass: "B",
        dpeGesClass: "A",
        price: 385000,
        availability: "disponible",
      },
    });

    const generationRequest = await prisma.generationRequest.create({
      data: {
        programId: program.id,
        lotId: lot.id,
        organizationId,
        requestedById: userId,
        positioning: ["premium"],
        target: "jeunes actifs et primo-accédants",
        tone: "chaleureux et valorisant",
        cta: "Réservez votre visite dès aujourd'hui",
        requestedTypes: ["listing_short"],
        promptVersion: "demo",
        status: "done",
      },
    });

    await prisma.generatedContent.create({
      data: {
        generationRequestId: generationRequest.id,
        programId: program.id,
        lotId: lot.id,
        type: "listing_short",
        content: DEMO_LISTING,
        approvalStatus: "approved",
        createdByUserId: userId,
      },
    });
  }
}
