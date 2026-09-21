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

  const [organizations, users] = await Promise.all([
    prisma.organization.findMany({
      where: { id: { in: [...new Set(feedbacks.map((f) => f.organizationId))] } },
      select: { id: true, name: true },
    }),
    // Feedback.userId n'a pas de relation Prisma vers User (juste un id stocké) : jointure
    // manuelle, nécessaire pour pouvoir répondre à l'auteur d'un retour (voir mailto ci-dessous).
    prisma.user.findMany({
      where: { id: { in: [...new Set(feedbacks.map((f) => f.userId))] } },
      select: { id: true, name: true, email: true },
    }),
  ]);
  const organizationNames = new Map(organizations.map((o) => [o.id, o.name]));
  const usersById = new Map(users.map((u) => [u.id, u]));

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
          {feedbacks.map((feedback) => {
            const author = usersById.get(feedback.userId);
            return (
              <li key={feedback.id} className="rounded-3xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)] p-4">
                <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {author?.name ?? "Utilisateur inconnu"} · {organizationNames.get(feedback.organizationId) ?? feedback.organizationId}
                  </span>
                  <span>
                    {feedback.createdAt.toLocaleString("fr-FR")}
                    {feedback.page ? ` · ${feedback.page}` : ""}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{feedback.message}</p>
                {author?.email && (
                  <a
                    href={`mailto:${author.email}?subject=${encodeURIComponent("Re : votre feedback ImmoScript AI")}`}
                    className="mt-2 inline-block text-xs font-medium text-brand-600 hover:underline"
                  >
                    Répondre à {author.email}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
