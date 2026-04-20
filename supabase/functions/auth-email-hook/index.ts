import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { parseEmailWebhookPayload } from 'npm:@lovable.dev/email-js'
import { WebhookError, verifyWebhookRequest } from 'npm:@lovable.dev/webhooks-js'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.1.0'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-lovable-signature, x-lovable-timestamp, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, webhook-id, webhook-signature, webhook-timestamp',
}

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirm your email',
  email: 'Confirm your email',
  invite: "You've been invited",
  magiclink: 'Your login link',
  recovery: 'Reset your password',
  email_change: 'Confirm your new email',
  reauthentication: 'Your verification code',
}

const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

const VERIFY_TYPE_BY_EMAIL_TYPE: Record<string, string> = {
  signup: 'email',
  email: 'email',
  invite: 'invite',
  magiclink: 'magiclink',
  recovery: 'recovery',
  email_change: 'email_change',
}

const SITE_NAME = 'campus-link-wu'
const SENDER_DOMAIN = 'notify.lomaria.at'
const ROOT_DOMAIN = 'lomaria.at'
const FROM_DOMAIN = 'lomaria.at'

const SAMPLE_PROJECT_URL = 'https://campus-link-wu.lovable.app'
const SAMPLE_EMAIL = 'user@example.test'
const SAMPLE_DATA: Record<string, object> = {
  signup: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    recipient: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  magiclink: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  recovery: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  invite: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  email_change: {
    siteName: SITE_NAME,
    email: SAMPLE_EMAIL,
    newEmail: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  reauthentication: {
    token: '123456',
  },
}

type LegacyEmailPayload = {
  version?: string
  run_id?: string
  data: {
    action_type: string
    email: string
    url?: string
    token?: string
    new_email?: string
  }
}

type SupabaseEmailHookPayload = {
  user: {
    email: string
    new_email?: string
  }
  email_data: {
    token?: string
    token_hash?: string
    redirect_to?: string
    email_action_type: string
    site_url?: string
    token_new?: string
    token_hash_new?: string
  }
}

type NormalizedEmailPayload = {
  emailType: string
  recipientEmail: string
  confirmationUrl: string
  token?: string
  siteUrl: string
  newEmail?: string
  runId: string
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function resolveEmailType(emailType: string) {
  return emailType === 'email' ? 'signup' : emailType
}

function isSkippableEmailType(emailType: string) {
  return emailType.endsWith('_notification')
}

function isStandardWebhookRequest(req: Request) {
  return (
    req.headers.has('webhook-id') ||
    req.headers.has('webhook-signature') ||
    req.headers.has('webhook-timestamp')
  )
}

function getStandardWebhookSecret() {
  const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')

  if (!hookSecret) {
    throw new Error('SEND_EMAIL_HOOK_SECRET not configured')
  }

  return hookSecret.replace('v1,whsec_', '')
}

function createSupabaseAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin credentials are not configured')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

async function sendEmailDirectly({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}) {
  const apiKey = Deno.env.get('RESEND_API_KEY')

  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured')
  }

  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from: `${SITE_NAME} <hi@hi.${FROM_DOMAIN}>`,
    to: [to],
    subject,
    html,
    text,
  })

  if (error) {
    throw new Error(`Direct send failed: ${error.message}`)
  }
}

function buildSupabaseConfirmationUrl({
  emailType,
  tokenHash,
  redirectTo,
}: {
  emailType: string
  tokenHash?: string
  redirectTo?: string
}) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')

  if (!supabaseUrl || !tokenHash) {
    return redirectTo || `https://${ROOT_DOMAIN}`
  }

  const verifyType = VERIFY_TYPE_BY_EMAIL_TYPE[emailType] || emailType
  const url = new URL('/auth/v1/verify', supabaseUrl)
  url.searchParams.set('token', tokenHash)
  url.searchParams.set('type', verifyType)

  if (redirectTo) {
    url.searchParams.set('redirect_to', redirectTo)
  }

  return url.toString()
}

function normalizeLegacyPayload(payload: LegacyEmailPayload): NormalizedEmailPayload {
  const resolvedEmailType = resolveEmailType(payload.data.action_type)

  return {
    emailType: resolvedEmailType,
    recipientEmail: payload.data.email,
    confirmationUrl: payload.data.url || `https://${ROOT_DOMAIN}`,
    token: payload.data.token,
    siteUrl: `https://${ROOT_DOMAIN}`,
    newEmail: payload.data.new_email,
    runId: payload.run_id || crypto.randomUUID(),
  }
}

function normalizeSupabasePayload(payload: SupabaseEmailHookPayload): NormalizedEmailPayload {
  const rawEmailType = payload.email_data.email_action_type
  const resolvedEmailType = resolveEmailType(rawEmailType)

  return {
    emailType: resolvedEmailType,
    recipientEmail: payload.user.email,
    confirmationUrl: buildSupabaseConfirmationUrl({
      emailType: rawEmailType,
      tokenHash: payload.email_data.token_hash || payload.email_data.token_hash_new,
      redirectTo: payload.email_data.redirect_to,
    }),
    token: payload.email_data.token,
    siteUrl: payload.email_data.site_url || `https://${ROOT_DOMAIN}`,
    newEmail: payload.user.new_email,
    runId: crypto.randomUUID(),
  }
}

async function parseStandardWebhookPayload(req: Request) {
  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  const webhook = new Webhook(getStandardWebhookSecret())

  return normalizeSupabasePayload(
    webhook.verify(payload, headers) as SupabaseEmailHookPayload
  )
}

async function parseLegacyWebhookPayload(req: Request) {
  const apiKey = Deno.env.get('LOVABLE_API_KEY')

  if (!apiKey) {
    throw new Error('LOVABLE_API_KEY not configured')
  }

  const verified = await verifyWebhookRequest({
    req,
    secret: apiKey,
    parser: parseEmailWebhookPayload,
  })

  return normalizeLegacyPayload(verified.payload as LegacyEmailPayload)
}

async function handlePreview(req: Request): Promise<Response> {
  const previewCorsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: previewCorsHeaders })
  }

  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  const authHeader = req.headers.get('Authorization')

  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let type: string
  try {
    const body = await req.json()
    type = resolveEmailType(body.type)
  } catch (_error) {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const EmailTemplate = EMAIL_TEMPLATES[type]

  if (!EmailTemplate) {
    return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
      status: 400,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const sampleData = SAMPLE_DATA[type] || {}
  const html = await renderAsync(React.createElement(EmailTemplate, sampleData))

  return new Response(html, {
    status: 200,
    headers: { ...previewCorsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  })
}

async function handleWebhook(req: Request): Promise<Response> {
  let normalizedPayload: NormalizedEmailPayload

  try {
    normalizedPayload = isStandardWebhookRequest(req)
      ? await parseStandardWebhookPayload(req)
      : await parseLegacyWebhookPayload(req)
  } catch (error) {
    if (error instanceof WebhookError) {
      console.error('Invalid legacy webhook signature', { error: error.message })
      return jsonResponse({ error: 'Invalid signature' }, 401)
    }

    console.error('Webhook verification failed', {
      error: error instanceof Error ? error.message : error,
    })
    return jsonResponse({ error: 'Invalid webhook payload' }, 400)
  }

  const { emailType, recipientEmail, runId } = normalizedPayload
  console.log('Received auth event', { emailType, email: recipientEmail, run_id: runId })

  const EmailTemplate = EMAIL_TEMPLATES[emailType]
  if (!EmailTemplate) {
    if (isSkippableEmailType(emailType)) {
      console.log('Skipping unsupported notification email type', {
        emailType,
        email: recipientEmail,
        run_id: runId,
      })
      return jsonResponse({ success: true, skipped: true }, 200)
    }

    console.error('Unknown email type', { emailType, run_id: runId })
    return jsonResponse({ error: `Unknown email type: ${emailType}` }, 400)
  }

  const templateProps = {
    siteName: SITE_NAME,
    siteUrl: normalizedPayload.siteUrl,
    recipient: recipientEmail,
    confirmationUrl: normalizedPayload.confirmationUrl,
    token: normalizedPayload.token,
    email: recipientEmail,
    newEmail: normalizedPayload.newEmail,
  }

  const html = await renderAsync(React.createElement(EmailTemplate, templateProps))
  const text = await renderAsync(React.createElement(EmailTemplate, templateProps), {
    plainText: true,
  })

  const supabase = createSupabaseAdminClient()
  const messageId = crypto.randomUUID()

  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: emailType,
    recipient_email: recipientEmail,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'auth_emails',
    payload: {
      run_id: runId,
      message_id: messageId,
      to: recipientEmail,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject: EMAIL_SUBJECTS[emailType] || 'Notification',
      html,
      text,
      purpose: 'transactional',
      label: emailType,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    console.error('Failed to enqueue auth email', {
      error: enqueueError,
      run_id: runId,
      emailType,
    })

    if (enqueueError.code === 'PGRST202') {
      try {
        await sendEmailDirectly({
          to: recipientEmail,
          subject: EMAIL_SUBJECTS[emailType] || 'Notification',
          html,
          text,
        })

        await supabase.from('email_send_log').insert({
          message_id: messageId,
          template_name: emailType,
          recipient_email: recipientEmail,
          status: 'sent',
          error_message: 'Fallback direct send used because enqueue_email is unavailable',
        })

        console.log('Auth email sent via direct fallback', {
          emailType,
          email: recipientEmail,
          run_id: runId,
        })

        return jsonResponse({ success: true, queued: false, fallback: 'direct' }, 200)
      } catch (directSendError) {
        console.error('Direct fallback send failed', {
          error: directSendError instanceof Error ? directSendError.message : directSendError,
          run_id: runId,
          emailType,
        })
      }
    }

    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: emailType,
      recipient_email: recipientEmail,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    })

    return jsonResponse({ error: 'Failed to enqueue email' }, 500)
  }

  console.log('Auth email enqueued', { emailType, email: recipientEmail, run_id: runId })
  return jsonResponse({ success: true, queued: true }, 200)
}

Deno.serve(async (req) => {
  const url = new URL(req.url)

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (url.pathname.endsWith('/preview')) {
    return handlePreview(req)
  }

  try {
    return await handleWebhook(req)
  } catch (error) {
    console.error('Webhook handler error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return jsonResponse({ error: message }, 500)
  }
})
