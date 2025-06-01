import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTableSchema, insertReservationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Tables endpoints
  app.get("/api/tables", async (req, res) => {
    try {
      const date = req.query.date as string;
      const hallId = req.query.hallId as string;
      const tables = await storage.getTablesWithReservations(date);
      
      // Filter by hall if specified
      const filteredTables = hallId 
        ? tables.filter(table => table.hallId === hallId)
        : tables;
      
      res.json(filteredTables);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tables" });
    }
  });

  // Get halls list
  app.get("/api/halls", async (req, res) => {
    try {
      const halls = [
        { id: "white", name: "Белый зал", description: "Элегантный основной зал" },
        { id: "bar", name: "Бар зал", description: "Уютная барная зона" },
        { id: "vaulted", name: "Сводчатый зал", description: "Зал с арочными потолками" },
        { id: "fourth", name: "Четвертый зал", description: "Дополнительный зал" },
        { id: "banquet", name: "Банкетный зал", description: "Зал для больших мероприятий" }
      ];
      res.json(halls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch halls" });
    }
  });

  app.get("/api/tables/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const table = await storage.getTable(id);
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch table" });
    }
  });

  app.post("/api/tables", async (req, res) => {
    try {
      const tableData = insertTableSchema.parse(req.body);
      const table = await storage.createTable(tableData);
      res.status(201).json(table);
    } catch (error) {
      res.status(400).json({ error: "Invalid table data" });
    }
  });

  app.patch("/api/tables/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const table = await storage.updateTable(id, updates);
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: "Failed to update table" });
    }
  });

  app.patch("/api/tables/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["available", "reserved", "occupied"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const table = await storage.updateTableStatus(id, status);
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: "Failed to update table status" });
    }
  });

  // Reservations endpoints
  app.get("/api/reservations", async (req, res) => {
    try {
      const date = req.query.date as string;
      const search = req.query.search as string;
      let reservations;
      
      if (date) {
        reservations = await storage.getReservationsByDate(date);
      } else {
        reservations = await storage.getReservations();
      }
      
      // Filter by search query if provided
      if (search && search.trim() !== "") {
        const searchLower = search.toLowerCase().trim();
        reservations = reservations.filter(reservation => 
          reservation.customerName.toLowerCase().includes(searchLower) ||
          reservation.customerPhone.includes(search.trim())
        );
      }
      
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reservations" });
    }
  });

  // Search reservations endpoint
  app.get("/api/reservations/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim() === "") {
        return res.json([]);
      }
      
      const allReservations = await storage.getReservations();
      const allTables = await storage.getTables();
      
      const searchLower = query.toLowerCase().trim();
      const matchingReservations = allReservations.filter(reservation => 
        reservation.customerName.toLowerCase().includes(searchLower) ||
        reservation.customerPhone.includes(query.trim())
      );
      
      // Attach table information to reservations
      const reservationsWithTables = matchingReservations.map(reservation => {
        const table = allTables.find(t => t.id === reservation.tableId);
        return {
          ...reservation,
          table
        };
      });
      
      res.json(reservationsWithTables);
    } catch (error) {
      res.status(500).json({ error: "Failed to search reservations" });
    }
  });

  app.get("/api/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reservation = await storage.getReservation(id);
      if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
      }
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reservation" });
    }
  });

  app.post("/api/reservations", async (req, res) => {
    try {
      const reservationData = insertReservationSchema.parse(req.body);
      
      // Check if table is available
      const table = await storage.getTable(reservationData.tableId);
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      
      // Check for conflicting reservations
      const existingReservations = await storage.getReservationsByTable(reservationData.tableId);
      const conflictingReservation = existingReservations.find(r => 
        r.date === reservationData.date && 
        r.status === "active" &&
        // Simple time conflict check (in real app, would be more sophisticated)
        r.time === reservationData.time
      );
      
      if (conflictingReservation) {
        return res.status(409).json({ error: "Time slot not available" });
      }
      
      const reservation = await storage.createReservation(reservationData);
      res.status(201).json(reservation);
    } catch (error) {
      res.status(400).json({ error: "Invalid reservation data" });
    }
  });

  app.patch("/api/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const reservation = await storage.updateReservation(id, updates);
      if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
      }
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ error: "Failed to update reservation" });
    }
  });

  app.delete("/api/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteReservation(id);
      if (!success) {
        return res.status(404).json({ error: "Reservation not found" });
      }
      res.json({ message: "Reservation deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete reservation" });
    }
  });

  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const tables = await storage.getTables();
      const today = new Date().toISOString().split('T')[0];
      const todayReservations = await storage.getReservationsByDate(today);
      
      const availableTables = tables.filter(t => t.status === "available").length;
      const reservedTables = tables.filter(t => t.status === "reserved").length;
      const occupiedTables = tables.filter(t => t.status === "occupied").length;
      
      res.json({
        availableTables,
        reservedTables,
        occupiedTables,
        todayReservations: todayReservations.length
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
