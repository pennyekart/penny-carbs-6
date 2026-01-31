-- Add cook assignment to order items for per-dish cook assignment
ALTER TABLE public.order_items 
ADD COLUMN assigned_cook_id uuid REFERENCES public.cooks(id);

-- Add index for better query performance
CREATE INDEX idx_order_items_assigned_cook ON public.order_items(assigned_cook_id);

-- Comment explaining the column
COMMENT ON COLUMN public.order_items.assigned_cook_id IS 'The cook assigned to prepare this specific dish';