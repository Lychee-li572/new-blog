/**
 * 仅在 Serverless Function 中使用（api/ 目录）
 * 使用 service_role key，绕过 RLS
 */
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
