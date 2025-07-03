import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sponsor from '@/models/Sponsor';
import mongoose from 'mongoose';

// Define the sponsorship interface including Razorpay fields
interface Sponsorship {
    _id: mongoose.Types.ObjectId;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
    userId?: string;
    name: string;
    email: string;
    phone: string;
    amount: string;
    type: string;
    period: string;
    status: string;
    paymentMethod?: string;
    district: string;
    locationType: string;
    location: string;
    panchayat: string;
    address: string;
    notes: string;
    sendWhatsAppNotification: boolean;
    __v: number;
}

// GET handler to fetch a single sponsorship by ID
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Await params to resolve dynamic route parameters
        const params = await req.nextUrl.pathname.split('/').pop();
        const id = params || '';

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid sponsorship ID' },
                { status: 400 }
            );
        }

        // Find sponsorship by ID
        const sponsorship = await Sponsor.findById(id).lean() as Sponsorship;

        if (!sponsorship) {
            return NextResponse.json(
                { error: 'Sponsorship not found' },
                { status: 404 }
            );
        }

        // Format the payment method if needed
        let paymentMethod = 'Online Payment';
        const paymentId = sponsorship.razorpayPaymentId;
        
        if (paymentId === 'OFFLINE_PAYMENT') {
            paymentMethod = 'Cash';
        } else if (paymentId?.startsWith('CHECK-')) {
            paymentMethod = 'Check';
        } else if (paymentId?.startsWith('BANK-')) {
            paymentMethod = 'Bank Transfer';
        } else if (paymentId?.startsWith('UPI-')) {
            paymentMethod = 'UPI';
        } else if (sponsorship.razorpayOrderId?.startsWith('MANUAL-')) {
            paymentMethod = 'Manual Entry';
        }
        
        // Add the determined payment method to the response
        const formattedSponsorship: Sponsorship & { paymentMethod: string } = {
            ...sponsorship,
            paymentMethod
        };

        return NextResponse.json(formattedSponsorship);
    } catch (error) {
        console.error('Error fetching sponsorship:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sponsorship' },
            { status: 500 }
        );
    }
}

// PUT handler to update a sponsorship by ID
export async function PUT(req: NextRequest) {
    try {
        await dbConnect();

        // Await params to resolve dynamic route parameters
        const params = await req.nextUrl.pathname.split('/').pop();
        const id = params || '';

        const data = await req.json();

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid sponsorship ID' },
                { status: 400 }
            );
        }

        // Fields that should not be updated
        const protectedFields = [
            'razorpayPaymentId',
            'razorpayOrderId',
            'razorpaySignature',
            'userId',
            '_id'
        ];

        // Remove protected fields from update data
        const updateData = Object.fromEntries(
            Object.entries(data).filter(([key]) => !protectedFields.includes(key))
        );

        // Update sponsorship
        const updatedSponsor = await Sponsor.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean() as Sponsorship;

        if (!updatedSponsor) {
            return NextResponse.json(
                { error: 'Sponsorship not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedSponsor);
    } catch (error) {
        console.error('Error updating sponsorship:', error);
        return NextResponse.json(
            { error: 'Failed to update sponsorship' },
            { status: 500 }
        );
    }
}

// DELETE handler to delete a sponsorship by ID
export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();

        // Await params to resolve dynamic route parameters
        const params = await req.nextUrl.pathname.split('/').pop();
        const id = params || '';

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid sponsorship ID' },
                { status: 400 }
            );
        }

        // Delete sponsorship
        const deletedSponsor = await Sponsor.findByIdAndDelete(id).lean() as Sponsorship;

        if (!deletedSponsor) {
            return NextResponse.json(
                { error: 'Sponsorship not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Sponsorship deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting sponsorship:', error);
        return NextResponse.json(
            { error: 'Failed to delete sponsorship' },
            { status: 500 }
        );
    }
}