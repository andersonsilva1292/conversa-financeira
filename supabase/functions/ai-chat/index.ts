import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub;

    const { messages } = await req.json();

    // Fetch user's recent transactions for context
    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false })
      .limit(20);

    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId);

    const transactionsSummary = transactions?.length
      ? `Transações recentes do usuário:\n${transactions.map(t => `- ${t.description}: R$${t.amount} (${t.category}, ${t.transaction_date})`).join("\n")}`
      : "O usuário ainda não tem transações registradas.";

    const goalsSummary = goals?.length
      ? `Metas do usuário:\n${goals.map(g => `- ${g.title}: R$${g.current_amount}/${g.target_amount}`).join("\n")}`
      : "O usuário ainda não tem metas.";

    const systemPrompt = `Você é um assistente financeiro inteligente chamado FinançaIA. Responda sempre em português brasileiro.

Dados do usuário:
${transactionsSummary}
${goalsSummary}

Suas capacidades:
1. Registrar gastos/receitas - quando o usuário pedir, extraia: descrição, valor, categoria e retorne um JSON no formato:
   {"action": "register_transaction", "data": {"description": "...", "amount": número_negativo_para_gasto_ou_positivo_para_receita, "category": "...", "icon": "emoji"}}
   Categorias válidas: Alimentação, Transporte, Entretenimento, Saúde, Educação, Moradia, Renda, Outros
2. Dar dicas de economia personalizadas
3. Analisar padrões de gastos
4. Ajudar com metas financeiras

IMPORTANTE: Se o usuário pedir para registrar um gasto/receita, SEMPRE inclua o JSON de ação no final da sua resposta, após uma linha "---ACTION---".
Exemplo: "Registrei seu gasto! ✅\n---ACTION---\n{"action": "register_transaction", "data": {...}}"`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    const aiMessage = aiData.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

    // Check if AI wants to register a transaction
    let actionResult = null;
    if (aiMessage.includes("---ACTION---")) {
      const [displayMessage, actionPart] = aiMessage.split("---ACTION---");
      try {
        const action = JSON.parse(actionPart.trim());
        if (action.action === "register_transaction") {
          const { error } = await supabase.from("transactions").insert({
            user_id: userId,
            description: action.data.description,
            amount: action.data.amount,
            category: action.data.category || "Outros",
            icon: action.data.icon || "💰",
            transaction_date: new Date().toISOString().split("T")[0],
          });
          actionResult = error ? { success: false, error: error.message } : { success: true, action: action.action };
        }
        return new Response(
          JSON.stringify({ message: displayMessage.trim(), action: actionResult }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        // JSON parse failed, return full message
      }
    }

    return new Response(
      JSON.stringify({ message: aiMessage, action: null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
