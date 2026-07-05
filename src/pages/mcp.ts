import emdashMiddleware from "emdash/middleware";
import { POST as mcpPost } from "../../node_modules/emdash/dist/astro/routes/api/mcp.mjs";
import type { APIRoute } from "astro";

export const prerender = false;

const PUBLIC_TOOLS = new Set([
  "content_list",
  "content_get",
  "search",
  "taxonomy_list",
  "taxonomy_list_terms",
  "menu_list",
  "menu_get"
]);

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
};

export const GET: APIRoute = async (context) => {
  const mockContext = new Proxy(context, {
    get(target, prop) {
      if (prop === "url") {
        const originalUrl = target.url;
        return new Proxy(originalUrl, {
          get(urlTarget, urlProp) {
            if (urlProp === "pathname") {
              return "/_emdash/api/mcp";
            }
            return urlTarget[urlProp as any];
          }
        });
      }
      return target[prop as any];
    }
  });

  return emdashMiddleware(mockContext, async () => {
    return new Response(JSON.stringify({
      status: "online",
      description: "Public Unauthenticated Read-Only MCP Gateway for EmDash CMS.",
      usage: "Configure your MCP client to make POST requests to this endpoint.",
      supportedTools: Array.from(PUBLIC_TOOLS)
    }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  });
};

export const POST: APIRoute = async (context) => {
  const mockContext = new Proxy(context, {
    get(target, prop) {
      if (prop === "url") {
        const originalUrl = target.url;
        return new Proxy(originalUrl, {
          get(urlTarget, urlProp) {
            if (urlProp === "pathname") {
              return "/_emdash/api/mcp";
            }
            return urlTarget[urlProp as any];
          }
        });
      }
      return target[prop as any];
    }
  });

  return emdashMiddleware(mockContext, async () => {
    const { request } = context;

    let isListTools = false;
    try {
      const reqJson = await request.clone().json();
      if (reqJson && reqJson.method === "tools/list") {
        isListTools = true;
      }
    } catch {}

    try {
      const customLocals = {
        ...context.locals,
        user: {
          id: "guest",
          email: "guest@emdash.public",
          displayName: "Guest",
          role: 10
        },
        tokenScopes: undefined
      };

      const response = await mcpPost({
        ...context,
        locals: customLocals
      });

      if (isListTools && response.ok) {
        const text = await response.text();
        const match = text.match(/data:\s*({.*})/);
        if (match) {
          try {
            const json = JSON.parse(match[1]);
            if (json.result && Array.isArray(json.result.tools)) {
              json.result.tools = json.result.tools.filter(t => PUBLIC_TOOLS.has(t.name));
            }
            const newText = `event: message\ndata: ${JSON.stringify(json)}\n\n`;
            return new Response(newText, {
              status: response.status,
              headers: {
                ...Object.fromEntries(response.headers.entries()),
                "Access-Control-Allow-Origin": "*"
              }
            });
          } catch (err) {
            console.error("Failed to filter public tools:", err);
          }
        }
      }

      const corsResponse = new Response(response.body, response);
      corsResponse.headers.set("Access-Control-Allow-Origin", "*");
      return corsResponse;
    } catch (error) {
      console.error("[Public MCP Error]", error);
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error"
        },
        id: null
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  });
};
