CREATE TABLE public.card_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  person_name TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.card_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own card transactions" ON public.card_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own card transactions" ON public.card_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own card transactions" ON public.card_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own card transactions" ON public.card_transactions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_card_transactions_updated_at
BEFORE UPDATE ON public.card_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_card_transactions_user ON public.card_transactions(user_id, transaction_date DESC);