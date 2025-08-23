

import type { WordPressDeveloper, WordPressImage, WordPressCompound, WordPressLocation, FlatPost } from './types';

// WordPress API utilities and data fetching functions
const WP_API_BASE = 'https://4seasons-realestate.com/wp-json/wp/v2';

// Cache for resolved image URLs to avoid repeated API calls
const imageUrlCache = new Map<string, string>();

/**
 * Normalizes WordPress image URLs to handle CDN variations
 * WordPress often serves images through CDNs like i0.wp.com, i1.wp.com, etc.
 */
export function normalizeWordPressImageUrl(url: string): string {
    if (!url || typeof url !== 'string') {
        return url;
    }

    // Handle WordPress CDN URLs (i0.wp.com, i1.wp.com, etc.)
    if (url.includes('.wp.com/')) {
        // These are already CDN URLs, return as-is
        return url;
    }

    // Handle relative URLs
    if (url.startsWith('/')) {
        return `https://4seasons-realestate.com${url}`;
    }

    // Handle protocol-relative URLs
    if (url.startsWith('//')) {
        return `https:${url}`;
    }

    // Return absolute URLs as-is
    return url;
}

/**
 * Validates if an image URL is accessible and properly configured
 */
export function isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        const urlObj = new URL(url);

        // List of allowed hostnames for WordPress images
        const allowedHosts = [
            '4seasons-realestate.com',
            'i0.wp.com',
            'i1.wp.com',
            'i2.wp.com',
            'i3.wp.com',
            's0.wp.com',
            's1.wp.com',
            's2.wp.com',
            'wp.com',
            'wordpress.com',
            'placehold.co',
            'images.unsplash.com'
        ];

        return allowedHosts.some(host =>
            urlObj.hostname === host || urlObj.hostname.endsWith(`.${host}`)
        );
    } catch {
        return false;
    }
}


// Generate placeholder image URL with PNG format
export function generatePlaceholderImage(width: number, height: number, text: string): string {
    const encodedText = encodeURIComponent(text);
    return `https://placehold.co/${width}x${height}.png?text=${encodedText}`;
}

/**
 * Resolves ACF image ID to actual image URL using WordPress REST API
 * 
 * @param id - WordPress media attachment ID
 * @param size - Desired image size (thumbnail, medium, large, full)
 * @param fallbackWidth - Fallback placeholder width
 * @param fallbackHeight - Fallback placeholder height
 * @param fallbackText - Fallback placeholder text
 * @returns Promise<string> - Image URL or placeholder
 */
export async function getImageUrlById(
    id: number,
    size: 'thumbnail' | 'medium' | 'large' | 'full' = 'large',
    fallbackWidth: number = 800,
    fallbackHeight: number = 600,
    fallbackText: string = 'Image Not Found'
): Promise<string> {
    // Input validation
    if (!id || id <= 0) {
        return generatePlaceholderImage(fallbackWidth, fallbackHeight, fallbackText);
    }

    // Check cache first
    const cacheKey = `${id}-${size}`;
    if (imageUrlCache.has(cacheKey)) {
        return imageUrlCache.get(cacheKey)!;
    }

    try {
        const response = await fetch(`${WP_API_BASE}/media/${id}`, {
            next: { revalidate: 3600 }, // Cache for 1 hour
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            console.warn(`Failed to fetch media ${id}: ${response.status}`);
            const fallback = generatePlaceholderImage(fallbackWidth, fallbackHeight, `Media ${id} Not Found`);
            imageUrlCache.set(cacheKey, fallback);
            return fallback;
        }

        const mediaData = await response.json();

        // Try to get the specific size first
        let imageUrl: string | null = null;

        if (mediaData.media_details?.sizes?.[size]?.source_url) {
            imageUrl = mediaData.media_details.sizes[size].source_url;
        } else if (mediaData.source_url) {
            // Fallback to full-size image
            imageUrl = mediaData.source_url;
        }

        if (imageUrl) {
            // Normalize and validate the URL
            imageUrl = normalizeWordPressImageUrl(imageUrl);

            if (isValidImageUrl(imageUrl)) {
                imageUrlCache.set(cacheKey, imageUrl);
                return imageUrl;
            } else {
                console.warn(`Invalid or unconfigured image URL: ${imageUrl}`);
                // Fall through to generate placeholder
            }
        }

        // No valid URL found
        const fallback = generatePlaceholderImage(fallbackWidth, fallbackHeight, fallbackText);
        imageUrlCache.set(cacheKey, fallback);
        return fallback;

    } catch (error) {
        console.error(`Error fetching media ${id}:`, error);
        const fallback = generatePlaceholderImage(fallbackWidth, fallbackHeight, `Error Loading Image ${id}`);
        imageUrlCache.set(cacheKey, fallback);
        return fallback;
    }
}

/**
 * Resolves multiple ACF image IDs to URLs in parallel
 * 
 * @param ids - Array of WordPress media attachment IDs
 * @param size - Desired image size
 * @param fallbackWidth - Fallback placeholder width
 * @param fallbackHeight - Fallback placeholder height
 * @returns Promise<string[]> - Array of image URLs
 */
export async function getImageUrlsByIds(
    ids: (number | null | undefined)[],
    size: 'thumbnail' | 'medium' | 'large' | 'full' = 'large',
    fallbackWidth: number = 800,
    fallbackHeight: number = 600
): Promise<string[]> {
    if (!Array.isArray(ids) || ids.length === 0) {
        return [];
    }

    // Filter out invalid IDs (null, undefined, non-positive numbers)
    const validIds = ids.filter(id => typeof id === 'number' && id > 0) as number[];

    if (validIds.length === 0) {
        return [];
    }

    // Resolve all IDs in parallel
    const promises = validIds.map((id, index) =>
        getImageUrlById(id, size, fallbackWidth, fallbackHeight, `Gallery Image ${index + 1}`)
    );

    try {
        return await Promise.all(promises);
    } catch (error) {
        console.error('Error resolving multiple image IDs:', error);
        // Return placeholders for all IDs if batch fails
        return validIds.map((_, index) =>
            generatePlaceholderImage(fallbackWidth, fallbackHeight, `Gallery Image ${index + 1}`)
        );
    }
}

/**
 * Enhanced image URL extraction that handles both objects and IDs
 * 
 * @param image - WordPress image object or ID
 * @param size - Desired image size
 * @param fallback - Custom fallback URL
 * @returns Promise<string> - Image URL or fallback
 */
export async function extractImageUrlAsync(
    image: WordPressImage | number | undefined,
    size: 'thumbnail' | 'medium' | 'large' | 'full' = 'medium',
    fallback?: string
): Promise<string> {
    if (!image) {
        return fallback || generatePlaceholderImage(400, 300, 'No Image');
    }

    // If it's already an object with URL, normalize and return
    if (typeof image === 'object' && image.url) {
        const imageUrl = image.sizes?.[size] || image.url;
        return normalizeWordPressImageUrl(imageUrl);
    }

    // If it's an ID, resolve it via API
    if (typeof image === 'number') {
        const sizeMap = {
            thumbnail: { width: 150, height: 150 },
            medium: { width: 300, height: 300 },
            large: { width: 800, height: 600 },
            full: { width: 1200, height: 800 }
        };

        const dimensions = sizeMap[size] || sizeMap.medium;
        return await getImageUrlById(image, size, dimensions.width, dimensions.height, 'Loading Image');
    }

    return fallback || generatePlaceholderImage(400, 300, 'Invalid Image');
}

// Utility function to clean HTML content
export function cleanHtmlContent(content: string): string {
    if (!content) return '';

    return content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
        .replace(/&amp;/g, '&') // Replace &amp; with &
        .replace(/&lt;/g, '<') // Replace &lt; with <
        .replace(/&gt;/g, '>') // Replace &gt; with >
        .replace(/&quot;/g, '"') // Replace &quot; with "
        .trim();
}

// Utility function to safely get numeric value
export function safeNumber(value: any, fallback: number = 0): number {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
}

// Utility function to safely get string value
export function safeString(value: any, fallback: string = ''): string {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && value.rendered) return value.rendered;
    if (value && typeof value === 'object' && value.name) return value.name;
    return fallback;
}

// Fetch developers from WordPress API
export async function fetchDevelopers(): Promise<WordPressDeveloper[]> {
    try {
        const response = await fetch(`${WP_API_BASE}/developer?_embed&per_page=100`, {
            next: { revalidate: 3600 }, // Revalidate every 1 hour
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch developers: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching developers:', error);
        return [];
    }
}

// Fetch single developer by slug
export async function fetchDeveloperBySlug(slug: string): Promise<WordPressDeveloper | null> {
    if (!slug) return null;
    try {
        const response = await fetch(`${WP_API_BASE}/developer?slug=${slug}&_embed&per_page=1`, {
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch developer: ${response.status}`);
        }

        const developers = await response.json();
        return developers[0] || null;
    } catch (error) {
        console.error(`Error fetching developer '${slug}':`, error);
        return null;
    }
}

// Fetch compounds from WordPress API with proper pagination
export async function fetchCompounds(params?: {
    location?: string;
    developer?: string;
    unit_type?: string;
    finishing_type?: string;
    status?: string;
    min_price?: number;
    max_price?: number;
    per_page?: number;
    page?: number;
}): Promise<WordPressCompound[]> {
    try {
        const requestedPerPage = params?.per_page || 100;
        const maxPerPage = 100; // WordPress API limit
        
        // If requesting more than max, we need to paginate
        if (requestedPerPage > maxPerPage) {
            return await fetchAllCompounds(params);
        }

        const searchParams = new URLSearchParams();
        searchParams.append('_embed', '');
        searchParams.append('per_page', Math.min(requestedPerPage, maxPerPage).toString());
        if (params?.page) searchParams.append('page', params.page.toString());

        // Add filtering parameters if provided
        if (params?.location) searchParams.append('location', params.location);
        if (params?.developer) searchParams.append('developer', params.developer);

        const response = await fetch(
            `${WP_API_BASE}/compound?${searchParams.toString()}`,
            {
                next: { revalidate: 3600 }, // Cache for 1 hour for smaller requests
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'NextJS-App'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch compounds: ${response.status}`);
        }

        const compounds: WordPressCompound[] = await response.json();
        
        // Resolve relationships for all compounds
        return await Promise.all(compounds.map(resolveCompoundRelationships));
    } catch (error) {
        console.error("Error fetching compounds:", error);
        return [];
    }
}

// Helper function to fetch all compounds by paginating through the API
async function fetchAllCompounds(params?: {
    location?: string;
    developer?: string;
    unit_type?: string;
    finishing_type?: string;
    status?: string;
    min_price?: number;
    max_price?: number;
}): Promise<WordPressCompound[]> {
    const allCompounds: WordPressCompound[] = [];
    let currentPage = 1;
    const perPage = 100; // Max allowed by WordPress
    const maxRetries = 3;
    
    try {
        while (true) {
            let retries = 0;
            let success = false;
            let compounds: WordPressCompound[] = [];

            // Retry logic for each page
            while (retries < maxRetries && !success) {
                try {
                    const searchParams = new URLSearchParams();
                    searchParams.append('_embed', '');
                    searchParams.append('per_page', perPage.toString());
                    searchParams.append('page', currentPage.toString());

                    // Add filtering parameters if provided
                    if (params?.location) searchParams.append('location', params.location);
                    if (params?.developer) searchParams.append('developer', params.developer);

                    const response = await fetch(
                        `${WP_API_BASE}/compound?${searchParams.toString()}`,
                        {
                            cache: 'no-store', // Disable caching to avoid 2MB limit
                            headers: {
                                'Accept': 'application/json',
                                'User-Agent': 'NextJS-App'
                            },
                            signal: AbortSignal.timeout(30000) // 30 second timeout
                        }
                    );

                    if (!response.ok) {
                        if (response.status === 400 && currentPage > 1) {
                            // No more pages available
                            return allCompounds;
                        }
                        throw new Error(`Failed to fetch compounds: ${response.status} ${response.statusText}`);
                    }

                    compounds = await response.json();
                    success = true;
                } catch (error) {
                    retries++;
                    console.error(`Error fetching compounds page ${currentPage} (attempt ${retries}/${maxRetries}):`, error);
                    
                    if (retries >= maxRetries) {
                        console.error(`Failed to fetch page ${currentPage} after ${maxRetries} attempts. Stopping pagination.`);
                        return allCompounds; // Return what we have so far
                    } else {
                        // Wait before retrying (exponential backoff)
                        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
                    }
                }
            }
            
            if (compounds.length === 0) {
                // No more compounds
                break;
            }

            // Resolve relationships for this batch
            try {
                const resolvedCompounds = await Promise.all(compounds.map(resolveCompoundRelationships));
                allCompounds.push(...resolvedCompounds);
            } catch (error) {
                console.error(`Error resolving relationships for page ${currentPage}:`, error);
                // Add compounds without resolved relationships rather than failing completely
                allCompounds.push(...compounds);
            }

            // If we got fewer compounds than requested, we've reached the end
            if (compounds.length < perPage) {
                break;
            }

            currentPage++;
            
            // Safety check to prevent infinite loops
            if (currentPage > 10) {
                console.warn('Reached maximum page limit (10) when fetching compounds');
                break;
            }
        }
    } catch (error) {
        console.error('Error in fetchAllCompounds:', error);
    }

    return allCompounds;
}

// Helper function to resolve compound relationships
async function resolveCompoundRelationships(compound: WordPressCompound): Promise<WordPressCompound> {
    const acf = compound.acf || {};
    
    // Resolve developer name
    let developerName = 'N/A';
    let developerId = null;
    
    if (Array.isArray(acf.developer_to_developer) && acf.developer_to_developer.length > 0) {
        developerId = acf.developer_to_developer[0];
    } else if (typeof acf.developer === 'number' && acf.developer > 0) {
        developerId = acf.developer;
    } else if (acf.developer && typeof acf.developer === 'object' && 'ID' in acf.developer) {
        developerId = acf.developer.ID;
        developerName = acf.developer.post_title || 'N/A';
    }
    
    if (developerId && developerName === 'N/A') {
        try {
            const developerData = await fetchDeveloperById(developerId);
            if (developerData) {
                developerName = safeString(developerData.title.rendered, 'N/A');
            }
        } catch (error) {
            console.warn(`Failed to resolve developer ${developerId}:`, error);
        }
    }
    
    // Resolve location name
    let locationName = 'N/A';
    let locationId = null;
    
    if (Array.isArray(acf.location_to_location) && acf.location_to_location.length > 0) {
        locationId = acf.location_to_location[0];
    } else if (typeof acf.location === 'number' && acf.location > 0) {
        locationId = acf.location;
    } else if (acf.location && typeof acf.location === 'object' && 'term_id' in acf.location) {
        locationId = acf.location.term_id;
        locationName = acf.location.name || 'N/A';
    }
    
    if (locationId && locationName === 'N/A') {
        try {
            const locationData = await fetchLocationById(locationId);
            if (locationData) {
                if (typeof locationData.name === 'string' && locationData.name) {
                    locationName = locationData.name;
                } else if (locationData.title && typeof locationData.title.rendered === 'string') {
                    locationName = locationData.title.rendered;
                } else if (locationData.acf && typeof locationData.acf.name === 'string') {
                    locationName = locationData.acf.name;
                }
            }
        } catch (error) {
            console.warn(`Failed to resolve location ${locationId}:`, error);
        }
    }
    
    return {
        ...compound,
        developerName,
        locationName
    };
}


async function fetchDeveloperById(id: number): Promise<WordPressDeveloper | null> {
  if (!id || typeof id !== 'number' || id <= 0) return null;
  try {
    const res = await fetch(`${WP_API_BASE}/developer/${id}?_embed`, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.warn(`Could not fetch developer with ID ${id}. Status: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error(`Error fetching developer with ID ${id}:`, error);
    return null;
  }
}

async function fetchLocationById(id: number): Promise<WordPressLocation | null> {
  if (!id || typeof id !== 'number' || id <= 0) return null;
  try {
    const res = await fetch(`${WP_API_BASE}/location/${id}?_embed`, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.warn(`Could not fetch location with ID ${id}. Status: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error(`Error fetching location with ID ${id}:`, error);
    return null;
  }
}


// Fetch single compound by slug (with related developer + location + images resolved)
export async function fetchCompoundBySlug(slug: string) {
    if (!slug) return null;

    try {
        const response = await fetch(
            `${WP_API_BASE}/compound?slug=${slug}&_embed&per_page=1`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) {
            console.error(`Failed to fetch compound by slug ${slug}:`, await response.text());
            return null;
        }

        const compoundsData: WordPressCompound[] = await response.json();
        if (!compoundsData || compoundsData.length === 0) return null;

        const compoundData = compoundsData[0];
        const acf = compoundData.acf || {};

        // ===== Resolve related developer & location in parallel (يدعم الحقول الجديدة) =====
        // developer: يدعم developer_to_developer (مصفوفة IDs) أو acf.developer (رقم أو كائن)
        let developerId = null;
        if (Array.isArray(acf.developer_to_developer) && acf.developer_to_developer.length > 0) {
            developerId = acf.developer_to_developer[0];
        } else if (typeof acf.developer === 'number' && acf.developer > 0) {
            developerId = acf.developer;
        } else if (acf.developer && typeof acf.developer === 'object' && 'ID' in acf.developer) {
            developerId = acf.developer.ID;
        }

        let locationId = null;
        if (Array.isArray(acf.location_to_location) && acf.location_to_location.length > 0) {
            locationId = acf.location_to_location[0];
        } else if (typeof acf.location === 'number' && acf.location > 0) {
            locationId = acf.location;
        } else if (acf.location && typeof acf.location === 'object' && 'term_id' in acf.location) {
            locationId = acf.location.term_id;
        }

        const [developerData, locationData] = await Promise.all([
            developerId ? fetchDeveloperById(developerId) : Promise.resolve(null),
            locationId ? fetchLocationById(locationId) : Promise.resolve(null)
        ]);

        // ===== Resolve images (يدعم gallery_images و gallery و images) =====
        let galleryIds: number[] = [];
        
        // Try different possible gallery field names
        if (Array.isArray(acf.gallery_images) && acf.gallery_images.length > 0) {
            galleryIds = acf.gallery_images.filter((id): id is number => typeof id === 'number' && id > 0);
        } else if (Array.isArray(acf.gallery) && acf.gallery.length > 0) {
            galleryIds = acf.gallery.filter((id): id is number => typeof id === 'number' && id > 0);
        } else if (Array.isArray(acf.images) && acf.images.length > 0) {
            galleryIds = acf.images.filter((id): id is number => typeof id === 'number' && id > 0);
        } else if (Array.isArray(acf.project_gallery) && acf.project_gallery.length > 0) {
            galleryIds = acf.project_gallery.filter((id): id is number => typeof id === 'number' && id > 0);
        }
        
        // Also try to extract from _embedded media if available
        if (galleryIds.length === 0 && compoundData._embedded?.['wp:featuredmedia']) {
            const embeddedMedia = compoundData._embedded['wp:featuredmedia'];
            if (Array.isArray(embeddedMedia)) {
                galleryIds = embeddedMedia
                    .map(media => media.id)
                    .filter((id): id is number => typeof id === 'number' && id > 0);
            }
        }
        
        const galleryUrls = await getImageUrlsByIds(galleryIds, "large");

        // استخراج اسم الموقع من أكثر من خاصية محتملة
        let locationName = 'N/A';
        if (locationData) {
            if (typeof locationData.name === 'string' && locationData.name) {
                locationName = locationData.name;
            } else if (locationData.title && typeof locationData.title.rendered === 'string') {
                locationName = locationData.title.rendered;
            } else if (locationData.acf && typeof locationData.acf.name === 'string') {
                locationName = locationData.acf.name;
            }
        }

        return {
            id: compoundData.id,
            slug: compoundData.slug,
            name: safeString(compoundData.title.rendered, "Unnamed Compound"),
            description: safeString(compoundData.content?.rendered || acf.description, "No description available."),
            developer: developerData ? safeString(developerData.title.rendered, 'N/A') : 'N/A',
            location: locationName,
            status: safeString(acf.status, "Available"),
            delivery: safeString(acf.delivery_date, "TBD"),
            mainImage: await extractImageUrlAsync(
                acf.banner_image || compoundData._embedded?.["wp:featuredmedia"]?.[0]?.id,
                "large"
            ),
            mainImageHint: 'modern apartment building',
            gallery: galleryUrls || [],
            amenities: Array.isArray(acf.amenities)
                ? acf.amenities.map((a: any) => safeString(a.name || a))
                : [],
        };
    } catch (error) {
        console.error(`Error fetching compound '${slug}':`, error);
        return null;
    }
}



// Fetch locations from WordPress API
export async function fetchLocations(): Promise<WordPressLocation[]> {
    try {
        const response = await fetch(`${WP_API_BASE}/location?_embed&per_page=100`, {
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch locations: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching locations:', error);
        return [];
    }
}

// Fetch single location by slug
export async function fetchLocationBySlug(slug: string): Promise<WordPressLocation | null> {
     if (!slug) return null;
    try {
        const response = await fetch(`${WP_API_BASE}/location?slug=${slug}&_embed&per_page=1`, {
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch location: ${response.status}`);
        }

        const locations = await response.json();
        return locations[0] || null;
    } catch (error) {
        console.error(`Error fetching location '${slug}':`, error);
        return null;
    }
}

// Note: fetchCompoundsByLocation removed as location pages are no longer needed

// Fetch compounds by developer
export async function fetchCompoundsByDeveloper(developerSlug: string): Promise<WordPressCompound[]> {
    try {
        // First get the developer to find its ID
        const developer = await fetchDeveloperBySlug(developerSlug);
        if (!developer) return [];

        // Fetch all compounds and filter by developer
        const allCompounds = await fetchCompounds({ per_page: 150 }); // This will trigger pagination internally
        
        // Filter compounds that match this developer
        const developerCompounds = allCompounds.filter(compound => {
            // Check if developer matches by name
            if (compound.developerName && developer.title?.rendered) {
                return compound.developerName.toLowerCase() === developer.title.rendered.toLowerCase();
            }
            
            // Also check ACF developer field
            if (compound.acf?.developer) {
                if (typeof compound.acf.developer === 'object' && compound.acf.developer.post_name) {
                    return compound.acf.developer.post_name === developerSlug;
                }
            }
            
            // Check developer_to_developer field
            if (Array.isArray(compound.acf?.developer_to_developer)) {
                return compound.acf.developer_to_developer.includes(developer.id);
            }
            
            return false;
        });

        return developerCompounds;
    } catch (error) {
        console.error('Error fetching compounds by developer:', error);
        return [];
    }
}

// Fetch blog posts from WordPress API
export async function getPosts(limit = 100): Promise<FlatPost[]> {
    const res = await fetch(`${WP_API_BASE}/posts?_embed&per_page=${limit}`, { next: { revalidate: 3600 } });
    if (!res.ok) {
        throw new Error('Failed to fetch posts');
    }
    const posts: any[] = await res.json();

    const flattenedPosts = await Promise.all(posts.map(async (post) => {
        const author = post._embedded?.author?.[0];
        const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];

        const authorImageId = author?.avatar_urls?.['96'] ? null : (author?.acf?.profile_picture || null);
        const authorImageUrl = authorImageId ? await getImageUrlById(authorImageId, 'thumbnail') : author?.avatar_urls?.['96'] || null;

        return {
            id: post.id,
            slug: post.slug,
            title: post.title.rendered,
            excerpt: post.excerpt.rendered.replace(/<[^>]+>/g, ''),
            content: post.content.rendered,
            date: post.date,
            author: {
                name: author?.name || 'Anonymous',
                pictureUrl: authorImageUrl,
            },
            image: {
                url: featuredMedia?.source_url || null,
                alt: featuredMedia?.alt_text || post.title.rendered,
            },
        };
    }));

    return flattenedPosts;
}

// Fetch a single blog post by slug
export async function getPostBySlug(slug: string): Promise<FlatPost | null> {
    const res = await fetch(`${WP_API_BASE}/posts?slug=${slug}&_embed`, { next: { revalidate: 3600 } });
    if (!res.ok) {
        return null;
    }
    const posts = await res.json();
    if (posts.length === 0) {
        return null;
    }

    const post = posts[0];
    const author = post._embedded?.author?.[0];
    const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];

    const authorImageId = author?.avatar_urls?.['96'] ? null : (author?.acf?.profile_picture || null);
    const authorImageUrl = authorImageId ? await getImageUrlById(authorImageId, 'thumbnail') : author?.avatar_urls?.['96'] || null;

    return {
        id: post.id,
        slug: post.slug,
        title: post.title.rendered,
        excerpt: post.excerpt.rendered.replace(/<[^>]+>/g, ''),
        content: post.content.rendered,
        date: post.date,
        author: {
            name: author?.name || 'Anonymous',
            pictureUrl: authorImageUrl,
        },
        image: {
            url: featuredMedia?.source_url || null,
            alt: featuredMedia?.alt_text || post.title.rendered,
        },
    };
}
