import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { CompoundCard } from '@/components/compound-card';
import {
  fetchDeveloperBySlug,
  fetchCompoundsByDeveloper,
  extractImageUrlAsync,
  cleanHtmlContent,
  safeString
} from '@/lib/api';
import type { WordPressCompound } from '@/lib/types';

export default async function DeveloperDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Fetch developer data
  const developerData = await fetchDeveloperBySlug(slug);
  if (!developerData) notFound();

  // Fetch only compounds related to this developer
  const compoundsData = await fetchCompoundsByDeveloper(slug);

  // Prepare developer info
  const developer = {
    name: safeString(developerData.title, 'Developer'),
    description: cleanHtmlContent(safeString(developerData.content)),
    logo: await extractImageUrlAsync(developerData.acf.logo, 'medium', '/placeholder-logo.svg'),
  };

  // Prepare compounds data with images
  const compounds = await Promise.all(
    compoundsData.map(async (compound: WordPressCompound) => ({
      id: compound.id,
      slug: compound.slug,
      name: safeString(compound.title),
      location: compound.locationName || 'N/A',
      mainImage: await extractImageUrlAsync(compound.acf.banner_image, 'large'),
      mainImageHint: 'compound image',
      developerName: compound.developerName || 'N/A'
    }))
  );

  return (
    <div className="container mx-auto py-12 px-4 md:py-20">
      {/* Developer Header */}
      <section className="flex flex-col md:flex-row items-center gap-8 mb-12 p-8 bg-primary/5 rounded-lg">
        <Image
          src={developer.logo}
          alt={`${developer.name} Logo`}
          width={150}
          height={150}
          className="rounded-xl object-cover border bg-background p-2 shadow-md"
        />
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">{developer.name}</h1>
          <div className="mt-4 text-muted-foreground max-w-3xl leading-relaxed">
            {developer.description}
          </div>
        </div>
      </section>

      <Separator className="my-12" />

      {/* Compounds Section */}
      <section>
        <h2 className="text-3xl font-bold mb-10 font-headline text-center">
          {compounds.length > 0 ? 'Related Compounds' : 'No Compounds Found'}
        </h2>
        
        {compounds.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {compounds.map((compound) => (
              <CompoundCard 
                key={compound.id}
                id={compound.id}
                slug={compound.slug}
                name={compound.name}
                image={compound.mainImage}
                imageHint={compound.mainImageHint}
                location={compound.location}
                developer={compound.developerName || developer.name}
              />
            ))}
          </div>
        )}
      </section>
    </div>

  );
}
