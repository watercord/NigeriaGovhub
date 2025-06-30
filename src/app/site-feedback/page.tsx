
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const siteFeedbackSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address.").optional(),
  feedbackType: z.enum(["suggestion", "compliment", "bug_report", "other"]),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

type SiteFeedbackFormData = z.infer<typeof siteFeedbackSchema>;

export default function SiteFeedbackPage() {
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting }, control } = useForm<SiteFeedbackFormData>({
    resolver: zodResolver(siteFeedbackSchema),
    defaultValues: {
      feedbackType: "suggestion",
    }
  });

  const onSubmit: SubmitHandler<SiteFeedbackFormData> = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Site Feedback Submitted:", data);
    toast({
      title: "Feedback Sent!",
      description: "Thank you for your feedback. We appreciate your input to improve NigeriaGovHub.",
    });
    reset();
  };
  

  return (
    <div className="space-y-12 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 flex items-center justify-center">
            <MessageSquare className="h-10 w-10 mr-3" /> Site Feedback
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Help us improve NigeriaGovHub. Share your suggestions, report issues, or tell us what you like.
        </p>
      </section>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Submit Your Feedback</CardTitle>
          <CardDescription>Your opinions are valuable to us.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name</Label> <span className="text-red-700">*</span>
              <Input id="name" {...register("name")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label> <span className="text-red-700">*</span>
              <Input id="email" type="email" {...register("email")} className="mt-1" />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            
            <div>
                <Label className="mb-2 block">Feedback Type</Label>
                <RadioGroup
                    defaultValue="suggestion"
                    onValueChange={(value) => {
                      setValue("feedbackType", value as SiteFeedbackFormData["feedbackType"]);
                    }}
                    className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0"
                 >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="suggestion" id="suggestion" />
                        <Label htmlFor="suggestion" className="font-normal">Suggestion</Label>
                        
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="compliment" id="compliment" />
                        <Label htmlFor="compliment" className="font-normal flex items-center"><ThumbsUp className="h-4 w-4 mr-1 text-green-500"/>Compliment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bug_report" id="bug_report" />
                        <Label htmlFor="bug_report" className="font-normal flex items-center"><ThumbsDown className="h-4 w-4 mr-1 text-red-500"/>Bug Report</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="font-normal">Other</Label>
                    </div>
                </RadioGroup>
                 {errors.feedbackType && <p className="text-sm text-destructive mt-1">{errors.feedbackType.message}</p>}
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label> <span className="text-red-700">*</span>
              <Input id="subject" {...register("subject")} className="mt-1" />
              {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>}
            </div>
            <div>
              <Label htmlFor="message">Your Feedback / Message</Label> <span className="text-red-700">*</span>
              <Textarea id="message" rows={5} {...register("message")} className="mt-1" />
              {errors.message && <p className="text-sm text-destructive mt-1">{errors.message.message}</p>}
            </div>
            <Button type="submit" className="w-full button-hover" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
