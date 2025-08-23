import { Suspense } from 'react';
import { CompoundCard } from "@/components/compound-card";
import { SearchFilters } from "@/components/search-filters";
import { Skeleton } from '@/components/ui/skeleton';
import { fetchCompounds, fetchDevelopers, fetchLocations, extractImageUrlAsync, safeString } from '@/lib/api';
import { WordPressCompound } from '@/lib/types';


async function getFilteredCompounds(searchParams: { [key: string]: string | string[] | undefined }, currentPage: number, compoundsPerPage: number, locationMap?: Map<string, number>) {
  try {
    // Fetch ALL compounds first (not just per page)
    const allCompounds = await fetchCompounds({ per_page: 150 }); // This will trigger pagination internally

    let filteredCompounds = allCompounds;

  const q = searchParams.q;
  const location = searchParams.location;
  const developer = searchParams.developer;

  // Apply search query filter
  if (q) {
    const searchTerm = String(q).toLowerCase().trim();
    if (searchTerm) {
      filteredCompounds = filteredCompounds.filter(c => {
        const title = safeString(c.title).toLowerCase();
        const location = c.locationName ? c.locationName.toLowerCase() : '';
        const developer = c.developerName ? c.developerName.toLowerCase() : '';
        const description = c.content?.rendered ? safeString(c.content.rendered).toLowerCase() : '';
        
        return title.includes(searchTerm) ||
               location.includes(searchTerm) ||
               developer.includes(searchTerm) ||
               description.includes(searchTerm);
      });
    }
  }
  
  // Apply location filter
  if (location && location !== 'all-locations') {
    const locationStr = Array.isArray(location) ? location[0] : location;
    const selectedLocationId = locationMap?.get(locationStr);
    
    filteredCompounds = filteredCompounds.filter(c => {
      // Check resolved location name first (most reliable)
      if (c.locationName) {
        return c.locationName.toLowerCase().includes(locationStr.toLowerCase());
      }
      
      // Check ACF location field by slug
      if (c.acf?.location && typeof c.acf.location === 'object') {
        return c.acf.location.slug === locationStr || 
               (c.acf.location.name && c.acf.location.name.toLowerCase().includes(locationStr.toLowerCase()));
      }
      
      // Check if location field is a string (slug)
      if (typeof c.acf?.location === 'string') {
        return c.acf.location === locationStr;
      }
      
      // Check location_to_location field (array of location IDs)
      if (Array.isArray(c.acf?.location_to_location) && selectedLocationId) {
        return c.acf.location_to_location.includes(selectedLocationId);
      }
      
      return false;
    });
  }
  
  // Apply developer filter
  if (developer && developer !== 'all-developers') {
    const developerStr = Array.isArray(developer) ? developer[0] : developer;
    filteredCompounds = filteredCompounds.filter(c => {
      // Check resolved developer name first (most reliable)
      if (c.developerName) {
        return c.developerName.toLowerCase().includes(developerStr.toLowerCase());
      }
      
      // Fallback to ACF developer field
      if (c.acf?.developer && typeof c.acf.developer === 'object') {
        return c.acf.developer.post_name === developerStr ||
               (c.acf.developer.post_title && c.acf.developer.post_title.toLowerCase().includes(developerStr.toLowerCase()));
      }
      
      return false;
    });
  }

  // Calculate pagination
  const totalCompounds = filteredCompounds.length;
  const totalPages = Math.ceil(totalCompounds / compoundsPerPage);
  const startIndex = (currentPage - 1) * compoundsPerPage;
  const endIndex = startIndex + compoundsPerPage;
  const paginatedCompounds = filteredCompounds.slice(startIndex, endIndex);

    return { 
      compounds: paginatedCompounds, 
      totalCompounds, 
      totalPages,
      totalFilteredCompounds: filteredCompounds.length 
    };
  } catch (error) {
    console.error('Error in getFilteredCompounds:', error);
    return { 
      compounds: [], 
      totalCompounds: 0, 
      totalPages: 0,
      totalFilteredCompounds: 0 
    };
  }
}

function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <div className="flex justify-between">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-8 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

async function SearchResults({ searchParams, locationMap }: { searchParams: { [key: string]: string | string[] | undefined }, locationMap?: Map<string, number> }) {
  const currentSearchParams = searchParams;
  const compoundsPerPage = 12; // Number of compounds to display per page
  const currentPage = Number(searchParams.page) || 1;
  
  try {
    const { compounds: filteredCompounds, totalPages, totalFilteredCompounds } = await getFilteredCompounds(searchParams, currentPage, compoundsPerPage, locationMap);

  const compoundsForCards = await Promise.all(
    filteredCompounds.map(async (c: WordPressCompound) => {
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
    <>
      <p className="text-muted-foreground mb-8">
        Showing {filteredCompounds.length} of {totalFilteredCompounds} result(s).
      </p>
      {compoundsForCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up mb-8">
          {compoundsForCards.map((compound) => (
            <CompoundCard 
              key={compound.id}
              id={compound.id.toString()}
              slug={compound.slug}
              name={compound.name}
              image={compound.image}
              imageHint={compound.imageHint}
              developer={compound.developer}
              location={compound.location}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 animate-fade-in mb-8">
          <h2 className="text-2xl font-bold font-headline">No Compounds Found</h2>
          <p className="text-muted-foreground mt-2">Try adjusting your search filters.</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href={`/search?${new URLSearchParams({ 
                ...Object.fromEntries(Object.entries(currentSearchParams).map(([k, v]) => [k, String(v)])), 
                page: (currentPage > 1 ? currentPage - 1 : 1).toString() 
              }).toString()}`} />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href={`/search?${new URLSearchParams({ 
                  ...Object.fromEntries(Object.entries(currentSearchParams).map(([k, v]) => [k, String(v)])), 
                  page: (i + 1).toString() 
                }).toString()}`} isActive={currentPage === i + 1}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href={`/search?${new URLSearchParams({ 
                ...Object.fromEntries(Object.entries(currentSearchParams).map(([k, v]) => [k, String(v)])), 
                page: (currentPage < totalPages ? currentPage + 1 : totalPages).toString() 
              }).toString()}`} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
  } catch (error) {
    console.error('Error in SearchResults:', error);
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Results</h3>
        <p className="text-muted-foreground">
          We're having trouble loading the search results. Please try again later.
        </p>
      </div>
    );
  }
}


export default async function SearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const currentSearchParams = await searchParams;
  const locationsData = await fetchLocations();
  const developersData = await fetchDevelopers();
  
  // Create a map of location slug to ID for filtering
  const locationMap = new Map();
  locationsData.forEach(l => {
    locationMap.set(l.slug, l.id);
  });
  
  const locations = locationsData.map(l => ({ 
    name: l.acf?.name || l.title?.rendered || l.name || 'Unnamed Location', 
    slug: l.slug,
    id: l.id
  }));
  const developers = developersData.map(d => ({ name: d.title.rendered, slug: d.slug }));
  
  // TODO: Get these from API/taxonomy
  const propertyTypes = ['Apartment', 'Villa', 'Townhouse', 'Chalet'];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="sticky top-28">
            <SearchFilters locations={locations} developers={developers} propertyTypes={propertyTypes} searchParams={currentSearchParams} />
          </div>
        </aside>
        <main className="lg:col-span-3">
          <Suspense fallback={<SearchResultsSkeleton />}>
             <SearchResults searchParams={currentSearchParams} locationMap={locationMap} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
