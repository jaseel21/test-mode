export function getPaymentStatus(lastPayment) {
  const now = new Date(); // Current date, e.g., 2025-03-25
  const currentYear = now.getFullYear();
  const previousYear = currentYear - 1;

  // Define payment periods (Season-based) for current and previous year
  const periods = [
    // Previous year seasons
    { name: `Season 1 (${previousYear})`, start: new Date(previousYear, 0, 1), end: new Date(previousYear, 2, 31) }, // Jan 1 - Mar 31
    { name: `Season 2 (${previousYear})`, start: new Date(previousYear, 3, 1), end: new Date(previousYear, 5, 30) }, // Apr 1 - Jun 30
    { name: `Season 3 (${previousYear})`, start: new Date(previousYear, 6, 1), end: new Date(previousYear, 8, 30) }, // Jul 1 - Sep 30
    // Current year seasons
    { name: `Season 1 (${currentYear})`, start: new Date(currentYear, 0, 1), end: new Date(currentYear, 2, 31) }, // Jan 1 - Mar 31
    { name: `Season 2 (${currentYear})`, start: new Date(currentYear, 3, 1), end: new Date(currentYear, 5, 30) }, // Apr 1 - Jun 30
    { name: `Season 3 (${currentYear})`, start: new Date(currentYear, 6, 1), end: new Date(currentYear, 8, 30) }, // Jul 1 - Sep 30
  ];

  // Find the current period based on today's date
  const currentPeriodIndex = periods.findIndex((p) => now >= p.start && now <= p.end);
  const currentPeriod = currentPeriodIndex !== -1 ? periods[currentPeriodIndex] : periods[periods.length - 1];
  const lastPaymentDate = lastPayment ? new Date(lastPayment) : null;

 
  // If no valid payment date, consider it overdue
  if (!lastPaymentDate || isNaN(lastPaymentDate.getTime())) {
    return {
      Status: "Overdue",
      period: currentPeriod.name,
      end: currentPeriod.end,
      message: "No valid payment recorded",
    };
  }

  // Find the period of the last payment
  const paymentPeriodIndex = periods.findIndex(
    (p) => lastPaymentDate >= p.start && lastPaymentDate <= p.end
  );

  // Handle payments outside defined seasons
  if (paymentPeriodIndex === -1) {
    // If payment is after the last defined season (future payment)
    if (lastPaymentDate > periods[periods.length - 1].end) {
      return {
        Status: "Paid",
        period: currentPeriod.name,
        end: currentPeriod.end,
        message: "Payment recorded for a future date",
      };
    }

    // If payment is before the first defined season (e.g., before 2024)
    if (lastPaymentDate < periods[0].start) {
      return {
        Status: "Overdue",
        period: currentPeriod.name,
        end: currentPeriod.end,
        message: "Payment is before all defined seasons",
      };
    }

    // If payment is between seasons (e.g., 25/12/2024, between Season 3 2024 and Season 1 2025)
    const previousPeriodIndex = currentPeriodIndex - 1;
    const previousPeriod = previousPeriodIndex >= 0 ? periods[previousPeriodIndex] : null;

    if (previousPeriod && lastPaymentDate > previousPeriod.end && lastPaymentDate < currentPeriod.start) {
      return {
        Status: "Pending",
        period: currentPeriod.name,
        end: currentPeriod.end,
        message: `Payment pending, last paid after ${previousPeriod.name}`,
      };
    }

    // Fallback for any other case
    return {
      Status: "Overdue",
      period: currentPeriod.name,
      end: currentPeriod.end,
      message: "Payment not within any defined season",
    };
  }

  // Calculate the difference in periods
  const periodDifference = currentPeriodIndex - paymentPeriodIndex;

  if (periodDifference === 0) {
    // Payment is in the current period -> Paid
    return {
      Status: "Paid",
      period: currentPeriod.name,
      end: currentPeriod.end,
      message: "Payment is up to date",
    };
  } else if (periodDifference === 1) {
    // Payment is in the previous period -> Pending
    const previousPeriod = periods[paymentPeriodIndex];
    return {
      Status: "Pending",
      period: currentPeriod.name,
      end: currentPeriod.end,
      message: `Payment pending, last paid in ${previousPeriod.name}`,
    };
  } else {
    // Payment is two or more periods back -> Overdue
    const overduePeriod = periods[paymentPeriodIndex];
    return {
      Status: "Overdue",
      period: currentPeriod.name,
      end: currentPeriod.end,
      overdueSince: overduePeriod.end,
      message: `Payment overdue since ${overduePeriod.name}`,
    };
  }
}



// export function getPaymentStatus(lastPayment) {
//     const now = new Date();
//     console.log("lastPaymentDate",lastPayment);
    
//     const currentYear = now.getFullYear();
//     const periods = [
//       { name: "Season 1", start: new Date(currentYear, 0, 1), end: new Date(currentYear, 2, 31) }, // Jan 1 - Mar 31
//       { name: "Season 2", start: new Date(currentYear, 3, 1), end: new Date(currentYear, 5, 30) }, // Apr 1 - Jun 30
//       { name: "Season 3", start: new Date(currentYear, 6, 1), end: new Date(currentYear, 8, 30) }, // Jul 1 - Sep 30
//     ];
  
//     const currentPeriod = periods.find(p => now >= p.start && now <= p.end) || periods[periods.length - 1];
//     const lastPaymentDate = lastPayment ? new Date(lastPayment) : null;
  
//     if (!lastPaymentDate) {
//       return { status: "Pending", period: currentPeriod.name, end: currentPeriod.end };
//     }
  
//     const isPaidThisPeriod = lastPaymentDate >= currentPeriod.start && lastPaymentDate <= currentPeriod.end;
//     console.log("currentPeriod.start",currentPeriod.start);
//     console.log("currentPeriod.end",currentPeriod.end);
    
    
//     console.log(isPaidThisPeriod);
    
//     return {
//       status: isPaidThisPeriod ? "Paid" : "Pending",
//       period: currentPeriod.name,
//       end: currentPeriod.end,
//     };
//   }