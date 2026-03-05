import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "../../components/LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/ternium/dashboard");
  }

  return <LoginForm />;
}
