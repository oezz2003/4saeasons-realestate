import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPosts } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { FlatPost } from '@/lib/types';

function PostCard({ post }: { post: FlatPost }) {
  const authorNameFallback = post.author.name.split(' ').map(n => n[0]).join('');
  const imageUrl = post.image.url || 'https://placehold.co/800x600.png';
  const authorImageUrl = post.author.pictureUrl;

  return (
    <Card className="overflow-hidden flex flex-col animate-fade-in-up">
      <CardHeader className="p-0">
          <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
              <Image
                  src={imageUrl}
                  alt={post.image.alt || post.title}
                  data-ai-hint="blog post"
                  width={800}
                  height={600}
                  className="object-cover w-full h-56 transition-transform duration-300 hover:scale-105"
              />
          </Link>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="font-headline text-xl mb-3">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">{post.title}</Link>
        </CardTitle>
        <p className="text-muted-foreground text-sm leading-relaxed">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="p-6 bg-primary/5 flex flex-col items-start gap-4 mt-auto">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            {authorImageUrl && <AvatarImage src={authorImageUrl} alt={post.author.name} data-ai-hint="professional photo" />}
            <AvatarFallback>{authorNameFallback}</AvatarFallback>
          </Avatar>
          <div>
              <p className="font-semibold">{post.author.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(post.date)}</span>
              </div>
          </div>
        </div>
         <Link href={`/blog/${post.slug}`} className="w-full">
          <Button variant="outline" className="w-full">
              Read More <ArrowRight className="ml-2 h-4 w-4"/>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto py-12 px-4 md:py-20">
      <div className="text-center mb-12">
        <div className="overflow-hidden py-1">
          <h1 className="text-4xl md:text-5xl font-bold font-headline animate-title-reveal">Real Estate Insights</h1>
        </div>
        <div className="overflow-hidden py-1">
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto animate-title-reveal" style={{ animationDelay: '0.1s' }}>
            Your source for the latest news, tips, and trends in the Egyptian property market.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <div key={post.id} style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
}
