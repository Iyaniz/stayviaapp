import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Tables } from '@/types/database.types';

type Payment = Tables<'payments'>;

export const paymentService = {
  /**
   * Create payments for an entire rental period
   * Called when a rental is confirmed
   */
  async createPaymentsForRental(
    requestId: string,
    landlordId: string,
    tenantId: string,
    postId: string,
    rentalStartDate: string,
    rentalEndDate: string,
    monthlyRent: number,
    paymentDayOfMonth: number,
    supabase: SupabaseClient<Database>
  ) {
    const payments: Partial<Payment>[] = [];
    const startDate = new Date(rentalStartDate);
    const endDate = new Date(rentalEndDate);

    // Generate payment dates for each month
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Create payment date for this month
      let paymentDate = new Date(year, month, paymentDayOfMonth);

      // If payment day is beyond the last day of month, use last day
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      if (paymentDayOfMonth > lastDayOfMonth) {
        paymentDate = new Date(year, month, lastDayOfMonth);
      }

      // Only add if payment date is within rental period
      if (paymentDate >= startDate && paymentDate <= endDate) {
        payments.push({
          request_id: requestId,
          landlord_id: landlordId,
          tenant_id: tenantId,
          post_id: postId,
          amount: monthlyRent,
          due_date: paymentDate.toISOString().split('T')[0],
          status: 'unpaid',
        });
      }

      // Move to next month
      currentDate = new Date(year, month + 1, 1);
    }

    if (payments.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('payments')
      .insert(payments as Payment[])
      .select();

    if (error) {
      console.error('Error creating payments for rental:', error);
      throw error;
    }
    return data ?? [];
  },

  /**
   * Get all payments for a landlord in a specific month
   */
  async getPaymentsByLandlord(
    landlordId: string,
    month: number,
    year: number,
    supabase: SupabaseClient<Database>
  ) {
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('payments')
      .select(
        `
        *,
        tenant:tenant_id(id, firstname, lastname, avatar, email),
        post:post_id(id, title, location),
        request:request_id(id, rental_start_date, rental_end_date)
      `
      )
      .eq('landlord_id', landlordId)
      .gte('due_date', startDate)
      .lte('due_date', endDate)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Get all payments for a tenant
   */
  async getPaymentsByTenant(tenantId: string, supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
      .from('payments')
      .select(
        `
        *,
        landlord:landlord_id(id, firstname, lastname, avatar),
        post:post_id(id, title, location)
      `
      )
      .eq('tenant_id', tenantId)
      .order('due_date', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Update payment status and details
   */
  async updatePaymentStatus(
    paymentId: string,
    status: string,
    paymentDate?: string,
    notes?: string,
    paymentMethod?: string,
    supabase?: SupabaseClient<Database>
  ) {
    if (!supabase) throw new Error('Supabase client required');

    const updateData: Partial<Payment> = {
      status: status as any,
      updated_at: new Date().toISOString(),
    };

    if (paymentDate) {
      updateData.payment_date = paymentDate;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (paymentMethod) {
      updateData.payment_method = paymentMethod;
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get payment statistics for landlord
   */
  async getPaymentStats(landlordId: string, supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
      .from('payments')
      .select('status, amount')
      .eq('landlord_id', landlordId);

    if (error) throw error;

    const payments = data ?? [];
    const stats = {
      total_due: 0,
      total_paid: 0,
      total_overdue: 0,
      total_partial: 0,
      payment_count: payments.length,
      paid_count: 0,
      unpaid_count: 0,
      overdue_count: 0,
      partial_count: 0,
    };

    const now = new Date();

    for (const payment of payments) {
      const amount = payment.amount || 0;
      switch (payment.status) {
        case 'paid':
          stats.total_paid += amount;
          stats.paid_count += 1;
          break;
        case 'unpaid':
          stats.total_due += amount;
          stats.unpaid_count += 1;
          break;
        case 'overdue':
          stats.total_overdue += amount;
          stats.overdue_count += 1;
          break;
        case 'partial':
          stats.total_partial += amount;
          stats.partial_count += 1;
          break;
      }
    }

    return stats;
  },

  /**
   * Get overdue payments for landlord
   */
  async getOverduePayments(landlordId: string, supabase: SupabaseClient<Database>) {
    const now = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('payments')
      .select(
        `
        *,
        tenant:tenant_id(id, firstname, lastname, avatar, email),
        post:post_id(id, title, location)
      `
      )
      .eq('landlord_id', landlordId)
      .eq('status', 'unpaid')
      .lt('due_date', now)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Get all payments for a rental request
   */
  async getPaymentsByRequest(requestId: string, supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('request_id', requestId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Delete a payment (e.g., if rental is cancelled)
   */
  async deletePayment(paymentId: string, supabase: SupabaseClient<Database>) {
    const { error } = await supabase.from('payments').delete().eq('id', paymentId);

    if (error) throw error;
  },

  /**
   * Delete all payments for a rental
   */
  async deletePaymentsForRental(requestId: string, supabase: SupabaseClient<Database>) {
    const { error } = await supabase.from('payments').delete().eq('request_id', requestId);

    if (error) throw error;
  },

  /**
   * Mark all unpaid future payments as cancelled
   */
  async cancelFuturePayments(requestId: string, supabase: SupabaseClient<Database>) {
    const now = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('payments')
      .update({ status: 'cancelled' })
      .eq('request_id', requestId)
      .eq('status', 'unpaid')
      .gt('due_date', now);

    if (error) throw error;
  },

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string, supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
      .from('payments')
      .select(
        `
        *,
        tenant:tenant_id(id, firstname, lastname, avatar, email),
        landlord:landlord_id(id, firstname, lastname, avatar),
        post:post_id(id, title, location),
        request:request_id(id, rental_start_date, rental_end_date)
      `
      )
      .eq('id', paymentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ?? null;
  },
};
