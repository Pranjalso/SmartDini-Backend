"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, ShoppingBag, Home } from "lucide-react";

// For Next.js 15, we need to handle params as a Promise
type PageProps = {
  params: Promise<{ menupages: string }>
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  // Unwrap the params Promise
  const { menupages } = await params;
  
  return <OrderConfirmationPageContent menupages={menupages} />;
}

function OrderConfirmationPageContent({ menupages }: { menupages: string }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-8 flex flex-col items-center justify-center min-h-screen">
          <div className="w-24 h-24 bg-green-100 rounded-full mb-6 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2 text-center">Order Confirmed!</h1>
          <p className="text-gray-600 text-center mb-2">Order #ORD-{Math.floor(1000 + Math.random() * 9000)}</p>
          <p className="text-sm text-gray-500 text-center mb-8">
            Your order has been placed successfully. We'll notify you when it's ready.
          </p>

          <div className="w-full space-y-3">
            <Link
              href={`/${menupages}/menu`}
              className="block w-full bg-[#D32F2F] text-white text-center py-3.5 rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors"
            >
              <ShoppingBag className="w-5 h-5 inline mr-2" />
              Order More
            </Link>
            
            <button
              onClick={() => router.push('/')}
              className="block w-full bg-gray-100 text-gray-700 text-center py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              <Home className="w-5 h-5 inline mr-2" />
              Go Home
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-8">
            Estimated preparation time: 15-20 minutes
          </p>
        </div>
      </div>
    </div>
  );
}