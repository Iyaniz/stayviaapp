// export type Post = {
//   id: string;
//   title: string;
//   description: string | null;
//   created_at: string;
//   upvotes: number;
//   nr_of_comments: number;
//   image: string | null;
//   location: string;
//   beds: string;
//   rating: number;
//   reviews: number;
//   pricePerNight: string;
//   filters: string[];
//   availability: string;
//   type: string;
//   postedAt: string;
//   latitude: number;
//   longitude: number;
//   favorited: boolean;
//   reviewsList: Review[];
//   group: Group;
//   user: User;
// };

// export type Review = {
//   user: string;
//   rating: number;
//   comment: string;
//   avatar: string;
// };

// export type Comment = {
//   id: string;
//   post_id: string;
//   user_id: string;
//   parent_id: string | null;
//   comment: string;
//   created_at: string;
//   upvotes: number;
//   user: User;
//   replies: Comment[];
// };

// export type Group = {
//   id: string;
//   name: string;
//   image: string;
// };

// export type User = {
//   id: string;
//   name: string;
//   image: string | null;
// };


// export type Post = {
//   id: number;
//   user_id: number;
//   title: string;
//   description: string | null;
//   image: string | null;
//   location: string | null;
//   beds: number | null;
//   price_per_night: number;
//   availability: boolean;
//   type: string | null;
//   latitude: number | null;
//   longitude: number | null;
//   filters: string[] | null;   // stored as JSONB array
//   created_at: string;
// };



export type Review = {
  user: string;
  rating: number;
  comment: string;
  avatar: string;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  comment: string;
  created_at: string;
  upvotes: number;
  user: User;
  replies: Comment[];
};

export type Group = {
  id: string;
  name: string;
  image: string;
};

export type User = {
  id: string;
  username: string;
  avatar: string;
  firstname: string;
  lastname: string;
  email: string;
};

/**
 * Post represents a listing as stored in the DB,
 * plus optional/computed properties for UI.
 */
export type Post = {
  /** --- DB columns --- */
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  image: string | null;
  location: string | null;
  beds: number | null;
  price_per_night: number;
  availability: boolean;
  type: string | null;
  latitude: number | null;
  longitude: number | null;
  filters: string[] | null;   // JSONB array in DB
  created_at: string;

  /** --- Derived / frontend-only fields --- */
  rating?: number;
  reviews?: number;
  upvotes?: number;
  favorited?: boolean;
  postedAt?: string;
  group?: Group;
  user?: User;
  reviewsList?: Review[];
};
