/**
 * Test script to verify payment creation logic
 * Run with: bun run test-payment-creation.ts
 */

// Helper function to format date as YYYY-MM-DD using UTC
const formatLocalDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Simulate the payment creation logic
function simulatePaymentCreation(
  rentalStartDate: string,
  rentalEndDate: string,
  paymentDayOfMonth: number,
  monthlyRent: number
) {
  const payments: Array<{ due_date: string; amount: number }> = [];

  // Parse dates as YYYY-MM-DD strings to avoid timezone issues
  const parseDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    return { year, month: month - 1, day }; // month is 0-indexed
  };

  const start = parseDate(rentalStartDate);
  const end = parseDate(rentalEndDate);

  // Create Date objects at noon UTC to avoid timezone edge cases
  const startDate = new Date(Date.UTC(start.year, start.month, start.day, 12, 0, 0));
  const endDate = new Date(Date.UTC(end.year, end.month, end.day, 12, 0, 0));

  console.log('\n🧪 Testing Payment Creation');
  console.log('═══════════════════════════════════════');
  console.log('📅 Rental Start Date:', rentalStartDate);
  console.log('📅 Rental End Date:', rentalEndDate);
  console.log('📅 Payment Day:', paymentDayOfMonth);
  console.log('💰 Monthly Rent:', monthlyRent);
  console.log('═══════════════════════════════════════\n');

  let currentDate = new Date(startDate);
  let iteration = 0;

  while (currentDate <= endDate) {
    iteration++;
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();

    // Create payment date for this month at noon UTC
    let paymentDate = new Date(Date.UTC(year, month, paymentDayOfMonth, 12, 0, 0));

    // If payment day is beyond the last day of month, use last day
    const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0, 12, 0, 0)).getUTCDate();
    if (paymentDayOfMonth > lastDayOfMonth) {
      paymentDate = new Date(Date.UTC(year, month, lastDayOfMonth, 12, 0, 0));
    }

    console.log(`\n🔄 Iteration ${iteration}:`);
    console.log(`   Current Date: ${formatLocalDate(currentDate)}`);
    console.log(`   Payment Date: ${formatLocalDate(paymentDate)}`);
    console.log(`   Start Date: ${formatLocalDate(startDate)}`);
    console.log(`   End Date: ${formatLocalDate(endDate)}`);
    console.log(
      `   Is within range? ${paymentDate >= startDate && paymentDate <= endDate ? '✅ YES' : '❌ NO'}`
    );

    // Only add if payment date is within rental period
    if (paymentDate >= startDate && paymentDate <= endDate) {
      const dueDate = formatLocalDate(paymentDate);
      console.log(`   ➕ Adding payment: ${dueDate}`);
      payments.push({
        due_date: dueDate,
        amount: monthlyRent,
      });
    } else {
      console.log(`   ⏭️  Skipping (outside range)`);
    }

    // Move to next month
    currentDate = new Date(Date.UTC(year, month + 1, 1, 12, 0, 0));
    console.log(`   Next iteration date: ${formatLocalDate(currentDate)}`);
  }

  console.log('\n═══════════════════════════════════════');
  console.log('📊 RESULTS:');
  console.log('═══════════════════════════════════════');
  console.log(`Total Payments Created: ${payments.length}`);
  console.log('Payment Dates:');
  payments.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.due_date} - ₱${p.amount}`);
  });
  console.log('═══════════════════════════════════════\n');

  return payments;
}

// Test Case 1: The problematic rental (Dec 2, 2025 - Jan 2, 2026)
console.log('\n🧪 TEST CASE 1: Dec 2, 2025 - Jan 2, 2026');
console.log('Expected: 2 payments (Dec 2 and Jan 2)');
const test1 = simulatePaymentCreation('2025-12-02', '2026-01-02', 2, 1500);

// Test Case 2: Full month rental
console.log('\n\n🧪 TEST CASE 2: Jan 1, 2026 - Jan 31, 2026');
console.log('Expected: 1 payment (Jan 1)');
const test2 = simulatePaymentCreation('2026-01-01', '2026-01-31', 1, 2000);

// Test Case 3: Multi-month rental
console.log('\n\n🧪 TEST CASE 3: Jan 15, 2026 - Apr 15, 2026');
console.log('Expected: 4 payments (Jan 15, Feb 15, Mar 15, Apr 15)');
const test3 = simulatePaymentCreation('2026-01-15', '2026-04-15', 15, 3000);

// Test Case 4: Same day rental (edge case)
console.log('\n\n🧪 TEST CASE 4: Feb 10, 2026 - Feb 10, 2026');
console.log('Expected: 1 payment (Feb 10)');
const test4 = simulatePaymentCreation('2026-02-10', '2026-02-10', 10, 5000);

// Test Case 5: Payment day beyond rental end
console.log('\n\n🧪 TEST CASE 5: Jan 1, 2026 - Jan 5, 2026 (Payment day: 10)');
console.log('Expected: 0 payments (payment day is after end date)');
const test5 = simulatePaymentCreation('2026-01-01', '2026-01-05', 10, 1500);

// Summary
console.log('\n\n📋 SUMMARY OF ALL TESTS');
console.log('═══════════════════════════════════════');
console.log(`Test 1 (Dec-Jan): ${test1.length} payments ${test1.length === 2 ? '✅' : '❌'}`);
console.log(`Test 2 (Full Month): ${test2.length} payments ${test2.length === 1 ? '✅' : '❌'}`);
console.log(`Test 3 (Multi-month): ${test3.length} payments ${test3.length === 4 ? '✅' : '❌'}`);
console.log(`Test 4 (Same Day): ${test4.length} payments ${test4.length === 1 ? '✅' : '❌'}`);
console.log(`Test 5 (Edge Case): ${test5.length} payments ${test5.length === 0 ? '✅' : '❌'}`);
console.log('═══════════════════════════════════════\n');
