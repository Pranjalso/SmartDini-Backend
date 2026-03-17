import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactFormEmail } from "@/lib/email/mailer";

const contactSchema = z.object({
  contactNo: z.string().min(10, "Contact number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  cafeLocation: z.string().min(3, "Cafe location must be at least 3 characters"),
  cafeCity: z.string().min(3, "Cafe city must be at least 3 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = contactSchema.parse(body);

    // Send email
    await sendContactFormEmail({
      contactNo: validatedData.contactNo,
      email: validatedData.email,
      cafeLocation: validatedData.cafeLocation,
      cafeCity: validatedData.cafeCity,
    });

    return NextResponse.json(
      { message: "Contact request sent successfully" },
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
