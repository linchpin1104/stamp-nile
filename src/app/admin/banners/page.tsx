
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Banner } from '@/types';
import { PlusCircle, Image as ImageIcon } from 'lucide-react';
import { BannersDataTable } from '@/components/admin/banners-data-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { getBanners, deleteBanner } from '@/services/bannerService';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBannersData = async () => {
      setIsLoading(true);
      try {
        const fetchedBanners = await getBanners();
        setBanners(fetchedBanners);
      } catch (error) {
        console.error("Error fetching banners:", error);
        toast({
          title: "Error",
          description: "Could not load banners. Please try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };

    fetchBannersData();
  }, [toast]);

  const handleDeleteBanner = async (bannerId: string) => {
    const success = await deleteBanner(bannerId);
    if (success) {
      setBanners(prevBanners => prevBanners.filter(b => b.id !== bannerId));
      toast({
        title: "Banner Deleted",
        description: "The banner has been successfully deleted.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete banner. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading banners...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center">
            <ImageIcon className="mr-3 h-8 w-8" /> Banner Management
          </h1>
          <p className="text-muted-foreground">Create, view, and manage homepage banners.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/admin/banners/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Banner
          </Link>
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Banners</CardTitle>
          <CardDescription>A list of all banners currently in the system. Drag to reorder (feature coming soon).</CardDescription>
        </CardHeader>
        <CardContent>
          <BannersDataTable data={banners} onDeleteBanner={handleDeleteBanner} />
        </CardContent>
      </Card>
    </div>
  );
}
