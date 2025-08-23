

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompoundCard } from '@/components/compound-card';
import { Building, MapPin, Sun, User, Calendar, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { PropertyImageGallery } from '@/components/property-image-gallery';
import { WhatsappIcon } from '@/components/icons';
import { 
    fetchCompoundBySlug, 
    fetchCompounds,
    extractImageUrlAsync,
    safeString,
} from '@/lib/api';
import type { WordPressCompound } from '@/lib/types';


export default async function CompoundDetailsPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const compound = await fetchCompoundBySlug(params.slug);
  
    if (!compound) {
        notFound();
    }
  
    const allCompoundsData = await fetchCompounds({ per_page: 4 });

    const otherCompounds = await Promise.all(
        allCompoundsData
            .filter(c => c.id !== compound.id)
            .slice(0, 3)
            .map(async (c: WordPressCompound) => {
                const image = await extractImageUrlAsync(c._embedded?.['wp:featuredmedia']?.[0] || c.acf.banner_image, 'medium');
        
                return {
                    id: c.id,
                    slug: c.slug,
                    name: safeString(c.title.rendered),
                    image: image,
                    imageHint: 'compound property',
                    developer: c.developerName || 'N/A',
                    location: c.locationName || 'N/A',
                };
            })
    );


    return (
    <div className="animate-fade-in">
        {/* Hero Section */}
        <section className="relative h-[50vh] min-h-[300px] w-full">
            <Image
                src={compound.mainImage}
                alt={compound.name}
                data-ai-hint={compound.mainImageHint}
                fill
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white p-4">
                <div className="overflow-hidden py-1">
                    <h1 className="text-4xl md:text-6xl font-bold font-headline animate-title-reveal">{compound.name}</h1>
                </div>
                <div className="overflow-hidden py-1">
                    <p className="text-lg md:text-xl mt-2 animate-title-reveal" style={{animationDelay: '0.1s'}}>{compound.location}</p>
                </div>
            </div>
        </section>

        <div className="container mx-auto py-12 px-4 md:py-20">
            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-12 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                        <User className="w-8 h-8 text-primary" />
                        <span className="text-sm text-muted-foreground">Developer</span>
                        <p className="font-bold">{compound.developer}</p>
                    </CardContent>
                </Card>
                <Card>
                     <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                        <MapPin className="w-8 h-8 text-primary" />
                        <span className="text-sm text-muted-foreground">Location</span>
                        <p className="font-bold">{compound.location}</p>
                    </CardContent>
                </Card>
                <Card>
                     <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                        <Sun className="w-8 h-8 text-primary" />
                        <span className="text-sm text-muted-foreground">Status</span>
                        <p className="font-bold">{compound.status}</p>
                    </CardContent>
                </Card>
                 <Card>
                     <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                        <Calendar className="w-8 h-8 text-primary" />
                        <span className="text-sm text-muted-foreground">Delivery</span>
                        <p className="font-bold">{compound.delivery}</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <div className="lg:col-span-2">
                    <div className="overflow-hidden py-1">
                        <h2 className="text-3xl font-bold font-headline mb-4 animate-title-reveal">About {compound.name}</h2>
                    </div>
                    {/* Use prose to style the HTML content from WordPress */}
                    <div 
                        className="text-muted-foreground mb-8 leading-relaxed prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: compound.description }}
                    />
                    
                    {compound.gallery && compound.gallery.length > 0 && (
                      <>
                        <div className="overflow-hidden py-1">
                            <h3 className="text-2xl font-bold font-headline my-4 animate-title-reveal">Gallery</h3>
                        </div>
                        <PropertyImageGallery images={compound.gallery} imageHints={[]} title={compound.name} />
                        <Separator className="my-8" />
                      </>
                    )}

                    {compound.amenities && compound.amenities.length > 0 && (
                    <>
                        <div className="overflow-hidden py-1">
                            <h3 className="text-2xl font-bold font-headline mb-4 animate-title-reveal">Amenities</h3>
                        </div>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {compound.amenities.map(amenity => (
                                <div key={amenity} className="bg-primary/5 p-4 rounded-lg flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-primary" />
                                    <span className="font-medium">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </>
                    )}
                </div>

                {/* Right: Contact */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-28 shadow-lg">
                        <CardHeader>
                            <CardTitle>Interested in {compound.name}?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Contact us today to learn more about available units and payment plans.
                            </p>
                             <a href={`https://wa.me/201015670391, I'm interested in ${compound.name}`} target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white">
                                  <WhatsappIcon className="mr-2 h-5 w-5"/> Inquire via WhatsApp
                                </Button>
                              </a>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator className="my-12 md:my-20" />

            {otherCompounds.length > 0 && (
            <section className="animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                 <div className="overflow-hidden py-1 text-center">
                    <h2 className="text-3xl font-bold text-center mb-10 font-headline animate-title-reveal">Other Compounds to Explore</h2>
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {otherCompounds
                        .map((c) => (
                           <CompoundCard
                            key={c.id}
                            id={c.id.toString()}
                            slug={c.slug}
                            name={c.name}
                            image={c.image}
                            imageHint={c.imageHint}
                            developer={c.developer}
                            location={c.location}
                           />
                    ))}
                </div>
            </section>
            )}
        </div>
    </div>
  );
}
