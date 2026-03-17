import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xvamwpkmdptvkscbujlh.supabase.co";
const supabaseKey = "sb_publishable_rsdbjferlnIhZSNoJ442VQ_VTy35oCO";

export const supabase = createClient(supabaseUrl, supabaseKey);
