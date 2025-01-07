import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tvldxqkpmphfyvbcrfwm.supabase.co'
const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2bGR4cWtwbXBoZnl2YmNyZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyMjM3NjEsImV4cCI6MjA1MTc5OTc2MX0.H2g7RhTsR6vI7Yvu__ScrqunHsw83NLY9PwelfimrUc`
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;