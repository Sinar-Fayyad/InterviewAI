import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription, companyName, jobTitle } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating questions for:", { companyName, jobTitle });

    const systemPrompt = `You are an expert interview coach. Generate interview questions based on the job description provided.
Return a JSON object with an array called "questions". Each question should have:
- id: number (1, 2, 3, etc.)
- category: string ("Technical", "Behavioral", "Situational", "Cultural Fit")
- difficulty: string ("Easy", "Medium", "Hard")
- question: string (the interview question)
- tips: string (brief advice on how to answer)
- sampleAnswer: string (a model answer framework)

Generate 8-10 diverse questions covering different categories.`;

    const userPrompt = `Generate interview questions for:
Company: ${companyName || "Not specified"}
Job Title: ${jobTitle || "Not specified"}
Job Description: ${jobDescription || "Not provided"}

Return valid JSON only with the questions array.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate questions");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("AI response received, parsing JSON...");
    
    // Parse the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", content);
      throw new Error("Invalid response format");
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    console.log("Generated", parsed.questions?.length || 0, "questions");

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
