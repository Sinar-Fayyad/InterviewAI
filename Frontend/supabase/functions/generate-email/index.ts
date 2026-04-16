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
    const { profile, company, jobTitle, jobDescription, recipientName, tone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert career coach who writes compelling job application emails. 
Write a ${tone} email for a job application. The email should:
- Be concise and impactful (3-4 paragraphs max)
- Highlight relevant experience and skills
- Show genuine interest in the company
- Include a clear call to action
- Be ready to copy and send`;

    const userPrompt = `Write an application email for the following:
    
Company: ${company}
Position: ${jobTitle}
${recipientName ? `Recipient: ${recipientName}` : "Recipient: Hiring Manager"}
${jobDescription ? `Job Description: ${jobDescription}` : ""}

Applicant Profile:
- Name: ${profile?.full_name || "Not provided"}
- Summary: ${profile?.summary || "Not provided"}
- Skills: ${Array.isArray(profile?.skills) ? profile.skills.join(", ") : "Not provided"}
- Experience: ${JSON.stringify(profile?.experience || [])}

Generate a professional email that connects the applicant's experience to this role.`;

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
      throw new Error("Failed to generate email");
    }

    const data = await response.json();
    const email = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ email }), {
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
