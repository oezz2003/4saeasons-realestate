"use client";

import { useState, useEffect, useRef } from 'react';
import { Award, Building, Users, Smile } from "lucide-react";

type Stat = {
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
};

const statsData: Stat[] = [
  { icon: Award, value: 10, label: "Years of Experience", suffix: "+" },
  { icon: Building, value: 500, label: "Properties Sold", suffix: "+" },
  { icon: Users, value: 1200, label: "Happy Clients", suffix: "+" },
  { icon: Smile, value: 98, label: "Satisfaction Rate", suffix: "%" },
];

function AnimatedNumber({ value, suffix = "", startAnimation }: { value: number; suffix?: string; startAnimation: boolean }) {
  const [count, setCount] = useState(0);
  const duration = 2000;

  useEffect(() => {
    if (!startAnimation) return;

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const newCount = Math.min(Math.floor((progress / duration) * value), value);
      setCount(newCount);

      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, startAnimation]);

  return (
    <p className="text-4xl font-bold">
      {count}
      {suffix}
    </p>
  );
}

export function AnimatedStats() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.3,
      }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-12 md:py-20 bg-primary/10">
      <div className="container mx-auto px-4">
        <div className="overflow-hidden py-1 text-center">
          <h2 className="text-3xl font-bold mb-10 font-headline animate-title-reveal">Our Journey in Numbers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className="group p-6"
              >
                <div className="relative inline-block mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2">
                    <Icon className="w-12 h-12 text-primary" />
                </div>
                <AnimatedNumber value={stat.value} suffix={stat.suffix} startAnimation={isVisible} />
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
