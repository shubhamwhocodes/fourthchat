import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { validateEnv, checkServices } from "@/lib/config-check";
import SetupChecklist from "@/components/setup-checklist";

export const dynamic = "force-dynamic";

export default async function Home() {
  const envCheck = validateEnv();

  let serviceStatus = null;
  if (envCheck.isValid) {
    serviceStatus = await checkServices();
  }

  if (!envCheck.isValid || (serviceStatus && (!serviceStatus.database || !serviceStatus.qdrant || !serviceStatus.schemaReady))) {
    return <SetupChecklist missingVars={envCheck.missingVars} serviceStatus={serviceStatus} />;
  }

  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  // If no active session, check if any users exist to determine initial redirect:
  // - If users exist, prompt for login.
  // - If no users exist, prompt for registration.
  const existingUsers = await db.query.users.findMany({
    limit: 1,
  });
  if (existingUsers.length > 0) {
    redirect("/login");
  } else {
    redirect("/register");
  }
}
