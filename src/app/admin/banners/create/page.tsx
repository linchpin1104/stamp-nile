
"use client";

import { BannerForm, type BannerFormData } from '@/components/admin/banner-form';
import { useRouter } from 'next/navigation';
import type { Banner } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { createBanner } from '@/services/bannerService';

export default function CreateBannerPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateBanner = async (data: BannerFormData) => {
    const newBanner = await createBanner(data);
    
    if (newBanner) {
      toast({
        title: "Banner Created",
        description: `Banner "${newBanner.title}" has been successfully created.`,
      });
      router.push('/admin/banners');
    } else {
      toast({
        title: "Error",
        description: "Failed to create banner. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    router.push('/admin/banners');
  };

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
            <ImageIcon className="mr-3 h-7 w-7" /> Create New Banner
            </CardTitle>
          <CardDescription>Fill in the details for the new homepage banner.</CardDescription>
        </CardHeader>
        <CardContent>
          <BannerForm onSubmit={handleCreateBanner} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
}
