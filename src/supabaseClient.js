import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xnkssvmbpkwysjqgqapl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhua3Nzdm1icGt3eXNqcWdxYXBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTczOTIsImV4cCI6MjA2NTM3MzM5Mn0.eajIh5frsubDFSSt99KpjovEjKGblZmldgaeKfZBoEU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
