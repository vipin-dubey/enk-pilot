import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const MVA_DEADLINES = [
  { month: 1, day: 10, type: 'mva' },
  { month: 3, day: 10, type: 'mva' },
  { month: 5, day: 10, type: 'mva' },
  { month: 7, day: 10, type: 'mva' },
  { month: 9, day: 10, type: 'mva' },
  { month: 11, day: 10, type: 'mva' },
]

const FORSKUDDSSKATT_DEADLINES = [
  { month: 3, day: 15, type: 'forskuddsskatt' },
  { month: 5, day: 15, type: 'forskuddsskatt' },
  { month: 9, day: 15, type: 'forskuddsskatt' },
  { month: 11, day: 15, type: 'forskuddsskatt' },
]

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 1. Fetch all profiles with their reminder settings
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email_notifications_enabled, push_notifications_enabled, reminder_lead_days, default_locale, full_name')

  if (profileError) return new Response(JSON.stringify(profileError), { status: 500 })

  const results = []

  for (const profile of profiles) {
    const leadDays = profile.reminder_lead_days || [1, 7, 14]
    const currentYear = today.getFullYear()

    // Check deadlines for current and next year (to handle January deadlines)
    const years = [currentYear, currentYear + 1]
    const allDeadlines = []

    for (const year of years) {
      MVA_DEADLINES.forEach(d => allDeadlines.push({ ...d, date: new Date(year, d.month - 1, d.day) }))
      FORSKUDDSSKATT_DEADLINES.forEach(d => allDeadlines.push({ ...d, date: new Date(year, d.month - 1, d.day) }))
    }

    for (const deadline of allDeadlines) {
      const deadlineDate = deadline.date
      deadlineDate.setHours(0, 0, 0, 0)

      // Calculate days until deadline
      const diffTime = deadlineDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Check if this is a lead day we should notify for
      if (leadDays.includes(diffDays)) {
        // Check if already notified for this lead day
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', profile.id)
          .eq('type', 'deadlines')
          .eq('metadata->deadline_date', deadlineDate.toISOString().split('T')[0])
          .eq('metadata->lead_day', diffDays)
          .single()

        if (!existing) {
          // Check if already paid
          const { data: paid } = await supabase
            .from('deadline_submissions')
            .select('id')
            .eq('user_id', profile.id)
            .eq('deadline_type', deadline.type)
            .eq('deadline_date', deadlineDate.toISOString().split('T')[0])
            .single()

          if (!paid) {
            const locale = profile.default_locale || 'nb'
            const isEnglish = locale === 'en'

            const typeLabel = deadline.type === 'mva' ? 'MVA' : (isEnglish ? 'Advance Tax' : 'Forskuddsskatt')
            const title = isEnglish ? `Deadline Reminder: ${typeLabel}` : `Påminnelse: ${typeLabel}-frist`
            const message = isEnglish
              ? `Your ${typeLabel} deadline is in ${diffDays} day${diffDays === 1 ? '' : 's'} (${deadlineDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}).`
              : `Din ${typeLabel}-frist er om ${diffDays} dag${diffDays === 1 ? '' : 'er'} (${deadlineDate.toLocaleDateString('nb-NO', { month: 'long', day: 'numeric', year: 'numeric' })}).`

            // Create dashboard notification
            await supabase.from('notifications').insert({
              user_id: profile.id,
              type: 'deadlines',
              title,
              message,
              metadata: {
                deadline_date: deadlineDate.toISOString().split('T')[0],
                lead_day: diffDays,
                type: deadline.type
              }
            })

            // Send Email if enabled and API key is present
            if (profile.email_notifications_enabled && RESEND_API_KEY) {
              try {
                const { data: { user } } = await supabase.auth.admin.getUserById(profile.id)

                if (user?.email) {
                  const emailBody = `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <style>
                      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
                      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                      .header { background-color: #ffffff; padding: 32px 32px 16px 32px; text-align: center; border-bottom: 1px solid #f1f5f9; }
                      .logo-box { background-color: #2563eb; width: 44px; height: 44px; border-radius: 10px; display: inline-block; margin-bottom: 12px; text-align: center; }
                      .logo-text { color: #ffffff; font-weight: bold; font-size: 18px; line-height: 44px; margin: 0; padding: 0; display: block; }
                      .brand-name { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.025em; margin: 0; text-transform: uppercase; }
                      .content { padding: 32px; color: #475569; line-height: 1.6; }
                      .content h1 { color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 16px; text-align: center; }
                      .deadline-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
                      .deadline-item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
                      .deadline-label { font-weight: 600; color: #64748b; }
                      .deadline-value { font-weight: 700; color: #0f172a; }
                      .button { display: block; background-color: #2563eb; color: #ffffff !important; padding: 14px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center; margin-top: 24px; }
                      .footer { background-color: #f8fafc; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <div class="logo-box"><span class="logo-text">EP</span></div>
                        <h2 class="brand-name">ENK Pilot</h2>
                      </div>
                      <div class="content">
                        <h1>${isEnglish ? 'Deadline Reminder' : 'Påminnelse om frist'}</h1>
                        <p>Hei ${profile.full_name || 'deg'},</p>
                        <p>${isEnglish ? 'This is a friendly reminder from your financial co-pilot.' : 'Dette er en vennlig påminnelse fra din økonomiske medpilot.'}</p>
                        
                        <div class="deadline-card">
                          <div class="deadline-item">
                            <span class="deadline-label">${isEnglish ? 'Type:' : 'Type:'}</span>
                            <span class="deadline-value">${typeLabel}</span>
                          </div>
                          <div class="deadline-item">
                            <span class="deadline-label">${isEnglish ? 'Due Date:' : 'Forfallsdato:'}</span>
                            <span class="deadline-value">${deadlineDate.toLocaleDateString(isEnglish ? 'en-US' : 'nb-NO', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div class="deadline-item">
                            <span class="deadline-label">${isEnglish ? 'Days Remaining:' : 'Dager igjen:'}</span>
                            <span class="deadline-value">${diffDays}</span>
                          </div>
                        </div>

                        <p>${isEnglish ? 'Log in to ENK Pilot to record your payment and keep your tax health in check.' : 'Logg inn på ENK Pilot for å registrere betalingen og holde oversikt over din skattehelse.'}</p>
                        
                        <a href="https://enkpilot.com" class="button">${isEnglish ? 'Open Dashboard' : 'Åpne Dashboard'}</a>
                      </div>
                      <div class="footer">
                        <p><strong>ENK Pilot</strong> — ${isEnglish ? 'Your financial co-pilot' : 'Din økonomiske medpilot'}</p>
                        <p>Oslo, Norge</p>
                        <p style="margin-top: 12px;">${isEnglish ? 'You received this because you enabled email reminders in your settings.' : 'Du mottar denne e-posten fordi du har aktivert påminnelser i dine innstillinger.'}</p>
                        <p>&copy; 2026 ENK Pilot</p>
                      </div>
                    </div>
                  </body>
                  </html>
                  `

                  const res = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                      from: 'ENK Pilot <no-reply@notify.enkpilot.com>',
                      to: [user.email],
                      subject: title,
                      html: emailBody,
                      headers: {
                        'List-Unsubscribe': '<https://enkpilot.com/settings>',
                        'X-Entity-Ref-ID': `${profile.id}-${deadlineDate.getTime()}`
                      }
                    }),
                  })

                  if (!res.ok) {
                    const error = await res.text()
                    console.error('Failed to send email via Resend:', error)
                  }
                }
              } catch (emailErr) {
                console.error('Email error:', emailErr)
              }
            }

            results.push({ user_id: profile.id, type: deadline.type, days: diffDays })
          }
        }
      }
    }
  }

  return new Response(JSON.stringify({ processed: results.length, details: results }), {
    headers: { "Content-Type": "application/json" },
  })
})
