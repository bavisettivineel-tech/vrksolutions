import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY is not configured");
    }

    // Search for official notes PDFs using multiple targeted queries
    const searchQueries = [
      `${query} notes PDF download filetype:pdf`,
      `${query} study material official notes PDF`,
      `${query} lecture notes PDF free download`,
    ];

    const allResults: any[] = [];

    for (const searchQuery of searchQueries) {
      try {
        console.log("Searching:", searchQuery);
        const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery,
            limit: 10,
          }),
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          const results = searchData.data || [];
          allResults.push(...results);
        }
      } catch (e) {
        console.error("Search error:", e);
      }
    }

    // Deduplicate by URL and prioritize PDFs
    const seen = new Set<string>();
    const uniqueResults: any[] = [];
    
    for (const r of allResults) {
      if (r.url && !seen.has(r.url)) {
        seen.add(r.url);
        uniqueResults.push(r);
      }
    }

    // Separate PDF links and web resource links
    const pdfResults = uniqueResults.filter(r => 
      r.url?.toLowerCase().endsWith(".pdf") || 
      r.url?.toLowerCase().includes("/pdf/") ||
      r.url?.toLowerCase().includes("pdf") ||
      r.title?.toLowerCase().includes("pdf")
    );

    const webResults = uniqueResults.filter(r => 
      !r.url?.toLowerCase().endsWith(".pdf") &&
      !r.url?.toLowerCase().includes("/pdf/")
    );

    // Sort: direct PDF links first, then by relevance
    const sortedPDFs = pdfResults.sort((a, b) => {
      const aIsPDF = a.url?.toLowerCase().endsWith(".pdf") ? 0 : 1;
      const bIsPDF = b.url?.toLowerCase().endsWith(".pdf") ? 0 : 1;
      return aIsPDF - bIsPDF;
    });

    const response = {
      query,
      pdfResults: sortedPDFs.slice(0, 15).map((r: any) => ({
        title: r.title || "Untitled",
        url: r.url,
        description: r.description || "",
        isDirectPDF: r.url?.toLowerCase().endsWith(".pdf"),
      })),
      webResults: webResults.slice(0, 10).map((r: any) => ({
        title: r.title || "Untitled",
        url: r.url,
        description: r.description || "",
      })),
      totalFound: uniqueResults.length,
    };

    console.log(`Found ${sortedPDFs.length} PDF results, ${webResults.length} web results`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI notes error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
