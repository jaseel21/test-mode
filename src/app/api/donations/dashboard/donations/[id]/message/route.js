// src/app/api/donations/dashboard/donations/[id]/message/route.js
import { NextResponse } from 'next/server';
import { donationService } from '@/services/donationService';
import { whatsappService } from '@/services/whatsappService';

export async function POST(request, { params }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: 'Donation ID is required' },
                { status: 400 }
            );
        }

        // Parse request body
        let data;
        try {
            data = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Validate message text
        if (!data.message || !data.message.trim()) {
            return NextResponse.json(
                { error: 'Message text is required' },
                { status: 400 }
            );
        }

        // Get the donation details
        const donation = await donationService.getDonationById(id);

        // Validate phone number
        if (!donation.phone || donation.phone === 'N/A') {
            return NextResponse.json(
                { error: 'Donor does not have a valid phone number' },
                { status: 400 }
            );
        }

        // Process placeholders in the message
        const processedMessage = processMessagePlaceholders(data.message, donation);

        // Send the message
        const result = await whatsappService.sendCustomMessage({
            phone: donation.phone,
            name: donation.donor,
            message: processedMessage
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to send message' },
                { status: 500 }
            );
        }

        // Update donation to record message sent
        await donationService.logMessageSent(id, {
            message: processedMessage,
            timestamp: new Date(),
            status: 'sent'
        });

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully',
            messageId: result.messageId,
            status: result.status
        });
    } catch (error) {
        console.error(`Error sending message for donation ${params.id}:`, error);

        // Determine appropriate status code
        const statusCode = error.message?.includes('not found') ? 404 : 500;

        return NextResponse.json(
            {
                error: `Failed to send message: ${error.message}`,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: statusCode }
        );
    }
}

function processMessagePlaceholders(message, donation) {
    // Replace placeholders with actual values
    return message
        .replace(/{name}/g, donation.donor || 'Donor')
        .replace(/{amount}/g, donation.amount || '')
        .replace(/{type}/g, donation.type || '')
        .replace(/{id}/g, donation.id || '')
        .replace(/{date}/g, donation.date ? new Date(donation.date).toLocaleDateString() : '')
        .replace(/{status}/g, donation.status || '');
}