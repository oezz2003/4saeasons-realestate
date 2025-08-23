// WordPress API data structures

export interface WordPressImage {
    id: number;
    url: string;
    alt: string;
    sizes?: {
        thumbnail?: string;
        medium?: string;
        large?: string;
        full?: string;
    };
}

export interface WordPressDeveloper {
    id: number;
    slug: string;
    title: { rendered: string };
    content: { rendered: string };
    acf: {
        name?: string;
        description?: string;
        logo?: WordPressImage | number;
        banner?: WordPressImage | number;
        website?: string;
        phone?: string;
        email?: string;
    };
    _embedded?: {
        'wp:featuredmedia'?: WordPressImage[];
    };
}

export interface WordPressCompound {
    id: number;
    slug: string;
    title: { rendered: string };
    content: { rendered: string };
    acf: {
        description?: string;
        location?: {
            term_id: number;
            name: string;
            slug: string;
        } | number | false;
        developer?: {
            ID: number;
            post_title: string;
            post_name: string;
        } | number | false;
        // الحقول الجديدة لدعم الربط عبر IDs
        developer_to_developer?: number[];
        location_to_location?: number[];
        banner_image?: WordPressImage | number;
        logo?: WordPressImage | number;
        gallery?: (WordPressImage | number | null)[];
        gallery_images?: (WordPressImage | number | null)[];
        images?: (WordPressImage | number | null)[];
        project_gallery?: (WordPressImage | number | null)[];
        unit_types?: string[];
        finishing_types?: string[];
        payment_plans?: string;
        starting_price?: number;
        max_price?: number;
        area_from?: number;
        area_to?: number;
        status?: string;
        amenities?: string[];
        delivery_date?: string;
    };
    _embedded?: {
        'wp:featuredmedia'?: WordPressImage[];
        'wp:term'?: WordPressLocation[][];
    };
    // Computed properties for resolved relationships
    developerName?: string;
    locationName?: string;
}


export interface WordPressLocation {
    id: number;
    slug: string;
    name: string; // Added name for direct access
    title?: { rendered: string }; // Added title property for consistency
    description?: string;
    taxonomy?: string;
    acf?: {
        name?: string;
        [key: string]: any;
    };
}

export interface FlatPost {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    author: {
        name: string;
        pictureUrl: string | null;
    };
    image: {
        url: string | null;
        alt: string;
    };
}


// Simplified types for use in components
export interface Developer {
    id: number;
    slug: string;
    name: string;
    description: string;
    logoUrl: string;
    projectsCount?: number; // Optional, can be calculated
}

export interface Compound {
    id: number;
    slug: string;
    name: string;
    description: string;
    developer: {
        name: string;
        slug: string;
    };
    location: string;
    bannerUrl: string;
    logoUrl: string;
    galleryUrls: string[];
    price: string;
    beds: number;
    baths: number;
    area: number;
    status: string;
    delivery: string;
}
