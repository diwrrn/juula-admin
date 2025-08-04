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
      const finalApiKey = apiKey === 'from_env' ? process.env.REVENUECAT_SECRET_API_KEY : apiKey;
      
      if (!finalApiKey) {
        return res.status(400).json({ error: "API key is required" });
      }

      // Note: RevenueCat doesn't have a direct "list all subscribers" endpoint
      // This would typically require you to maintain a list of user IDs or use webhooks
      // For now, we'll return a sample response with API status
      res.json({
        message: "RevenueCat API configured successfully",
        note: "Use the test endpoint with specific user IDs to fetch subscriber data",
        apiKeyConfigured: !!finalApiKey
      });
    } catch (error) {
      console.error("RevenueCat API error:", error);
      res.status(500).json({ error: "Failed to fetch subscribers" });
    }
  });

  app.post("/api/revenuecat/subscriber/:userId", async (req, res) => {
    try {
      const { apiKey } = req.body;
      const { userId } = req.params;
      const finalApiKey = apiKey === 'from_env' ? process.env.REVENUECAT_SECRET_API_KEY : apiKey;
      
      if (!finalApiKey) {
        return res.status(400).json({ error: "API key is required" });
      }

      // Fetch subscriber details from RevenueCat
      const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        headers: {
          'Authorization': `Bearer ${finalApiKey}`,
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

  // Grant entitlement to a user
  app.post("/api/revenuecat/grant-entitlement", async (req, res) => {
    try {
      const { apiKey, userId, entitlementId, duration } = req.body;
      const finalApiKey = apiKey === 'from_env' ? process.env.REVENUECAT_SECRET_API_KEY : apiKey;
      
      if (!finalApiKey) {
        return res.status(400).json({ error: "API key is required" });
      }

      if (!userId || !entitlementId) {
        return res.status(400).json({ error: "User ID and entitlement ID are required" });
      }

      // Calculate expiration date (if duration is provided, otherwise make it indefinite)
      let expirationDate = null;
      if (duration && duration !== 'lifetime') {
        const now = new Date();
        const durationDays = parseInt(duration);
        expirationDate = new Date(now.getTime() + (durationDays * 24 * 60 * 60 * 1000)).toISOString();
      }

      // Grant entitlement using RevenueCat API
      const payload = {
        entitlements: {
          [entitlementId]: {
            product_identifier: entitlementId,
            expires_date: expirationDate
          }
        }
      };

      const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}/entitlements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${finalApiKey}`,
          'Content-Type': 'application/json',
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

  // Test subscriber endpoint
  app.post("/api/revenuecat/test-subscriber", async (req, res) => {
    try {
      const { apiKey, userId } = req.body;
      const finalApiKey = apiKey === 'from_env' ? process.env.REVENUECAT_SECRET_API_KEY : apiKey;
      
      if (!finalApiKey) {
        return res.status(400).json({ error: "API key is required" });
      }

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Fetch subscriber details from RevenueCat
      const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        headers: {
          'Authorization': `Bearer ${finalApiKey}`,
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
      console.error("RevenueCat test subscriber error:", error);
      res.status(500).json({ error: "Failed to test subscriber" });
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
      const finalApiKey = apiKey === 'from_env' ? process.env.REVENUECAT_SECRET_API_KEY : apiKey;
      
      if (!finalApiKey || !userId) {
        return res.status(400).json({ error: "API key and user ID are required" });
      }

      console.log(`Testing RevenueCat API for user: ${userId}`);
      
      const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        headers: {
          'Authorization': `Bearer ${finalApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`RevenueCat API error (${response.status}):`, errorText);
        return res.status(response.status).json({ 
          error: errorText, 
          status: response.status,
          userId: userId 
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

  const httpServer = createServer(app);

  return httpServer;
}
