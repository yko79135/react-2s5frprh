import { createClient } from '@supabase/supabase-js';

// Public, RLS-guarded project keys — safe to ship in the client bundle.
// The planner_state table only allows public select/update (see supabase
// migration create_class_prep_planner_state), no insert/delete, and holds
// nothing more sensitive than a class-prep checklist.
const SUPABASE_URL = 'https://nbwltocexvufetywrecx.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5id2x0b2NleHZ1ZmV0eXdyZWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDQyNTQsImV4cCI6MjA5ODEyMDI1NH0.ul9KzZ0shuvKP0Cg4P4D6ZWBU7EFMkN6OHs9B3mpey0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const PLANNER_STATE_TABLE = 'class_prep_planner_state';
export const PLANNER_STATE_ROW_ID = 'default';
