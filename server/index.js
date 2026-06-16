import express from 'express';
import cors from 'cors';
import { clerkMiddleware, getAuth } from '@clerk/express';
import Anthropic from '@anthropic-ai/sdk';
import Stripe from 'stripe';
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
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// In-memory stores — replace with a DB for production
const reviewCounts = new Map(); // userId → number
const userPlans = new Map();    // userId → 'free' | 'pro'
const FREE_REVIEW_LIMIT = 3;

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      cb(null, true);
    } else {
      cb(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));

// Webhook must be registered BEFORE express.json() to receive the raw body
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: 'Stripe non configuré' });
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const { userId } = event.data.object.metadata || {};
      if (userId) userPlans.set(userId, 'pro');
      console.log(`User ${userId} upgraded to Pro`);
      break;
    }
    case 'customer.subscription.deleted': {
      console.log('Subscription cancelled:', event.data.object.id);
      break;
    }
  }

  res.json({ received: true });
});

app.use(express.json({ limit: '50kb' }));
app.use(clerkMiddleware());

app.get('/api/status', (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.json({ reviewsUsed: 0, plan: 'free' });
  res.json({
    reviewsUsed: reviewCounts.get(userId) || 0,
    plan: userPlans.get(userId) || 'free',
  });
});

app.post('/api/checkout', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Paiement non configuré' });

  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Non authentifié' });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      metadata: { userId },
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}?checkout=success`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}?checkout=canceled`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Erreur lors de la création du paiement' });
  }
});

app.post('/api/review', async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Non authentifié' });

  const plan = userPlans.get(userId) || 'free';
  const count = reviewCounts.get(userId) || 0;

  if (plan === 'free' && count >= FREE_REVIEW_LIMIT) {
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
    res.json({ ...result, reviewsUsed: count + 1, plan });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ error: "Erreur lors de l'analyse. Réessaie !" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
