export interface IUser {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'individual' | 'business' | 'admin';
  profilePhoto: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  driverLicense?: {
    frontImage: string;
    backImage: string;
    verified: boolean;
  };
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IVehicle {
  _id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  transmission: 'manual' | 'automatic';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  seats: number;
  doors: number;
  location: string;
  coordinates: { lat: number; lng: number };
  description: string;
  images: string[];
  dailyPrice: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  owner: IUser | string;
  business?: IBusiness | string;
  availability: boolean;
  status: 'pending' | 'approved' | 'rejected';
  category: 'economy' | 'compact' | 'mid-size' | 'suv' | 'luxury' | 'van' | 'truck';
  features: string[];
  insurance?: { type: string; provider: string; expiryDate: string };
  mileage?: number;
  fuelPolicy?: string;
  rating: number;
  numReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface IBooking {
  _id: string;
  user: IUser | string;
  vehicle: IVehicle | string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: string;
  pickupLocation: string;
  returnLocation: string;
  insurance: boolean;
  driverInfo?: any;
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  _id: string;
  user: IUser | string;
  vehicle: IVehicle | string;
  booking?: IBooking | string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface IMessage {
  _id: string;
  sender: IUser | string;
  receiver: IUser | string;
  listing?: IVehicle | string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  user: IUser | string;
  type: 'booking' | 'message' | 'review' | 'system' | 'payment';
  title: string;
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface IBusiness {
  _id: string;
  companyName: string;
  registrationNumber: string;
  logo: string;
  banner: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  owner: IUser | string;
  employees: { user: IUser | string; role: string }[];
  rating: number;
  numReviews: number;
  totalVehicles: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAnalytics {
  totalUsers: number;
  totalVehicles: number;
  totalBookings: number;
  totalRevenue: number;
  activeRentals: number;
  pendingApprovals: number;
  userGrowth: { date: string; count: number }[];
  revenueData: { date: string; amount: number }[];
  bookingStats: { date: string; count: number }[];
  mostRentedVehicles: { _id: string; title: string; count: number }[];
  vehicleCategories: { _id: string; count: number }[];
}

export type Language = 'sq' | 'en';
export type Theme = 'light' | 'dark';
