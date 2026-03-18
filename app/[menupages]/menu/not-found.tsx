"use client";
import Link from 'next/link';
import { Home, AlertCircle, Coffee } from 'lucide-react';

export default function CafeNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Illustration */}
        <div className="mb-8">
          <div className="inline-block p-6 bg-red-50 rounded-full mb-4">
            <AlertCircle className="w-20 h-20 text-[#D92632]" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Cafe Not Found
        </h1>
        <p className="text-gray-600 mb-4 text-lg">
          The cafe you're looking for doesn't exist on SmartDini.
        </p>
        
        

      

        {/* QR Code Scan Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D92632]/10 rounded-full flex items-center justify-center">
              <Coffee className="w-5 h-5 text-[#D92632]" />
            </div>
            <p className="text-xs text-gray-600 text-left">
              <span className="font-semibold">Scanning a QR code?</span><br />
              Make sure you're using the official SmartDini QR code from the cafe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}