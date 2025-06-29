
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, BookOpen, Award } from "lucide-react";
import Image from "next/image";
import Culture from "@/components/common/Cul2.jpg";

export default function CulturePage() {
  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 flex items-center justify-center">
          <Palette className="h-10 w-10 mr-3" /> Culture, History & Sports
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Explore Nigeria's rich cultural heritage, fascinating history, and vibrant sporting scene.
        </p>
      </section>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Celebrating Nigeria's Diversity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/90">
          <Image
            src={Culture}
            alt="Nigerian cultural display"
            width={800}
            height={400}
            className="w-full rounded-lg mb-6 shadow-md object-cover"
            data-ai-hint="cultural dance"
          />
          <p>
            Nigeria is a country of immense cultural diversity, with over 250 ethnic groups, each with unique traditions, languages, and art forms. Our history is rich and complex, shaping the nation we are today. Sports, particularly football, are a unifying passion for Nigerians.
          </p>
          <p>
            This section provides resources on:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>National Museums and Monuments</li>
            <li>Cultural Festivals and Events</li>
            <li>Historical Landmarks and Narratives</li>
            <li>Information on Nigerian Arts, Music, and Literature</li>
            <li>Updates on National Sports Teams and Achievements</li>
            <li>Support for Creative Industries and Sporting Development</li>
          </ul>
          <p>
            Discover the stories, traditions, and achievements that define Nigeria.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><BookOpen className="mr-2 h-5 w-5"/> National Archives</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Explore historical documents and records. <a href="https://nationalarchivesofnigeria.org.ng/" className="text-lime-600 underline text-base">National Archives</a></p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><Palette className="mr-2 h-5 w-5"/> Arts Council</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Information on grants and support for artists. <a href="https://ncac.gov.ng/" className="text-lime-600 underline text-base">Arts Council</a></p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><Award className="mr-2 h-5 w-5"/> Sports Federations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Connect with various national sports bodies. Visit the <a href="https://nigeriaolympic.org/olympic-sports-federations/" className="text-lime-600 underline text-base">Nigeria Olympic Commitee</a> to see the sports Federations in Nigeria.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
