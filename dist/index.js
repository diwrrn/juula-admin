// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.json({ status: "healthy" });
  });
  app2.post("/api/revenuecat/subscribers", async (req, res) => {
    try {
      const { apiKey, userIds } = req.body;
      const finalApiKey = apiKey === "from_env" ? process.env.REVENUECAT_SECRET_API_KEY : apiKey;
      if (!finalApiKey) {
        return res.status(400).json({ error: "API key is required" });
      }
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.json({
          message: "RevenueCat API configured successfully",
          note: "Provide user IDs to fetch subscriber data",
          apiKeyConfigured: !!finalApiKey,
          subscribers: []
        });
      }
      console.log(`Fetching data for ${userIds.length} users...`);
      const subscribers = [];
      for (const userId of userIds) {
        try {
          const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
            headers: {
              "Authorization": `Bearer ${finalApiKey}`,
              "Content-Type": "application/json"
            }
          });
          if (response.ok) {
            const data = await response.json();
            subscribers.push(data);
            console.log(`\u2713 Successfully fetched data for user: ${userId}`);
          } else {
            console.log(`\u2717 Failed to fetch data for user: ${userId} (${response.status})`);
          }
        } catch (error) {
          console.log(`\u2717 Error fetching data for user: ${userId}`, error);
        }
      }
      res.json({
        message: `Successfully fetched ${subscribers.length} of ${userIds.length} subscribers`,
        subscribers,
        total: subscribers.length
      });
    } catch (error) {
      console.error("RevenueCat API error:", error);
      res.status(500).json({ error: "Failed to fetch subscribers" });
    }
  });
  app2.post("/api/revenuecat/subscriber/:userId", async (req, res) => {
    try {
      const { apiKey } = req.body;
      const { userId } = req.params;
      const finalApiKey = apiKey === "from_env" ? process.env.REVENUECAT_SECRET_API_KEY : apiKey;
      if (!finalApiKey) {
        return res.status(400).json({ error: "API key is required" });
      }
      const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        headers: {
          "Authorization": `Bearer ${finalApiKey}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: errorText });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("RevenueCat API error:", error);
      res.status(500).json({ error: "Failed to fetch subscriber details" });
    }
  });
  app2.post("/api/revenuecat/grant-entitlement", async (req, res) => {
    try {
      const { apiKey, userId, entitlementId, duration } = req.body;
      const finalApiKey = apiKey === "from_env" ? process.env.REVENUECAT_SECRET_API_KEY : apiKey;
      if (!finalApiKey) {
        return res.status(400).json({ error: "API key is required" });
      }
      if (!userId || !entitlementId) {
        return res.status(400).json({ error: "User ID and entitlement ID are required" });
      }
      let durationValue;
      if (duration === "lifetime" || !duration) {
        durationValue = "lifetime";
      } else {
        const durationDays = parseInt(duration);
        if (durationDays === 30) durationValue = "monthly";
        else if (durationDays === 60) durationValue = "two_month";
        else if (durationDays === 90) durationValue = "three_month";
        else if (durationDays === 365) durationValue = "yearly";
        else durationValue = `P${durationDays}D`;
      }
      const payload = {
        duration: durationValue
      };
      console.log(`Granting entitlement "${entitlementId}" to user "${userId}" with duration "${durationValue}"`);
      const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}/entitlements/${encodeURIComponent(entitlementId)}/promotional`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${finalApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: errorText });
      }
      const data = await response.json();
      res.json({
        success: true,
        message: `Entitlement "${entitlementId}" granted to user "${userId}"`,
        data
      });
    } catch (error) {
      console.error("RevenueCat grant entitlement error:", error);
      res.status(500).json({ error: "Failed to grant entitlement" });
    }
  });
  app2.post("/api/revenuecat/test-subscriber", async (req, res) => {
    try {
      const { apiKey, userId } = req.body;
      const finalApiKey = apiKey === "from_env" ? process.env.REVENUECAT_SECRET_API_KEY : apiKey;
      if (!finalApiKey) {
        return res.status(400).json({ error: "API key is required" });
      }
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        headers: {
          "Authorization": `Bearer ${finalApiKey}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: errorText });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("RevenueCat test subscriber error:", error);
      res.status(500).json({ error: "Failed to test subscriber" });
    }
  });
  app2.delete("/api/revenuecat/subscriber/:userId", async (req, res) => {
    try {
      const { apiKey } = req.body;
      const { userId } = req.params;
      if (!apiKey) {
        return res.status(400).json({ error: "API key is required" });
      }
      const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: errorText });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("RevenueCat API error:", error);
      res.status(500).json({ error: "Failed to delete subscriber" });
    }
  });
  app2.post("/api/revenuecat/test-subscriber", async (req, res) => {
    try {
      const { apiKey, userId } = req.body;
      const finalApiKey = apiKey === "from_env" ? process.env.REVENUECAT_SECRET_API_KEY : apiKey;
      if (!finalApiKey || !userId) {
        return res.status(400).json({ error: "API key and user ID are required" });
      }
      console.log(`Testing RevenueCat API for user: ${userId}`);
      const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        headers: {
          "Authorization": `Bearer ${finalApiKey}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`RevenueCat API error (${response.status}):`, errorText);
        return res.status(response.status).json({
          error: errorText,
          status: response.status,
          userId
        });
      }
      const data = await response.json();
      console.log(`Successfully fetched data for user: ${userId}`);
      res.json(data);
    } catch (error) {
      console.error("RevenueCat API error:", error);
      res.status(500).json({ error: "Failed to test subscriber API" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
