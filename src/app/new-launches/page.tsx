import { CompoundCard } from "@/components/compound-card";
import { fetchCompounds, extractImageUrlAsync, safeString } from "@/lib/api";
import { WordPressCompound } from "@/lib/types";

export default async function NewLaunchesPage() {
  // Fetch the latest compounds, assuming the API returns them in chronological order
  const compoundsData = await fetchCompounds({ per_page: 12 });

  const newLaunches = await Promise.all(
    compoundsData.map(async (c: WordPressCompound) => {
        return {
          id: c.id,
          slug: c.slug,
          name: safeString(c.title.rendered),
          image: await extractImageUrlAsync(c.acf.banner_image, 'medium'),
          imageHint: 'compound property',
          developer: c.developerName || 'N/A',
          location: c.locationName || 'N/A',
        };
      })
  );

  return (
    <div className="container mx-auto py-12 px-4 md:py-20">
      <div className="text-center mb-12">
        <div className="overflow-hidden py-1">
          <h1 className="text-4xl font-bold font-headline animate-title-reveal">New Launches</h1>
        </div>
        <div className="overflow-hidden py-1">
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto animate-title-reveal" style={{ animationDelay: '0.1s' }}>
            Discover the latest and most promising real estate projects. Be the first to invest in the future of luxury living.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {newLaunches.map((compound, index) => (
          <div key={compound.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
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
    </div>
  );
}
