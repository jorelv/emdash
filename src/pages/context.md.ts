import { getEmDashCollection } from "emdash";
import { portableTextToMarkdown } from "emdash/client";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    // 1. Fetch all published posts ordered by publication date (descending)
    const { entries: posts } = await getEmDashCollection("posts", {
      orderBy: { published_at: "desc" }
    });

    // 2. Fetch the About page
    const { entries: pages } = await getEmDashCollection("pages");
    const aboutPage = pages.find(p => p.data.slug === "about");

    // 3. Build the combined markdown text
    let markdown = `# Site Context: Jorel's Blog\n\n`;
    markdown += `This document consolidates Jorel's profile and all published posts into a single text format. It is optimized to be read by Large Language Models (LLMs) like Gemini, ChatGPT, and Claude to facilitate search, questions, and discussion.\n\n`;

    // Table of Contents
    markdown += `---\n\n## Table of Contents\n\n`;
    if (aboutPage) {
      markdown += `- [About](#about)\n`;
    }
    markdown += `- [Articles](#articles)\n`;
    for (const post of posts) {
      markdown += `  - [${post.data.title}](#${post.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")})\n`;
    }
    markdown += `\n---\n\n`;

    // Render About Page
    if (aboutPage) {
      const aboutMd = portableTextToMarkdown(aboutPage.data.content);
      markdown += `## About\n\n${aboutMd}\n\n---\n\n`;
    }

    // Render Articles Header
    markdown += `## Articles\n\n`;

    // Render each post
    for (const post of posts) {
      const postMd = portableTextToMarkdown(post.data.content);
      const dateStr = post.data.publishedAt
        ? post.data.publishedAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
        : "Unpublished";

      markdown += `### ${post.data.title}\n`;
      markdown += `*Published on: ${dateStr}*\n`;
      if (post.data.excerpt) {
        markdown += `*Excerpt: ${post.data.excerpt}*\n`;
      }
      markdown += `\n${postMd}\n\n---\n\n`;
    }

    markdown += `*End of Document. Generated dynamically on Jorel's Blog.*`;

    return new Response(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("[Context Endpoint Error]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
