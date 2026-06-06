import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mgktcjbmzfespdpqqqin.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1na3RjamJtemZlc3BkcHFxcWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MjI2ODEsImV4cCI6MjA5NjE5ODY4MX0.9UAl3QTwVLawZ7fagwofnZ0PDBRiMoncnkS63qeUPgU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
