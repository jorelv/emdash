import { getEmDashCollection } from "emdash";
import { portableTextToMarkdown } from "emdash/client";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const { entries: posts } = await getEmDashCollection("posts", {
      orderBy: { published_at: "desc" },
    });

    const { entries: pages } = await getEmDashCollection("pages");
    const aboutPage = pages.find((p) => p.data.slug === "about");

    let output = "";

    // Header
    output += "# Jorel's Blog — Complete Site Context\n";
    output += "# Generated dynamically. All published posts and pages.\n";
    output += `# Total articles: ${posts.length}\n`;
    output += `# Last updated: ${new Date().toISOString()}\n`;

    // About section
    if (aboutPage) {
      output += "\n---\n";
      output += "# TITLE: About\n";
      output += "## Type: Page\n\n";
      output += cleanMarkdown(portableTextToMarkdown(aboutPage.data.content));
    }

    // All posts
    for (const post of posts) {
      const dateStr = post.data.publishedAt
        ? post.data.publishedAt.toISOString().split("T")[0]
        : "unpublished";

      output += "\n---\n";
      output += `# TITLE: ${post.data.title}\n`;
      output += `## Date: ${dateStr}\n`;
      if (post.data.excerpt) {
        output += `## Excerpt: ${post.data.excerpt}\n`;
      }
      output += "\n";
      output += cleanMarkdown(portableTextToMarkdown(post.data.content));
      output += "\n";
    }

    output += "\n---\n# END OF DOCUMENT\n";

    return new Response(output, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "Access-Control-Allow-Origin": "*",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (error) {
    console.error("[llms-full.txt Error]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

/**
 * Strip token-wasting artifacts from markdown output.
 * - Collapse 3+ newlines into 2
 * - Remove trailing whitespace per line
 * - Strip zero-width and non-breaking spaces
 * - Keep raw quotes (no HTML entity expansion)
 */
function cleanMarkdown(md: string): string {
  return md
    .replace(/\u200B/g, "")           // zero-width spaces
    .replace(/\u00A0/g, " ")          // non-breaking spaces -> regular
    .replace(/&amp;/g, "&")           // unescape HTML entities
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+$/gm, "")         // trailing whitespace per line
    .replace(/\n{3,}/g, "\n\n")       // collapse excessive newlines
    .trim();
}
