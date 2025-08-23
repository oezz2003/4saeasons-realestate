import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MapPin, Building, BedDouble, Bath, AreaChart } from "lucide-react";
import { Badge } from "./ui/badge";

type CompoundCardProps = {
  id: string | number;
  slug: string;
  name: string;
  image: string;
  imageHint: string;
  location: string;
  developer: string;
};

export function CompoundCard({ id, slug, name, image, imageHint, location, developer }: CompoundCardProps) {
  return (
    <Link href={`/compounds/${slug}`} className="group h-full flex">
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col w-full group-hover:border-primary">
        <CardHeader className="p-0">
          <div className="relative h-56 w-full">
            <Image
              src={image}
              alt={`Image of ${name}`}
              data-ai-hint={imageHint}
              fill
              className="object-cover"
            />
             <div className="absolute top-3 left-3">
              <Badge>{location}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-xl font-bold font-headline mb-2">{name}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="w-4 h-4 text-primary" />
              <span>By {developer}</span>
          </div>
        </CardContent>
         <CardFooter className="p-4 bg-primary/5 flex justify-between text-sm text-muted-foreground mt-auto">
          <p className="font-semibold text-primary">View Project</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
