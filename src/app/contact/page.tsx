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
import { Mail, MapPin, Phone } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(data);
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We will get back to you shortly.",
    });
    reset();
  };

  return (
    <div className="space-y-12 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4">Contact Us</h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          We&apos;d love to hear from you. Whether you have a question, feedback, or a suggestion, please reach out.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Send us a Message</CardTitle>
            <CardDescription>Fill out the form below and we&apos;ll respond as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register("name")} className="mt-1" />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register("email")} className="mt-1" />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" {...register("subject")} className="mt-1" />
                {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>}
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={5} {...register("message")} className="mt-1" />
                {errors.message && <p className="text-sm text-destructive mt-1">{errors.message.message}</p>}
              </div>
              <Button type="submit" className="w-full button-hover" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold">Address</h3>
                  <p className="text-sm text-foreground/80">Federal Ministry of Information & National Orientation, Radio House, Federal Secretariat Complex, Phase II, Abuja, FCT, Nigeria.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <a href="mailto:info@nigeriagovhub.gov.ng" className="text-sm text-primary hover:underline">info@nigeriagovhub.gov.ng</a>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-sm text-foreground/80">+234 (0)9 XXX XXXXX (Placeholder)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Operating Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80">Monday - Friday: 9:00 AM - 5:00 PM (WAT)</p>
              <p className="text-sm text-foreground/80">Closed on weekends and public holidays.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
