
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { getActiveBanners } from "@/services/bannerService";
import type { Banner } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

export function RollingBanner() {
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const fetchBanners = async () => {
      setIsLoading(true);
      const activeBanners = await getActiveBanners();
      setBanners(activeBanners);
      setIsLoading(false);
    };
    fetchBanners();
  }, []);

  React.useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (isLoading) {
    return (
      <div className="w-full aspect-[16/8.5] md:aspect-[16/6] bg-muted rounded-lg flex items-center justify-center"> {/* Adjusted aspect ratio */}
        <p className="text-muted-foreground">Loading banners...</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
        <section className="text-center py-12 bg-secondary/30 rounded-lg shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
          Welcome to Parenting Pathways
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-foreground/80">
          Your journey to confident and joyful parenting starts here. Explore programs tailored to your child's age and your needs.
        </p>
         <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/programs">
              Explore All Programs
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full mb-12">
      <Carousel
        setApi={setApi}
        className="w-full"
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <Card className="overflow-hidden rounded-lg shadow-xl border-none p-0">
                <CardContent className="relative aspect-[16/8.5] md:aspect-[16/6] p-0"> {/* Adjusted aspect ratio */}
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title || `Banner ${banner.id}`}
                    layout="fill"
                    objectFit="cover"
                    className="brightness-75"
                    data-ai-hint="hero banner"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/40 text-white">
                    {banner.title && (
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 drop-shadow-lg"> {/* Reduced title font size */}
                        {banner.title}
                      </h2>
                    )}
                    {banner.description && (
                      <p className="text-sm sm:text-base md:text-lg max-w-lg sm:max-w-xl mb-4 sm:mb-6 drop-shadow-md"> {/* Reduced description font size */}
                        {banner.description}
                      </p>
                    )}
                    {banner.linkUrl && (
                      <Button size="sm" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs">
                        <Link href={banner.linkUrl}>
                          Learn More <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80 text-foreground" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80 text-foreground" />
      </Carousel>
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {Array.from({ length: count }).map((_, index) => (
            <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 w-2 rounded-full ${
                current === index + 1 ? "bg-primary scale-125" : "bg-muted/50"
                } transition-all`}
                aria-label={`Go to slide ${index + 1}`}
            />
            ))}
        </div>
      )}
    </section>
  );
}

