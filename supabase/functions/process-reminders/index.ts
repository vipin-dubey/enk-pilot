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
                // Get user email from auth
                const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(profile.id)

                if (user?.email) {
                  const emailBody = isEnglish ? `
                    <h2>Tax Deadline Reminder</h2>
                    <p>Hi ${profile.full_name || 'there'},</p>
                    <p>This is a reminder that your <strong>${typeLabel}</strong> deadline is approaching.</p>
                    <p><strong>Due Date:</strong> ${deadlineDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p><strong>Days Remaining:</strong> ${diffDays}</p>
                    <p>Log in to ENK Pilot to mark it as paid once you've submitted your payment.</p>
                    <br/>
                    <p>Best regards,<br/>The ENK Pilot Team</p>
                  ` : `
                    <h2>Skattepåminnelse</h2>
                    <p>Hei ${profile.full_name || 'deg'},</p>
                    <p>Dette er en påminnelse om at din frist for <strong>${typeLabel}</strong> nærmer seg.</p>
                    <p><strong>Forfallsdato:</strong> ${deadlineDate.toLocaleDateString('nb-NO', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p><strong>Dager igjen:</strong> ${diffDays}</p>
                    <p>Logg inn på ENK Pilot for å markere den som betalt når du har sendt inn betalingen.</p>
                    <br/>
                    <p>Vennlig hilsen,<br/>ENK Pilot-teamet</p>
                  `

                  const res = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                      from: 'ENK Pilot <onboarding@resend.dev>',
                      to: [user.email],
                      subject: title,
                      html: emailBody,
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
