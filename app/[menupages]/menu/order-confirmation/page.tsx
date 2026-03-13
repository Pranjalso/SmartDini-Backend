"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ShoppingBag, Home, Clock } from "lucide-react";
import { Suspense } from "react";

// For Next.js 15, we need to handle params as a Promise
type PageProps = {
  params: Promise<{ menupages: string }>
}

function OrderConfirmationContent({ menupages }: { menupages: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-8 flex flex-col items-center justify-center min-h-screen">
          <div className="w-24 h-24 bg-green-100 rounded-full mb-6 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2 text-center">Order Confirmed!</h1>
          <p className="text-gray-600 text-center mb-2">
            {orderNumber ? (
              <>Order #<span className="font-semibold">{orderNumber}</span></>
            ) : (
              <>Order #ORD-{Math.floor(1000 + Math.random() * 9000)}</>
            )}
          </p>
          <p className="text-sm text-gray-500 text-center mb-8">
            Your order has been placed successfully. We'll notify you when it's ready.
          </p>

          <div className="w-full bg-amber-50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Estimated Time</h3>
                <p className="text-xs text-amber-700">
                  Your order will be ready in approximately 15-20 minutes.
                </p>
              </div>
            </div>
          </div>

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
            Thank you for choosing SmartDini!
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { menupages } = await params;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#D32F2F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Loading confirmation...</p>
          </div>
        </div>
      </div>
    }>
      <OrderConfirmationContent menupages={menupages} />
    </Suspense>
  );
}