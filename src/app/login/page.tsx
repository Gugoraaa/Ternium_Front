import { redirect } from "next/navigation";
import { getDefaultPathForRole } from "@/lib/permissions";
import { getAuthorizedServerUser } from "@/lib/server-auth";
import LoginForm from "../../components/LoginForm";

export default async function LoginPage() {
  const authorizedUser = await getAuthorizedServerUser();

  if (authorizedUser) {
    redirect(getDefaultPathForRole(authorizedUser.roleName));
  }

  return <LoginForm />;
}
