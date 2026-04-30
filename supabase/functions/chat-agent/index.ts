import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history, clientName, metaAdsId, metaBmToken } = await req.json();

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY não configurada no Supabase.');
    }

    // Prepara as mensagens para a OpenAI
    const messages = [
      {
        role: "system",
        content: `Você é um Assistente Especialista em Tráfego Pago (Roman Ads) para o cliente "${clientName}".
Sua função é ajudar o usuário a extrair insights e realizar ações diretas nas contas de anúncio.
Seja sempre muito direto, educado e profissional. Use emojis com parcimônia.
Quando o usuário pedir para pausar ou alterar orçamento de uma campanha, use as ferramentas fornecidas.
ID da conta Meta Ads atual: ${metaAdsId || 'Não conectada'}`
      },
      ...(history || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    // Define as ferramentas (funções que a IA pode executar)
    const tools = [
      {
        type: "function",
        function: {
          name: "pause_adset",
          description: "Pausa um conjunto de anúncios (adset) no Meta Ads. Use apenas se o usuário informar o ID ou o nome muito claro e você souber o ID.",
          parameters: {
            type: "object",
            properties: {
              adset_id: { type: "string", description: "O ID do conjunto de anúncios no Meta Ads" }
            },
            required: ["adset_id"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "update_budget",
          description: "Altera o orçamento diário de um conjunto de anúncios no Meta Ads.",
          parameters: {
            type: "object",
            properties: {
              adset_id: { type: "string", description: "O ID do conjunto de anúncios no Meta Ads" },
              budget: { type: "number", description: "Novo orçamento diário em centavos (exemplo: R$ 50 = 5000)" }
            },
            required: ["adset_id", "budget"]
          }
        }
      }
    ];

    // 1. Faz a primeira chamada para a OpenAI
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // ou gpt-4o
        messages: messages,
        tools: tools,
        tool_choice: "auto"
      })
    });

    const aiData = await aiResponse.json();

    if (aiData.error) {
      throw new Error(`OpenAI Error: ${aiData.error.message}`);
    }

    const responseMessage = aiData.choices[0].message;

    // 2. Verifica se a IA decidiu chamar alguma ferramenta (Function Calling)
    if (responseMessage.tool_calls) {
      let finalReply = "Ação executada com sucesso.";
      
      for (const toolCall of responseMessage.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        const action = toolCall.function.name === 'pause_adset' ? 'pause' : 'update_budget';
        
        // Dispara a requisição para a Edge Function de Meta Ads
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
        
        if (!metaAdsId || !metaBmToken) {
          finalReply = `Não posso executar essa ação pois não há conta do Meta Ads ou Token da BM vinculados ao cliente ${clientName}.`;
          break;
        }

        const metaReq = await fetch(`${supabaseUrl}/functions/v1/meta-ads`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mode: 'update_adset',
            action: action,
            adset_id: args.adset_id,
            budget: args.budget,
            bm_token: metaBmToken,
            ad_account_id: metaAdsId
          })
        });

        const metaRes = await metaReq.json();
        
        if (metaRes.error) {
          finalReply = `Houve um erro ao tentar executar a ação no Meta Ads: ${metaRes.error}`;
        } else {
          finalReply = action === 'pause' 
            ? `✅ Sucesso! O conjunto de anúncios (ID: ${args.adset_id}) foi pausado no Meta Ads.`
            : `✅ Sucesso! O orçamento do conjunto de anúncios (ID: ${args.adset_id}) foi atualizado no Meta Ads.`;
        }
      }

      return new Response(JSON.stringify({ reply: finalReply }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Se a IA apenas respondeu texto normal, retornamos isso
    return new Response(JSON.stringify({ reply: responseMessage.content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Chat Agent error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
