import express from 'express';
import cors from 'cors';
import { clerkMiddleware, getAuth } from '@clerk/express';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const requiredEnv = ['ANTHROPIC_API_KEY', 'CLERK_SECRET_KEY'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = express();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// In-memory review counter — replace with a DB for production
const reviewCounts = new Map();
const FREE_REVIEW_LIMIT = 3;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50kb' }));
app.use(clerkMiddleware());

app.get('/api/status', (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.json({ reviewsUsed: 0 });
  res.json({ reviewsUsed: reviewCounts.get(userId) || 0 });
});

app.post('/api/review', async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Non authentifié' });

  const count = reviewCounts.get(userId) || 0;
  if (count >= FREE_REVIEW_LIMIT) {
    return res.status(429).json({ error: 'Limite atteinte', limitReached: true });
  }

  const { code } = req.body;
  if (!code?.trim()) return res.status(400).json({ error: 'Code requis' });
  if (code.length > 10_000) return res.status(400).json({ error: 'Code trop long (max 10 000 caractères)' });

  const prompt = `Tu es un expert en code review. Analyse ce code et retourne UNIQUEMENT un objet JSON valide (sans markdown, sans backticks, sans texte avant ou après).

Le JSON doit avoir exactement cette structure :
{
  "score": <nombre entre 0 et 100>,
  "summary": "<résumé court en français>",
  "issues": [
    {
      "type": "<bug|performance|style|security>",
      "severity": "<high|medium|low>",
      "title": "<titre court>",
      "line": <numéro de ligne ou 0>,
      "description": "<explication en français>",
      "fix": "<exemple de correction en code>"
    }
  ]
}

Code à analyser :
\`\`\`
${code}
\`\`\``;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content.map(b => b.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    reviewCounts.set(userId, count + 1);
    res.json({ ...result, reviewsUsed: count + 1 });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ error: "Erreur lors de l'analyse. Réessaie !" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
