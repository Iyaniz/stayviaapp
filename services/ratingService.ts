import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Tables } from '@/types/database.types';

type Rating = Tables<'ratings'>;

export const ratingService = {
  /**
   * Create a new rating
   */
  async createRating(
    rater_id: string,
    ratee_id: string,
    score: number,
    supabase: SupabaseClient<Database>,
    post_id?: string,
    comment?: string
  ) {
    const { data, error } = await supabase
      .from('ratings')
      .insert({
        rater_id,
        ratee_id,
        score,
        post_id: post_id || null,
        comment: comment || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  },

  /**
   * Get ratings for a user (as ratee)
   */
  async getUserRatings(user_id: string, supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
      .from('ratings')
      .select(
        `
        *,
        rater:rater_id (id, firstname, lastname, avatar, account_type)
      `
      )
      .eq('ratee_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get average rating for a user
   */
  async getUserAverageRating(user_id: string, supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase.from('ratings').select('score').eq('ratee_id', user_id);

    if (error) throw error;

    if (!data || data.length === 0) {
      return null;
    }

    const average = data.reduce((sum, rating) => sum + rating.score, 0) / data.length;
    return {
      average: Math.round(average * 10) / 10,
      count: data.length,
    };
  },

  /**
   * Get ratings given by a user
   */
  async getRatingsGiven(user_id: string, supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
      .from('ratings')
      .select(
        `
        *,
        ratee:ratee_id (id, firstname, lastname, avatar, account_type)
      `
      )
      .eq('rater_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Update a rating
   */
  async updateRating(
    rating_id: string,
    supabase: SupabaseClient<Database>,
    score?: number,
    comment?: string
  ) {
    const updateData: Partial<Rating> = {};
    if (score !== undefined) updateData.score = score;
    if (comment !== undefined) updateData.comment = comment;

    const { data, error } = await supabase
      .from('ratings')
      .update(updateData)
      .eq('id', rating_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a rating
   */
  async deleteRating(rating_id: string, supabase: SupabaseClient<Database>) {
    const { error } = await supabase.from('ratings').delete().eq('id', rating_id);

    if (error) throw error;
  },

  /**
   * Get rating between specific users for a post
   */
  async getRatingBetweenUsers(
    rater_id: string,
    ratee_id: string,
    supabase: SupabaseClient<Database>,
    post_id?: string
  ) {
    let query = supabase.from('ratings').select().eq('rater_id', rater_id).eq('ratee_id', ratee_id);

    if (post_id) {
      query = query.eq('post_id', post_id);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  /**
   * Get ratings for a post
   */
  async getPostRatings(post_id: string, supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
      .from('ratings')
      .select(
        `
        *,
        rater:rater_id (id, firstname, lastname, avatar, account_type)
      `
      )
      .eq('post_id', post_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
