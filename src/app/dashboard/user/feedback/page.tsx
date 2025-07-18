import { getServerSession } from "next-auth";
import { getUserFeedbackAction } from "@/lib/actions";
import MyFeedbackContent from "@/components/user/my-feedback-content"; // path to the new client component
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MyFeedbackPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const feedback = await getUserFeedbackAction();

  return <MyFeedbackContent myFeedback={feedback} />;
}
