// src/services/whatsappService.js
import twilio from 'twilio';

export const whatsappService = {

    /**
 * Send a custom WhatsApp message to a donor using Twilio
 */
    async sendCustomMessage({ phone, message }) {
        try {
            // Format the phone number for WhatsApp
            const formattedPhone = formatPhoneNumber(phone);

            if (!formattedPhone) {
                throw new Error('Invalid phone number format');
            }

            // Initialize Twilio client
            const client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );

            // Send message through Twilio
            const twilioMessage = await client.messages.create({
                body: message,
                from: process.env.TWILIO_WHATSAPP_NUMBER, // This should be 'whatsapp:+13165318946'
                to: `whatsapp:+${formattedPhone}` // Format with whatsapp: prefix and + sign
            });

            return {
                success: true,
                messageId: twilioMessage.sid,
                status: twilioMessage.status
            };
        } catch (error) {
            console.error('Error sending custom WhatsApp message via Twilio:', error);
            return {
                success: false,
                error: error.message || 'Failed to send WhatsApp message'
            };
        }
    },
    /**
     * Send a WhatsApp message to a donor using Twilio
     */
    async sendDonationConfirmation(donor, donation) {
        try {
            // Format the phone number for WhatsApp
            const formattedPhone = formatPhoneNumber(donor.phone);

            if (!formattedPhone) {
                throw new Error('Invalid phone number format');
            }

            // Initialize Twilio client
            const client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );

            // Create the message content
            const message = createDonationMessage(donor, donation);

            // Send message through Twilio
            const twilioMessage = await client.messages.create({
                body: message,
                from: process.env.TWILIO_WHATSAPP_NUMBER, // This should be 'whatsapp:+13165318946'
                to: `whatsapp:+${formattedPhone}` // Format with whatsapp: prefix and + sign
            });

            return {
                success: true,
                messageId: twilioMessage.sid,
                status: twilioMessage.status
            };
        } catch (error) {
            console.error('Error sending WhatsApp message via Twilio:', error);
            return {
                success: false,
                error: error.message || 'Failed to send WhatsApp message'
            };
        }
    }
};

/**
 * Format phone number for Twilio WhatsApp
 * Twilio requires international format without the leading +
 */
function formatPhoneNumber(phone) {
    if (!phone) return null;

    // Remove any non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    // Ensure it has the country code (assuming India +91)
    // If it already has country code, use as is
    if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
        return digitsOnly;
    }

    // If it's a 10-digit number without country code (standard Indian number)
    if (digitsOnly.length === 10) {
        return `91${digitsOnly}`;
    }

    // Return null if format is unrecognized
    return null;
}

/**
 * Create a donation confirmation message for WhatsApp
 */
function createDonationMessage(donor, donation) {
    return `Hello ${donor.name || 'Donor'},

Thank you for your donation of ${donation.amount} to our organization.

Donation details:
- Date: ${donation.displayDate}
- Type: ${donation.type}
- Reference ID: ${donation.id}

Your support is greatly appreciated.

Best regards,
The Team`;
}