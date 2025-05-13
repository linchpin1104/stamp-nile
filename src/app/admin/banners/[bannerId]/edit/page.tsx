
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { BannerForm, type BannerFormData } from '@/components/admin/banner-form';
import type { Banner } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getBannerById, updateBanner } from '@/services/bannerService';

export default function EditBannerPage() {
  const router = useRouter();
  const { bannerId: routeBannerId } = useParams();
  const { toast } = useToast();

  const [bannerId, setBannerId] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof routeBannerId === 'string') {
      setBannerId(routeBannerId);
    } else {
      setBannerId(null);
    }
  }, [routeBannerId]);

  useEffect(() => {
    if (bannerId) {
      const fetchBanner = async () => {
        setIsLoading(true);
        const fetchedBanner = await getBannerById(bannerId);
        if (fetchedBanner) {
          setBanner(fetchedBanner);
        } else {
          toast({ title: "Error", description: "Banner not found.", variant: "destructive" });
          router.push('/admin/banners');
        }
        setIsLoading(false);
      };
      fetchBanner();
    }
  }, [bannerId, router, toast]);

  const handleUpdateBanner = async (data: BannerFormData) => {
    if (!banner || !bannerId) return;
    
    const updatedBanner = await updateBanner(bannerId, data);

    if (updatedBanner) {
      setBanner(updatedBanner);
      toast({ title: "Banner Updated", description: "Banner details saved successfully." });
      router.push('/admin/banners');
    } else {
      toast({ title: "Error", description: "Failed to update banner.", variant: "destructive" });
    }
  };

  const handleCancel = () => {
    router.push('/admin/banners');
  };

  if (!bannerId || isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Loading banner details...</p></div>;
  }

  if (!banner) {
    return <div className="text-center py-10">Banner not found. <Link href="/admin/banners" className="text-accent underline">Go back</Link>.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-start">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/banners">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Banners
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <ImageIcon className="mr-3 h-7 w-7" /> Edit Banner: <span className="ml-2 font-medium text-foreground truncate max-w-xs">{banner.title}</span>
          </CardTitle>
          <CardDescription>Modify the details for this homepage banner.</CardDescription>
        </CardHeader>
        <CardContent>
          <BannerForm initialData={banner} onSubmit={handleUpdateBanner} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
}
