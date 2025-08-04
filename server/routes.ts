import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy" });
  });

  // RevenueCat API routes
  app.post("/api/revenuecat/subscribers", async (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ error: "API key is required" });
      }

      // Note: RevenueCat doesn't have a direct "list all subscribers" endpoint
      // This would typically require you to maintain a list of user IDs or use webhooks
      // For now, we'll return a sample response
      res.json([]);
    } catch (error) {
      console.error("RevenueCat API error:", error);
      res.status(500).json({ error: "Failed to fetch subscribers" });
    }
  });

  app.post("/api/revenuecat/subscriber/:userId", async (req, res) => {
    try {
      const { apiKey } = req.body;
      const { userId } = req.params;
      
      if (!apiKey) {
        return res.status(400).json({ error: "API key is required" });
      }

      // Fetch subscriber details from RevenueCat
      const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
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

  app.delete("/api/revenuecat/subscriber/:userId", async (req, res) => {
    try {
      const { apiKey } = req.body;
      const { userId } = req.params;
      
      if (!apiKey) {
        return res.status(400).json({ error: "API key is required" });
      }

      // Delete subscriber from RevenueCat
      const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
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

  // Test endpoint to fetch a specific subscriber
  app.post("/api/revenuecat/test-subscriber", async (req, res) => {
    try {
      const { apiKey, userId } = req.body;
      
      if (!apiKey || !userId) {
        return res.status(400).json({ error: "API key and user ID are required" });
      }

      const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: errorText, status: response.status });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("RevenueCat API error:", error);
      res.status(500).json({ error: "Failed to test subscriber API" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
