"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    
    // In a real app, you'd handle form submission here.
    console.log("Form submitted");

    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you shortly.",
    });

    form.reset();
  };

  return (
    <div className="container mx-auto py-12 px-4 md:py-20">
      <div className="text-center mb-12">
        <div className="overflow-hidden py-1">
            <h1 className="text-4xl md:text-5xl font-bold font-headline animate-title-reveal">Get In Touch</h1>
        </div>
        <div className="overflow-hidden py-1">
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto animate-title-reveal" style={{ animationDelay: '0.1s' }}>
              Have a question or ready to start your property journey? We're here to help.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Send Us a Message</CardTitle>
                    <CardDescription>Fill out the form and we'll get back to you shortly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Your Name" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="your.email@example.com" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" placeholder="What is this about?" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="Type your message here..." rows={5} required />
                        </div>
                        <Button type="submit" className="w-full" size="lg">Send Message</Button>
                    </form>
                </CardContent>
            </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div>
                 <div className="overflow-hidden py-1">
                    <h2 className="text-2xl font-bold font-headline mb-4 animate-title-reveal">Contact Information</h2>
                 </div>
                <div className="space-y-4 text-muted-foreground">
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full mt-1">
                            <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Our Office</h3>
                            <p>123 Real Estate St, Cairo, Egypt</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full mt-1">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Email Us</h3>
                            <p>contact@4seasons.com</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full mt-1">
                            <Phone className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Call Us</h3>
                            <p>+20 123 456 7890</p>
                        </div>
                    </div>
                </div>
            </div>
             <div>
                <div className="overflow-hidden py-1">
                    <h2 className="text-2xl font-bold font-headline mb-4 animate-title-reveal">Find Us On The Map</h2>
                </div>
                <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-md">
                   <Image src="https://placehold.co/800x400.png" alt="Location map" data-ai-hint="map location" fill className="object-cover" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
