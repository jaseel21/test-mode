import connectToDatabase from '../lib/db';
import Donation from '../models/Donation';

export const donationService = {
  /**
   * Get all donations with filtering, sorting and pagination
   */
  async getAllDonations({ 
    searchText = '', 
    selectedType = '', 
    selectedStatus = '', 
    dateFrom = '', 
    dateTo = '', 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    page = 1, 
    limit = 10,
    exportAll = false // Flag to return all data for export
  } = {}) {
    await connectToDatabase();
    
    // Build the filter query
    const query = {};
    
    // Search text across multiple fields
    if (searchText) {
      query.$or = [
        { name: { $regex: searchText, $options: 'i' } },
        { phone: { $regex: searchText, $options: 'i' } },
        { razorpayOrderId: { $regex: searchText, $options: 'i' } },
        { email: { $regex: searchText, $options: 'i' } }
      ];
    }
    
    // Type filter
    if (selectedType) {
      query.type = selectedType;
    }
    
    // Status filter
    if (selectedStatus) {
      query.status = selectedStatus;
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      
      if (dateTo) {
        // Add one day to include the end date fully
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        query.createdAt.$lte = endDate;
      }
    }
    
    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // For exports, skip pagination
    if (exportAll) {
      const donations = await Donation.find(query).sort(sortOptions).lean();
      return {
        donations: formatDonations(donations),
        totalItems: donations.length,
        totalPages: 1,
        currentPage: 1
      };
    }
    
    // For normal views, apply pagination
    const skip = (page - 1) * limit;
    
    // Execute queries
    const [donations, totalItems] = await Promise.all([
      Donation.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      Donation.countDocuments(query)
    ]);
    
    return {
      donations: formatDonations(donations),
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page
    };
  },

  /**
 * Log a message sent to the donor
 */
async logMessageSent(id, messageData) {
  await connectToDatabase();
  
  const donation = await Donation.findById(id);
  
  if (!donation) {
    throw new Error(`Donation with ID ${id} not found`);
  }
  
  // If messageHistory doesn't exist, create it
  if (!donation.messageHistory) {
    donation.messageHistory = [];
  }
  
  // Add the new message to the history
  donation.messageHistory.push({
    message: messageData.message,
    timestamp: messageData.timestamp,
    status: messageData.status
  });
  
  // Save the updated donation
  await donation.save();
  
  return { success: true };
},
  
  /**
   * Get a single donation by ID
   */
  async getDonationById(id) {
    await connectToDatabase();
    
    const donation = await Donation.findOne({
      $or: [
        { _id: id },
        { razorpayOrderId: id }
      ]
    }).lean();
    
    if (!donation) {
      throw new Error(`Donation with ID ${id} not found`);
    }
    
    return formatDonation(donation);
  },
  
  /**
   * Create a new manual donation
   */
  async createManualDonation(data) {
    await connectToDatabase();
    
    // Format the data according to the schema
    const donationData = {
      name: data.name,
      email: data.email || null,
      phone: data.phone,
      amount: data.amount,
      type: data.type,
      status: data.status || 'Completed',
      razorpayPaymentId: data.razorpayPaymentId || 'OFFLINE_PAYMENT',
      razorpayOrderId: data.razorpayOrderId || `MANUAL-${Date.now()}`,
      
      // Additional location details
      district: data.district || null,
      panchayat: data.location || null,
      locationType: data.locationType || 'district',
      address: data.address || null,
      
      createdAt: new Date()
    };
    
    // Create the donation
    const donation = new Donation(donationData);
    await donation.save();
    
    return formatDonation(donation.toObject());
  },
  
  /**
   * Update donation status
   */
  async updateDonationStatus(id, { status }) {
    await connectToDatabase();
    
    const donation = await Donation.findById(id);
    
    if (!donation) {
      throw new Error(`Donation with ID ${id} not found`);
    }
    
    donation.status = status;
    
    await donation.save();
    
    return formatDonation(donation.toObject());
  },

  /**
   * Delete a donation by ID
   */
  async deleteDonation(id) {
    await connectToDatabase();
    
    // Attempt to find and delete the donation
    const result = await Donation.findByIdAndDelete(id);
    
    if (!result) {
      throw new Error(`Donation with ID ${id} not found`);
    }
    
    return { success: true };
  }
};

/**
 * Format a donation object to match UI expectations
 */
function formatDonation(donation) {
  // Format date for display
  let formattedDate = '';
  let displayDate = '';
  let createdAt = null;
  
  try {
    // Check if createdAt exists and is valid
    if (donation.createdAt && !isNaN(new Date(donation.createdAt).getTime())) {
      createdAt = new Date(donation.createdAt);
      formattedDate = createdAt.toISOString().split('T')[0];
      displayDate = createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } else {
      // Fallback for missing or invalid dates
      formattedDate = 'N/A';
      displayDate = 'N/A';
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    formattedDate = 'N/A';
    displayDate = 'N/A';
  }
  
  // Generate a donation ID format
  const donationId = donation.razorpayOrderId || 
                    `DON-${donation._id.toString().substr(-4).toUpperCase()}`;
  
  // Format amount with currency symbol
  let formattedAmount = 'N/A';
  try {
    if (donation.amount !== undefined && donation.amount !== null) {
      formattedAmount = `₹${parseFloat(donation.amount).toLocaleString('en-IN')}`;
    }
  } catch (error) {
    console.error('Error formatting amount:', error);
  }
  
  // Determine payment method
  let paymentMethod = 'Online Payment';
  if (donation.razorpayPaymentId === 'OFFLINE_PAYMENT') {
    paymentMethod = 'Cash';
  } else if (donation.razorpayPaymentId && donation.razorpayPaymentId.startsWith('CHECK-')) {
    paymentMethod = 'Check';
  } else if (donation.razorpayPaymentId && donation.razorpayPaymentId.startsWith('BANK-')) {
    paymentMethod = 'Bank Transfer';
  } else if (donation.razorpayPaymentId && donation.razorpayPaymentId.startsWith('UPI-')) {
    paymentMethod = 'UPI';
  } else if (donation.razorpayOrderId && donation.razorpayOrderId.startsWith('MANUAL-')) {
    paymentMethod = 'Manual Entry';
  }
  
  return {
    id: donationId,
    _id: donation._id.toString(),
    donor: donation.name || 'Anonymous',
    amount: formattedAmount,
    type: donation.type || 'N/A',
    status: donation.status || 'N/A',
    date: formattedDate,
    displayDate,
    email: donation.email || 'N/A',
    phone: donation.phone || 'N/A',
    transactionId: donation.razorpayPaymentId || 'N/A',
    receipt_generated: false, // You might want to track this in your schema
    paymentMethod: paymentMethod,
    
    // Detailed donor information
    donor_details: {
      name: donation.name || 'Anonymous',
      email: donation.email || 'N/A',
      phone: donation.phone || 'N/A',
      district: donation.district || 'N/A',
      location: donation.panchayat || donation.district || 'N/A',
      locationType: donation.locationType || 'district',
      address: donation.address || 'N/A',
      previousDonations: 0, // This would require a separate count query in practice
      totalAmount: '₹0' // This would require a separate sum query in practice
    },
    
    createdAtTimestamp: donation.createdAt ? donation.createdAt.getTime() : Date.now()
  };
}

/**
 * Format an array of donations
 */
function formatDonations(donations) {
  try {
    return donations.map(formatDonation);
  } catch (error) {
    console.error('Error formatting donations:', error);
    return [];
  }
}