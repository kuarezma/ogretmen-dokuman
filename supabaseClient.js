const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim() || 'https://xvamwpkmdptvkscbujlh.supabase.co';
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim() || 'sb_publishable_rsdbjferlnIhZSNoJ442VQ_VTy35oCO';
const SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);
module.exports = supabase;
