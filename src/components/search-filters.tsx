"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X, Search, Loader2 } from 'lucide-react';

type SearchFiltersProps = {
  locations: { name: string, slug: string }[];
  developers: { name: string, slug: string }[];
  propertyTypes: string[];
  searchParams: { [key: string]: string | string[] | undefined };
}

const MAX_PRICE = 10000000;

export function SearchFilters({ locations, developers, propertyTypes, searchParams }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUrlSearchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.q?.toString() || '');
  const [location, setLocation] = useState(searchParams.location?.toString() || '');
  const [developer, setDeveloper] = useState(searchParams.developer?.toString() || '');
  const [type, setType] = useState(searchParams.type?.toString() || '');
  const [beds, setBeds] = useState(searchParams.beds?.toString() || '');
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.minPrice) || 0,
    Number(searchParams.maxPrice) || MAX_PRICE
  ]);
  const [isSearching, setIsSearching] = useState(false);

  const createQueryString = () => {
    const params = new URLSearchParams(currentUrlSearchParams.toString());
    if (query) params.set('q', query); else params.delete('q');
    if (location) params.set('location', location); else params.delete('location');
    if (developer) params.set('developer', developer); else params.delete('developer');
    if (type) params.set('type', type); else params.delete('type');
    if (beds) params.set('beds', beds); else params.delete('beds');
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0])); else params.delete('minPrice');
    if (priceRange[1] < MAX_PRICE) params.set('maxPrice', String(priceRange[1])); else params.delete('maxPrice');
    params.set('page', '1'); // Reset page to 1 when filters change
    return params.toString();
  };

  const handleSearch = useCallback(() => {
    setIsSearching(true);
    router.push(`${pathname}?${createQueryString()}`);
    // Reset loading state after navigation
    setTimeout(() => setIsSearching(false), 1000);
  }, [router, pathname, createQueryString]);

  // Debounced search for better performance
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleSearch();
      }, 500); // 500ms delay
    };
  }, [handleSearch]);
  
  const handleReset = () => {
    setQuery('');
    setLocation('');
    setDeveloper('');
    setType('');
    setBeds('');
    setPriceRange([0, MAX_PRICE]);
    router.push(pathname);
  };
  
  // Sync state with URL params on navigation
  useEffect(() => {
    setQuery(searchParams.q?.toString() || '');
    setLocation(searchParams.location?.toString() || 'all-locations');
    setDeveloper(searchParams.developer?.toString() || 'all-developers');
    setType(searchParams.type?.toString() || 'all-types');
    setBeds(searchParams.beds?.toString() || 'all-beds');
    setPriceRange([
      Number(searchParams.minPrice) || 0,
      Number(searchParams.maxPrice) || MAX_PRICE
    ]);
  }, [searchParams]);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Filter Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search-query">Search by Name</Label>
          <Input 
            id="search-query" 
            placeholder="e.g., Skyline, Sodic"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              debouncedSearch(); // Auto-search with debounce
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">
            Location
            {location && location !== 'all-locations' && (
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Filter Active
              </span>
            )}
          </Label>
          <Select value={location} onValueChange={(value) => {
            setLocation(value);
            // Automatically trigger search when location changes
            setIsSearching(true);
            setTimeout(() => handleSearch(), 100);
          }}>
            <SelectTrigger id="location"><SelectValue placeholder="All Locations" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all-locations">All Locations</SelectItem>
              {locations.map(loc => <SelectItem key={loc.slug} value={loc.slug}>{loc.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="developer">
            Developer
            {developer && developer !== 'all-developers' && (
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Filter Active
              </span>
            )}
          </Label>
          <Select value={developer} onValueChange={(value) => {
            setDeveloper(value);
            // Automatically trigger search when developer changes
            setIsSearching(true);
            setTimeout(() => handleSearch(), 100);
          }}>
            <SelectTrigger id="developer"><SelectValue placeholder="All Developers" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all-developers">All Developers</SelectItem>
              {developers.map(dev => <SelectItem key={dev.slug} value={dev.slug}>{dev.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Property Type</Label>
           <Select value={type} onValueChange={setType} disabled>
            <SelectTrigger id="type"><SelectValue placeholder="All Types (coming soon)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Types</SelectItem>
              {propertyTypes.map(pt => <SelectItem key={pt} value={pt}>{pt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="beds">Minimum Bedrooms</Label>
           <Select value={beds} onValueChange={setBeds} disabled>
            <SelectTrigger id="beds"><SelectValue placeholder="Any (coming soon)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all-beds">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 pt-2">
          <Label>Price Range (coming soon)</Label>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={MAX_PRICE}
            step={100000}
            className="my-4"
            disabled
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{priceRange[0].toLocaleString()} EGP</span>
            <span>{priceRange[1].toLocaleString()} EGP</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-4">
            <Button onClick={handleSearch} size="lg" disabled={isSearching}>
              {isSearching ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Filtering...</>
              ) : (
                <><Search className="mr-2 h-4 w-4"/> Apply Filters</>
              )}
            </Button>
            <Button onClick={handleReset} variant="ghost" disabled={isSearching}><X className="mr-2 h-4 w-4"/> Reset Filters</Button>
        </div>
      </CardContent>
    </Card>
  );
}
