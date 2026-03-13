import { notFound } from "next/navigation";
import MenuClient from "./MenuClient";
import { getMenuCategories, getMenuItems } from "@/lib/db/menu";
import connectDB from "@/lib/db/connect";
import Cafe from "@/lib/db/models/Cafe";

type PageProps = {
  params: Promise<{ menupages: string }>
}

// This is a Server Component (no 'use client' directive)
export default async function MenuPage({ params }: PageProps) {
  const { menupages } = await params;

  // Check if cafe exists and is active
  try {
    await connectDB();
    const cafe = await Cafe.findOne({ slug: menupages }).select('slug cafeName isActive endDate subscriptionPlan');
    
    // Check if subscription has expired
    const isExpired = cafe && cafe.subscriptionPlan !== 'Lifetime' && new Date(cafe.endDate) < new Date();

    if (!cafe || !cafe.isActive || isExpired) {
      notFound();
    }
    
    // Cafe exists and is active, fetch initial data
    const fallbackCatImg = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop";

    // Fetch categories directly from DB
    let initialCategories: Array<{ name: string; image: string }> = [];
    try {
      const cats = await getMenuCategories(menupages);
      if (Array.isArray(cats)) {
        initialCategories = cats.map((c: any) => ({ name: c.name, image: c.image || fallbackCatImg }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }

    // Fetch first category's items directly from DB for initial render
    let initialItems: any[] = [];
    const firstCat = initialCategories[0]?.name;
    if (firstCat) {
      try {
        const items = await getMenuItems(menupages, firstCat);
        if (Array.isArray(items)) {
          initialItems = items.map((item: any) => ({
            id: String(item._id),
            name: item.name,
            price: item.price,
            category: item.category,
            image: item.imageUrl,
            description: item.description,
          }));
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    }

    // Pass the fetched data to the client component
    return (
      <MenuClient 
        menupages={menupages} 
        initialItems={initialItems} 
        initialCategories={initialCategories} 
      />
    );

  } catch (error) {
    console.error('Error validating cafe:', error);
    notFound();
  }
}