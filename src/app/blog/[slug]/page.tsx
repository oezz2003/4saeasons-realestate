import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }
  
  const authorNameFallback = post.author.name.split(' ').map(n => n[0]).join('');

  return (
    <article className="container mx-auto max-w-4xl py-12 px-4 md:py-20 animate-fade-in">
        {/* Header */}
        <header className="mb-8">
            <div className="overflow-hidden py-1">
                <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight mb-4 animate-title-reveal">
                    {post.title}
                </h1>
            </div>
            <div className="flex items-center space-x-4 text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        {post.author.pictureUrl && <AvatarImage src={post.author.pictureUrl} alt={post.author.name} />}
                        <AvatarFallback>{authorNameFallback}</AvatarFallback>
                    </Avatar>
                    <span>{post.author.name}</span>
                </div>
                <span className="hidden md:block">|</span>
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                </div>
            </div>
        </header>

        {/* Featured Image */}
        {post.image.url && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Image
                    src={post.image.url}
                    alt={post.image.alt || post.title}
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        )}

        {/* Post Content */}
        <div
            className="prose prose-lg dark:prose-invert max-w-none mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
            dangerouslySetInnerHTML={{ __html: post.content }}
        />
    </article>
  );
}
