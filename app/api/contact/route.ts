import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/connect";
import Contact from "@/lib/db/models/Contact";
import { sendContactFormEmail } from "@/lib/email/mailer";

const contactSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  city: z.string().min(2, "City must be at least 2 characters"),
  cafeRestaurantName: z.string().min(2, "Cafe/Restaurant name must be at least 2 characters"),
  needs: z.string().min(10, "Please describe your requirements in at least 10 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = contactSchema.parse(body);

    // Connect to database
    await connectDB();

    // Save to database
    const contact = await Contact.create({
      fullName: validatedData.fullName,
      contactNumber: validatedData.contactNumber,
      email: validatedData.email,
      city: validatedData.city,
      cafeRestaurantName: validatedData.cafeRestaurantName,
      needs: validatedData.needs,
      status: 'new',
    });

    // Send email notification
    await sendContactFormEmail(validatedData);

    return NextResponse.json(
      { 
        message: "Contact request sent successfully", 
        data: {
          id: contact._id,
          status: contact.status,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to send contact request. Please try again later." },
      { status: 500 }
    );
  }
}