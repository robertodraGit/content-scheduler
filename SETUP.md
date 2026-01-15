# Content Scheduler - Setup Guide

## Prerequisiti

1. Account Supabase con progetto creato
2. Account TikTok for Developers con app creata
3. Account Facebook Developer con app creata (per Instagram)

## Configurazione Supabase

### 1. Esegui le migrations

Esegui le migrations SQL nella cartella `supabase/migrations/` nell'ordine:
- `001_initial_schema.sql`
- `002_storage_policies.sql`
- `003_cron_setup.sql`

### 2. Crea il bucket Storage

1. Vai su Supabase Dashboard > Storage
2. Crea un nuovo bucket chiamato `post-media`
3. Imposta come **pubblico** (necessario per Instagram API)

### 3. Configura pg_cron

Dopo aver eseguito `003_cron_setup.sql`, devi configurare l'URL di Supabase e la Service Role Key che i cron job useranno per chiamare le Edge Functions.

**Opzione 1: Configurazione tramite SQL (Consigliata)**

Esegui questi comandi SQL nel SQL Editor di Supabase Dashboard, sostituendo i valori con quelli del tuo progetto:

```sql
-- Sostituisci con il tuo URL Supabase (es: https://abcdefgh.supabase.co)
ALTER DATABASE postgres SET app.supabase_url = 'https://dewvvhwwpvkzcwpqaeay.supabase.co';

-- Sostituisci con la tua Service Role Key (la trovi in Settings > API > service_role key)
ALTER DATABASE postgres SET app.service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRld3Z2aHd3cHZremN3cHFhZWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODUwNjM3MiwiZXhwIjoyMDg0MDgyMzcyfQ.g2GWVbZ5R6M358AAiCKXl4ChhTK6AUPTbx1OXq68aFM';
```

**Dove trovare questi valori:**
- **Supabase URL**: Dashboard > Settings > API > Project URL
- **Service Role Key**: Dashboard > Settings > API > service_role (key) - ⚠️ **NON condividere questa chiave pubblicamente!**

**Opzione 2: Modifica diretta dello script SQL**

Se preferisci, puoi modificare `003_cron_setup.sql` e sostituire `current_setting('app.supabase_url')` e `current_setting('app.service_role_key')` con i valori diretti:

```sql
-- Esempio (non consigliato per sicurezza, ma funziona)
SELECT cron.schedule(
  'publish-scheduled-posts',
  '* * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/publish-scheduled',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer your-service-role-key-here'
      )
    ) AS request_id;
  $$
);
```

**Verifica che i cron job siano attivi:**

```sql
SELECT * FROM cron.job;
```

Dovresti vedere due job: `publish-scheduled-posts` e `refresh-tiktok-tokens`.

### 4. Deploy Edge Functions

```bash
supabase functions deploy publish-scheduled
supabase functions deploy refresh-tokens
```

## Configurazione Variabili d'Ambiente

Crea un file `.env.local` con:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site URL (per OAuth callbacks)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# TikTok
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret

# Instagram/Facebook
INSTAGRAM_APP_ID=your-facebook-app-id
INSTAGRAM_APP_SECRET=your-facebook-app-secret
```

## Configurazione TikTok

1. Vai su [TikTok for Developers](https://developers.tiktok.com/)
2. Crea una nuova app
3. Abilita "Content Posting API"
4. Configura i redirect URI: `http://localhost:3000/api/auth/tiktok/callback` (e la versione di produzione)
5. Ottieni Client Key e Client Secret

**Nota**: Per pubblicare contenuti pubblici, l'app deve essere approvata da TikTok.

## Configurazione Instagram

1. Vai su [Facebook Developers](https://developers.facebook.com/)
2. Crea una nuova app
3. Aggiungi il prodotto "Instagram Graph API"
4. Configura i redirect URI: `http://localhost:3000/api/auth/instagram/callback` (e la versione di produzione)
5. Richiedi i permessi:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
6. Ottieni App ID e App Secret

**Nota**: 
- L'account Instagram deve essere Business o Creator
- L'account Instagram deve essere collegato a una Facebook Page
- L'app deve essere in modalità Live per utenti reali

## Installazione Dipendenze

```bash
pnpm install
```

## Avvio Applicazione

```bash
pnpm dev
```

L'app sarà disponibile su `http://localhost:3000`

## Note Importanti

1. **TikTok**: I token di accesso durano 24 ore, i refresh token 365 giorni. Il sistema aggiorna automaticamente i token.
2. **Instagram**: I long-lived token durano 60 giorni. Dopo la scadenza, l'utente deve riconnettersi.
3. **Rate Limits**: Instagram limita a 100 post/24h via API.
4. **Storage**: Le immagini devono essere pubbliche per funzionare con Instagram API.
