import { getServerSession } from "next-auth";
import { fetchAllFeedbackWithProjectTitlesAction } from "@/lib/actions";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { FeedbackTable } from "@/components/admin/feedback-table";

export default async function ManageFeedbackPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/login?redirect=/dashboard/admin/manage-feedback`);
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard/user");
  }

  const feedback = await fetchAllFeedbackWithProjectTitlesAction();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center">
              <MessageSquare className="mr-2 h-6 w-6" />
              Manage User Feedback
            </CardTitle>
            <CardDescription>
              Review and moderate user feedback from all projects.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <FeedbackTable feedback={feedback} />
    </div>
  );
}
