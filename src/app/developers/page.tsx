import { DeveloperCard } from "@/components/developer-card";
import { fetchDevelopers, extractImageUrlAsync, cleanHtmlContent, safeString } from "@/lib/api";
import type { Developer } from "@/lib/types";

export default async function DevelopersPage() {
  const allDevelopersData = await fetchDevelopers();

  const developers: Developer[] = await Promise.all(
      allDevelopersData.map(async (dev) => {
          const logoUrl = await extractImageUrlAsync(dev.acf.logo, 'thumbnail', '/placeholder-logo.svg');
          
          return {
              id: dev.id,
              slug: dev.slug,
              name: safeString(dev.title, 'Unnamed Developer'),
              description: cleanHtmlContent(safeString(dev.content)),
              logoUrl: logoUrl,
              projectsCount: 0, // This would require another query or be added to the developer endpoint
          };
      })
  );


  return (
    <div className="container mx-auto py-12 px-4 md:py-20">
      <div className="text-center mb-12">
        <div className="overflow-hidden py-1">
          <h1 className="text-4xl md:text-5xl font-bold font-headline animate-title-reveal">Our Development Partners</h1>
        </div>
        <div className="overflow-hidden py-1">
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto animate-title-reveal" style={{'animationDelay': '0.1s'}}>
            We collaborate with the best in the industry to bring you unparalleled quality and visionary projects.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {developers.map((dev, index) => (
          <div key={dev.id} className="animate-fade-in-up" style={{'animationDelay': `${index * 0.1 + 0.2}s`}}>
            <DeveloperCard 
              id={dev.id}
              slug={dev.slug}
              name={dev.name}
              logo={dev.logoUrl}
              description={dev.description}
              projectsCount={dev.projectsCount || 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
