import EmailVerification from "./EmailVerification";
import { verifySession } from "@/lib/dal";

export default async function VerifyEmailPage() {
  const { email } = await verifySession();

  return <EmailVerification email={email} />;
}
