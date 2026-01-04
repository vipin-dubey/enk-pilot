import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      throw new Error('No file uploaded')
    }

    // 1. Read file as base64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))

    // 2. Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "You are a Norwegian tax expert. Parse this Skattemelding or Skattekort PDF and extract key financial info for a sole proprietorship (ENK). Return ONLY a JSON object with 'tax_rate_percent' (decimal) and 'expected_profit' (number). If not found, use defaults: 35.0 and 0.",
                },
                {
                  inline_data: {
                    mime_type: 'application/pdf',
                    data: base64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
          },
        }),
      }
    )

    const result = await response.json()
    const text = result.candidates[0].content.parts[0].text
    const extractedData = JSON.parse(text)

    // 3. Update user profile in Supabase
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) throw new Error('Unauthorized')

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tax_rate_percent: extractedData.tax_rate_percent,
        updated_at: new Error().stack ? new Date().toISOString() : null, // dummy way to get ISO
      })
      .eq('id', user.id)

    if (updateError) throw updateError

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
