export function createPlugin(options = {}) {
  return {
    id: "emdash-mailgun",
    name: "Mailgun Email Provider",
    version: "1.0.0",
    capabilities: ["network:request"],
    allowedHosts: ["api.mailgun.net"],
    hooks: {
      "email:deliver": async (message, context) => {
        const mailgunApiKey = context.env?.MAILGUN_API_KEY;
        const mailgunDomain = context.env?.MAILGUN_DOMAIN;
        const mailgunFrom = context.env?.MAILGUN_FROM;
        
        if (!mailgunApiKey || !mailgunDomain) {
          throw new Error("Mailgun plugin is active but MAILGUN_API_KEY or MAILGUN_DOMAIN is not set in environment variables");
        }
        
        const endpoint = `https://api.mailgun.net/v3/${mailgunDomain}/messages`;
        const auth = btoa(`api:${mailgunApiKey}`);
        
        const formData = new URLSearchParams();
        formData.append("from", mailgunFrom || message.from || "Jorel <postmaster@sandbox.mailgun.org>");
        formData.append("to", message.to);
        formData.append("subject", message.subject);
        if (message.text) formData.append("text", message.text);
        if (message.html) formData.append("html", message.html);
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: formData.toString()
        });
        
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Mailgun API error (${response.status}): ${errText}`);
        }
      }
    }
  };
}
