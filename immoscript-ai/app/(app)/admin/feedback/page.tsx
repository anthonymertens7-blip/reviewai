import { notFound } from "next/navigation";
import { isOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function FeedbackAdminPage() {
  // Vue volontairement cross-organisation : passe par le client Prisma brut
  // (pas le client scopé) car réservée au propriétaire de l'app, pas à un
  // rôle au sein d'une organisation.
  if (!(await isOwner())) {
    notFound();
  }

  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const organizations = await prisma.organization.findMany({
    where: { id: { in: [...new Set(feedbacks.map((f) => f.organizationId))] } },
    select: { id: true, name: true },
  });
  const organizationNames = new Map(organizations.map((o) => [o.id, o.name]));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Feedback</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{feedbacks.length} retour(s), toutes organisations confondues.</p>
      </div>

      {feedbacks.length === 0 ? (
        <p className="rounded-3xl border dark:border-gray-700 border-dashed p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Aucun feedback pour le moment.
        </p>
      ) : (
        <ul className="space-y-3">
          {feedbacks.map((feedback) => (
            <li key={feedback.id} className="rounded-3xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{organizationNames.get(feedback.organizationId) ?? feedback.organizationId}</span>
                <span>
                  {feedback.createdAt.toLocaleString("fr-FR")}
                  {feedback.page ? ` · ${feedback.page}` : ""}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-gray-800">{feedback.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
