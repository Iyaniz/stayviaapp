-- Add the missing December 2, 2025 payment
INSERT INTO payments (
  request_id, 
  landlord_id, 
  tenant_id, 
  post_id, 
  amount, 
  due_date, 
  status,
  created_at,
  updated_at
)
VALUES (
  'a5828d27-d5de-48c2-930f-8ddd8041896f',
  'user_365Jkq3XAgOnoD45XroKKYzzpj8',
  'user_365ztK5xsgqSYiYUcl6fvVe4U2t',
  'a04e5b64-d703-4637-8f6c-f042d70a8924',
  1500,
  '2025-12-02',
  'unpaid',
  NOW(),
  NOW()
);
