// Script de seed pour le sandbox de test local (LOCAL_TEST_MODE=1). Jamais utilisé en
// production — crée des données réalistes pour tester l'app de bout en bout sans Clerk/Neon.
import { PrismaClient, Prisma, Role } from "@prisma/client";

const prisma = new PrismaClient();

const ORG_ID = process.env.LOCAL_TEST_ORG_ID ?? "local_test_org";
const ADMIN_USER_ID = process.env.LOCAL_TEST_USER_ID ?? "local_test_user";
const COLLAB_USER_ID = "local_test_collaborateur";

async function main() {
  await prisma.organization.upsert({
    where: { id: ORG_ID },
    create: { id: ORG_ID, name: "Organisation de test locale", plan: "pro" },
    update: {},
  });

  await prisma.user.upsert({
    where: { id: ADMIN_USER_ID },
    create: { id: ADMIN_USER_ID, organizationId: ORG_ID, role: Role.ADMIN, email: "test@local.dev", name: "Testeur Admin" },
    update: {},
  });

  await prisma.user.upsert({
    where: { id: COLLAB_USER_ID },
    create: { id: COLLAB_USER_ID, organizationId: ORG_ID, role: Role.COLLABORATEUR, email: "collab@local.dev", name: "Testeur Collaborateur" },
    update: {},
  });

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  await prisma.usageCounter.upsert({
    where: { organizationId_periodStart: { organizationId: ORG_ID, periodStart } },
    create: { organizationId: ORG_ID, periodStart, periodEnd, generationsUsed: 12, generationsQuota: 100 },
    update: {},
  });

  await prisma.brandVoicePreset.upsert({
    where: { id: "local_test_preset_1" },
    create: {
      id: "local_test_preset_1",
      organizationId: ORG_ID,
      name: "Premium",
      target: "Investisseurs et primo-accédants haut de gamme",
      tone: "élégant et rassurant",
      mainArgument: "Emplacement d'exception et prestations premium",
      cta: "Prenez rendez-vous pour une visite privée",
    },
    update: {},
  });

  const program1 = await prisma.program.upsert({
    where: { id: "local_test_program_1" },
    create: {
      id: "local_test_program_1",
      organizationId: ORG_ID,
      name: "Les Terrasses du Parc",
      address: "12 rue des Lilas",
      city: "Rennes",
      district: "Thabor",
      description: "Résidence neuve au cœur d'un quartier verdoyant, proche du centre-ville.",
      deliveryDate: new Date("2027-06-01"),
      programType: "neuf",
      unitsCount: 24,
      environment: "Quartier résidentiel calme, proche du parc du Thabor",
      transport: "Métro ligne A à 5 min à pied, arrêt Sainte-Anne",
      schools: "École primaire à 200m, collège à 10 min",
      shops: "Commerces de proximité au pied de l'immeuble",
      pointsOfInterest: "Parc du Thabor, centre-ville historique",
      amenities: "Ascenseur, local vélos, jardin partagé",
      features: "Balcons filants, double vitrage, chauffage collectif",
      advantages: "TVA réduite en zone ANRU, frais de notaire réduits",
      isCoOwnership: true,
      condoLotsCount: 24,
    },
    update: {},
  });

  const program2 = await prisma.program.upsert({
    where: { id: "local_test_program_2" },
    create: {
      id: "local_test_program_2",
      organizationId: ORG_ID,
      name: "Villa Bellevue",
      address: "8 impasse des Chênes",
      city: "Cesson-Sévigné",
      district: null,
      description: "Petite résidence de standing avec vue dégagée.",
      deliveryDate: new Date("2026-12-01"),
      programType: "neuf",
      unitsCount: 8,
      isCoOwnership: false,
    },
    update: {},
  });

  const lot1 = await prisma.lot.upsert({
    where: { id: "local_test_lot_1" },
    create: {
      id: "local_test_lot_1",
      programId: program1.id,
      reference: "A101",
      propertyType: "T3",
      roomsCount: 3,
      livingArea: 65.5,
      outdoorArea: 8,
      floor: 1,
      orientation: "Sud-Ouest",
      hasBalcony: true,
      hasParking: true,
      hasCellar: true,
      hasEquippedKitchen: true,
      dpeEnergyClass: "A",
      dpeGesClass: "A",
      condoAnnualCharges: 850,
      price: 285000,
      pricePerSqm: 4351,
      availability: "disponible",
    },
    update: {},
  });

  const lot2 = await prisma.lot.upsert({
    where: { id: "local_test_lot_2" },
    create: {
      id: "local_test_lot_2",
      programId: program1.id,
      reference: "B204",
      propertyType: "T2",
      roomsCount: 2,
      livingArea: 42,
      floor: 2,
      hasBalcony: true,
      dpeEnergyClass: "B",
      price: 195000,
      availability: "réservé",
    },
    update: {},
  });

  await prisma.programAccess.upsert({
    where: { programId_userId: { programId: program1.id, userId: COLLAB_USER_ID } },
    create: { programId: program1.id, userId: COLLAB_USER_ID },
    update: {},
  });

  const genReq = await prisma.generationRequest.upsert({
    where: { id: "local_test_genreq_1" },
    create: {
      id: "local_test_genreq_1",
      programId: program1.id,
      lotId: lot1.id,
      organizationId: ORG_ID,
      requestedById: ADMIN_USER_ID,
      positioning: ["premium", "investissement"],
      target: "Investisseurs et primo-accédants",
      tone: "élégant et rassurant",
      languageLevel: "soutenu",
      length: "moyen",
      commercialGoal: "prise de rendez-vous",
      mainArgument: "Emplacement d'exception et prestations premium",
      cta: "Prenez rendez-vous pour une visite privée",
      requestedTypes: ["listing_full", "instagram"],
      promptVersion: "v1",
      status: "done",
    },
    update: {},
  });

  const contentSamples: Array<{
    id: string;
    type: string;
    approvalStatus: string;
    content: Prisma.InputJsonValue;
    likes?: number;
    views?: number;
  }> = [
    {
      id: "local_test_content_1",
      type: "listing_full",
      approvalStatus: "approved",
      content: {
        title: "T3 lumineux avec balcon — Les Terrasses du Parc",
        description: "Découvrez ce T3 de 65,5 m² au 1er étage, baigné de lumière grâce à son orientation Sud-Ouest.",
        highlights: ["Balcon 8m²", "Parking inclus", "DPE classe A", "Proche métro"],
        cta: "Prenez rendez-vous pour une visite privée",
      },
      likes: 34,
      views: 512,
    },
    {
      id: "local_test_content_2",
      type: "instagram",
      approvalStatus: "pending_review",
      content: {
        caption: "✨ Nouveau T3 disponible aux Terrasses du Parc ! Balcon, parking, DPE A. Contactez-nous.",
        hashtags: ["immobilierrennes", "neuf", "appartementrennes"],
      },
      likes: 128,
      views: 2400,
    },
    {
      id: "local_test_content_3",
      type: "facebook",
      approvalStatus: "draft",
      content: {
        caption: "Un T2 avec balcon vient de se libérer à Rennes Thabor. Contactez notre équipe.",
        hashtags: ["rennes", "immobilier"],
      },
    },
  ];

  for (const sample of contentSamples) {
    await prisma.generatedContent.upsert({
      where: { id: sample.id },
      create: {
        id: sample.id,
        generationRequestId: genReq.id,
        programId: program1.id,
        lotId: lot1.id,
        type: sample.type,
        content: sample.content,
        approvalStatus: sample.approvalStatus,
        externalLikes: sample.likes,
        externalViews: sample.views,
        externalStatsUpdatedAt: sample.likes ? new Date() : null,
        createdByUserId: ADMIN_USER_ID,
      },
      update: {},
    });
  }

  console.log("Seed local terminé :", {
    organizationId: ORG_ID,
    adminUserId: ADMIN_USER_ID,
    collabUserId: COLLAB_USER_ID,
    programs: [program1.id, program2.id],
    lots: [lot1.id, lot2.id],
    contents: contentSamples.map((c) => c.id),
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
