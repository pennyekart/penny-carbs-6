-- Allow delivery staff to accept unassigned orders (set assigned_delivery_id on pending orders)
CREATE POLICY "Delivery staff can accept available orders"
ON public.orders
FOR UPDATE
USING (
  is_delivery_staff(auth.uid())
  AND delivery_status = 'pending'
  AND assigned_delivery_id IS NULL
  AND cook_status = 'ready'
  AND service_type IN ('cloud_kitchen', 'homemade')
)
WITH CHECK (
  is_delivery_staff(auth.uid())
  AND assigned_delivery_id = auth.uid()
);