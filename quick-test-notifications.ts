#!/usr/bin/env npx ts-node
/**
 * Quick Notification Test
 * Creates test data and shows console logs for debugging
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const LANDLORD_ID = 'user_365Jkq3XAgOnoD45XroKKYzzpj8';
const TENANT_ID = 'user_365ztK5xsgqSYiYUcl6fvVe4U2t';

async function createTestData() {
  console.log('\n📝 Creating test data for notifications...\n');

  try {
    // 1. Create post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: LANDLORD_ID,
        title: 'Test Property for Notifications',
        description: 'Testing notification system',
        location: 'Test City',
        price_per_night: 50,
        beds: '2 Bedrooms',
        availability: true,
      })
      .select()
      .single();

    if (postError) throw postError;
    console.log('✅ Post created:', post.id);

    // 2. Create rental request with start date 1 minute ago
    const oneMinuteAgo = new Date();
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

    const checkOut = new Date(oneMinuteAgo);
    checkOut.setDate(checkOut.getDate() + 3);

    const { data: request, error: requestError } = await supabase
      .from('requests')
      .insert({
        post_id: post.id,
        user_id: TENANT_ID,
        rental_start_date: oneMinuteAgo.toISOString(),
        rental_end_date: checkOut.toISOString(),
        confirmed: true,
        rating_notif_sent: false,
      })
      .select()
      .single();

    if (requestError) throw requestError;
    console.log('✅ Rental request created:', request.id);
    console.log('   Start date set to 1 minute ago (for testing)');

    // 3. Create payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        request_id: request.id,
        landlord_id: LANDLORD_ID,
        tenant_id: TENANT_ID,
        post_id: post.id,
        amount: 150,
        due_date: new Date().toISOString().split('T')[0],
        status: 'unpaid',
      })
      .select()
      .single();

    if (paymentError) throw paymentError;
    console.log('✅ Payment created:', payment.id);

    console.log('\n🎯 Test data ready!\n');
    console.log('📱 Now open the app as tenant (gian.legaspi.coc@phinmaed.com)');
    console.log('   Watch the Xcode console for debug logs like:');
    console.log('   🔍 Checking for rentals due for rating...');
    console.log('   📊 Found X rentals due for rating');
    console.log('   📲 Sending notification for: Test Property...');
    console.log('\n   If you see these logs, the notification hook is running!');
    console.log('   The notification should appear in the notification center.\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestData().then(() => process.exit(0));
