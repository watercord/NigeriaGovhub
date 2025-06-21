
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Bike, Medal } from "lucide-react";
import Image from "next/image";

export default function SportsPage() {
  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 flex items-center justify-center">
          <Award className="h-10 w-10 mr-3" /> Sports in Nigeria
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Celebrating Nigeria's passion for sports, athletic achievements, and development programs.
        </p>
      </section>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">A Nation of Sporting Excellence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/90">
          <Image 
            src="https://placehold.co/800x400.png" 
            alt="Nigerian athletes celebrating" 
            width={800} 
            height={400} 
            className="w-full rounded-lg mb-6 shadow-md object-cover"
            data-ai-hint="athletes victory"
          />
          <p>
            Sports play a significant role in Nigerian culture, fostering unity, pride, and healthy lifestyles. From grassroots participation to international competitions, Nigeria has a rich history of sporting achievements.
          </p>
          <p>
            This section provides information on:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>National Sports Federations and Associations.</li>
            <li>Major sporting events and competitions in Nigeria.</li>
            <li>Profiles of Nigerian athletes and their achievements.</li>
            <li>Government initiatives for sports development and youth engagement.</li>
            <li>Updates on national teams in various sports (e.g., football, basketball, athletics).</li>
          </ul>
          <p>
            Join us in celebrating Nigerian sports and supporting our athletes.
          </p>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><Bike className="mr-2 h-5 w-5"/> National Sports Festival</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Learn about Nigeria's foremost multi-sport event. (Placeholder)</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><Medal className="mr-2 h-5 w-5"/> Olympic Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Highlighting Nigeria's participation and successes at the Olympic Games. (Placeholder)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
