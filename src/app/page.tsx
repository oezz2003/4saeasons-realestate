import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Award, Building2, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { AnimatedStats } from "@/components/animated-stats";
import { LocationsMap } from "@/components/locations-map";
import { GridMotion } from "@/components/grid-motion";
import { CompoundCard } from "@/components/compound-card";
import { fetchCompounds, extractImageUrlAsync, safeString, fetchDevelopers } from "@/lib/api";
import { WordPressCompound, WordPressDeveloper } from "@/lib/types";

const heroItems = [
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=600&h=400&fit=crop',
  <div key='hero-1' className="p-4 text-center">Modern Villas</div>,
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&h=400&fit=crop',
  <div key='hero-2' className="p-4 text-center">Luxury Penthouses</div>,
  'https://images.unsplash.com/photo-1560518883-ce09059ee41f?q=80&w=600&h=400&fit=crop',
  <div key='hero-3' className="p-4 text-center">Family Homes</div>,
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600&h=400&fit=crop',
  <div key='hero-4' className="p-4 text-center">Coastal Properties</div>,
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=600&h=400&fit=crop',
  <div key='hero-5' className="p-4 text-center">Oceanfront Views</div>,
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1448630360428-65456885c650?q=80&w=600&h=400&fit=crop',
  <div key='hero-6' className="p-4 text-center">City Apartments</div>,
  'https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=600&h=400&fit=crop',
  <div key='hero-7' className="p-4 text-center">Your Dream Home Awaits</div>,
  'https://images.unsplash.com/photo-1628744448845-934414849a62?q=80&w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=600&h=400&fit=crop',
  <div key='hero-8' className="p-4 text-center">Find Your Space</div>,
  'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1605276374104-5de67d609240?q=80&w=600&h=400&fit=crop',
  <div key='hero-9' className="p-4 text-center">Invest in a Lifestyle</div>,
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600&h=400&fit=crop',
  <div key='hero-10' className="p-4 text-center">Modern Designs</div>,
  'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=600&h=400&fit=crop',
  <div key='hero-11' className="p-4 text-center">Premium Locations</div>,
  'https://images.unsplash.com/photo-1576941089067-2de3c901e126?q=80&w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600585152225-3579fe9d090b?q=80&w=600&h=400&fit=crop',
  <div key='hero-12' className="p-4 text-center">Exclusive Compounds</div>,
];


export default async function Home() {

  const partnersData = await fetchDevelopers();
  const partners = await Promise.all(
    partnersData.slice(0, 6).map(async (p: WordPressDeveloper) => {
        return {
          name: safeString(p.title),
          logo: await extractImageUrlAsync(p.acf.logo, 'thumbnail', '/placeholder-logo.svg'),
          hint: 'company logo'
        };
      })
  );

  const newLaunchesData = await fetchCompounds({ per_page: 3 });
  const newLaunches = await Promise.all(
    newLaunchesData.map(async (c: WordPressCompound) => {
        return {
          id: c.id,
          slug: c.slug,
          name: safeString(c.title),
          image: await extractImageUrlAsync(c.acf.banner_image, 'medium'),
          imageHint: 'compound property',
          developer: c.developerName || 'N/A',
          location: c.locationName || 'N/A',
        };
      })
  );

  return (
    // The negative margin-top pulls the hero section up to sit behind the transparent sticky header.
    // Header height: h-16 (64px) + py-2 (16px) = 80px
    <div className="flex flex-col -mt-[80px]">
      <section className="relative h-screen w-full">
        <GridMotion items={heroItems} />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white bg-black/50 pointer-events-none">
          <div className="overflow-hidden py-1">
            <h1 className="text-4xl md:text-6xl font-bold font-headline animate-title-reveal">
              Find Your Home for Every Season
            </h1>
          </div>
          <div className="overflow-hidden py-1">
            <p className="text-lg md:text-xl max-w-2xl mt-4 animate-title-reveal" style={{ animationDelay: '0.1s' }}>
              Discover premier properties tailored to your lifestyle.
            </p>
          </div>
          <div className="mt-8 animate-fade-in-up pointer-events-auto" style={{ animationDelay: '0.2s' }}>
            <Link href="/search">
              <Button size="lg">Start Your Search</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="overflow-hidden py-1">
              <h2 className="text-3xl font-bold font-headline animate-title-reveal">Our Esteemed Partners</h2>
            </div>
            <div className="overflow-hidden py-1">
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto animate-title-reveal" style={{ animationDelay: '0.1s' }}>
                We collaborate with the leading names in real estate to bring you the most exclusive and prestigious properties in Egypt.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-12 items-center justify-items-center">
            {partners.map((partner, index) => (
              <div key={partner.name} className="animate-fade-in" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  data-ai-hint={partner.hint}
                  width={150}
                  height={80}
                  className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300 ease-in-out"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <AnimatedStats />

      <section className="py-12 md:py-20 bg-primary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="overflow-hidden py-1">
              <h2 className="text-3xl font-bold font-headline animate-title-reveal">Latest Launches</h2>
            </div>
            <div className="overflow-hidden py-1">
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto animate-title-reveal" style={{ animationDelay: '0.1s' }}>
                Be the first to explore the newest and most exciting projects on the market.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newLaunches.map((compound, index) => (
               <div key={compound.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CompoundCard 
                  id={compound.id.toString()}
                  slug={compound.slug}
                  name={compound.name}
                  image={compound.image}
                  imageHint={compound.imageHint}
                  developer={compound.developer}
                  location={compound.location}
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
             <Link href="/new-launches" passHref>
                <Button size="lg" variant="outline">
                    View All New Launches
                </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="overflow-hidden py-1">
            <h2 className="text-3xl font-bold mb-10 font-headline animate-title-reveal">Why Choose 4 Seasons?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <Card className="text-center p-6 border-2 border-transparent hover:border-primary hover:shadow-lg transition-all h-full">
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Award className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">Expert Agents</h3>
                  <p className="text-muted-foreground">Our team of experienced agents is dedicated to finding you the perfect property.</p>
                </CardContent>
              </Card>
            </div>
             <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Card className="text-center p-6 border-2 border-transparent hover:border-primary hover:shadow-lg transition-all h-full">
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Building2 className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">Vast Portfolio</h3>
                  <p className="text-muted-foreground">We offer a wide range of properties, from luxury villas to modern apartments.</p>
                </CardContent>
              </Card>
            </div>
             <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Card className="text-center p-6 border-2 border-transparent hover:border-primary hover:shadow-lg transition-all h-full">
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">Trusted by Many</h3>
                  <p className="text-muted-foreground">Join thousands of satisfied clients who found their dream homes with us.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <LocationsMap />

      <section className="py-12 md:py-20 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="overflow-hidden py-1">
            <h2 className="text-3xl font-bold mb-10 font-headline animate-title-reveal">What Our Clients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <Card className="text-left">
                <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                    <Avatar>
                        <AvatarImage src="https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=100&h=100&fit=crop" data-ai-hint="happy person" />
                        <AvatarFallback>AS</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                        <p className="font-bold">Ahmed Saleh</p>
                        <div className="flex text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        </div>
                    </div>
                    </div>
                    <p className="text-muted-foreground italic">"The team at 4 Seasons was incredibly professional and helpful. They made the process of buying my new apartment seamless and stress-free. Highly recommended!"</p>
                </CardContent>
                </Card>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Card className="text-left">
                <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                    <Avatar>
                        <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&h=100&fit=crop" data-ai-hint="professional woman" />
                        <AvatarFallback>FM</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                        <p className="font-bold">Fatima Mostafa</p>
                        <div className="flex text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        </div>
                    </div>
                    </div>
                    <p className="text-muted-foreground italic">"I sold my property through them and got a fantastic price. Their market knowledge is top-notch, and they handled everything from A to Z. Thank you!"</p>
                </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
            <div className="overflow-hidden py-1">
              <h2 className="text-3xl font-bold mb-4 font-headline animate-title-reveal">Ready to Find Your Home?</h2>
            </div>
             <div className="overflow-hidden py-1">
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-title-reveal" style={{ animationDelay: '0.1s' }}>Let's get started. Browse our listings or get in touch with an agent today.</p>
            </div>
            <Link href="/search" passHref>
                <Button size="lg">
                    Search Properties
                </Button>
            </Link>
        </div>
      </section>
    </div>
  );
}
