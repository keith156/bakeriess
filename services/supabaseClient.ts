
import { createClient } from '@supabase/supabase-js';

const URL = 'https://yocpkhnblhhvehcwvagv.supabase.co';
const KEY = 'sb_publishable_st64KPg0Oe2bPGkqFbHPcw_iI_h3s3i';

/**
 * Diagnostic check for key validity.
 * Project API keys (anon/service) are typically long JWT strings starting with 'eyJ'.
 * Management keys usually start with 'sb_secret_'.
 * We will flag keys that are explicitly known to be for management only.
 */
export const isKeyInvalidType = KEY.startsWith('sb_secret_');

export const supabase = createClient(URL, KEY);

if (isKeyInvalidType) {
  console.warn("Supabase Client: Management Key detected. Database operations will likely fail.");
} else {
  console.log("Supabase Client: Initialized with project key.");
}
