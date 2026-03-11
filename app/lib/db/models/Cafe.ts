import mongoose, { Schema, Document } from 'mongoose';

export interface ICafeDocument extends Document {
  cafeName: string;
  ownerName: string;
  email: string;
  city: string;
  location: string;
  subscriptionPlan: 'Demo (7 Days)' | '1 Month' | '3 Months' | '6 Months' | '12 Months' | 'Lifetime';
  startDate: Date;
  endDate: Date;
  slug: string;
  username: string;
  password: string;
  isActive: boolean;
  tokenVersion?: number;
  passwordChangedAt?: Date;
}

const CafeSchema = new Schema<ICafeDocument>(
  {
    cafeName: {
      type: String,
      required: [true, 'Cafe name is required'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ['Demo (7 Days)', '1 Month', '3 Months', '6 Months', '12 Months', 'Lifetime'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    passwordChangedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
CafeSchema.index({ slug: 1 });
CafeSchema.index({ username: 1 });
CafeSchema.index({ city: 1 });
CafeSchema.index({ isActive: 1 });
CafeSchema.index({ email: 1 });

export default mongoose.models.Cafe || mongoose.model<ICafeDocument>('Cafe', CafeSchema);
