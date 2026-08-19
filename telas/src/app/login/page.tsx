import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ origem?: string }>;
}) {
  const { origem } = await searchParams;
  return <LoginForm origem={origem} />;
}
