export const OPENAPI_SPEC = {
  openapi: "3.0.3",
  info: {
    title: "ShopSense AI Platform API",
    version: "4.0.0",
    description: "Enterprise Multi-Vendor E-Commerce Intelligence API specification for Milestone 4 (Weeks 7-8). Covers Marketplace Foundation, ML Demand Forecasting, Customer Segmentation, BI Reporting, and Autonomous AI Agent Store Workflows.",
    contact: {
      name: "ShopSense Engineering & Architecture",
      url: "https://github.com/shopsense/platform"
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT"
    }
  },
  servers: [
    {
      url: "/",
      description: "Current Application Host (Local / Cloud Run / Docker)"
    }
  ],
  tags: [
    { name: "System & Health", description: "Healthcheck, runtime performance, and telemetry." },
    { name: "Vendor Management", description: "Vendor onboarding, authentication, profiles, and vendor-level analytics." },
    { name: "Product Catalog", description: "Product inventory, prices, costs, and stock levels." },
    { name: "Inventory & Forecasting", description: "Stock velocity, reorder thresholds, and ML-assisted demand predictions." },
    { name: "Customer Analytics", description: "Customer RFM segmentation, lifetime value, and cohort behavioral analysis." },
    { name: "AI Agent Workflow", description: "Autonomous AI store audits, strategic advice generator, and proactive email dispatch." },
    { name: "BI Reporting", description: "Executive summary metrics, revenue time-series, channel breakdown, and benchmarks." }
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["System & Health"],
        summary: "System Health & Configuration Check",
        description: "Returns server operational health status, timestamp, and Gemini API readiness.",
        responses: {
          "200": {
            description: "System is healthy and responsive.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    hasGeminiKey: { type: "boolean", example: true },
                    timestamp: { type: "string", format: "date-time" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/admin/overview": {
      get: {
        tags: ["System & Health"],
        summary: "Admin System Telemetry & Performance",
        description: "Returns server memory usage, uptime, database entity counts, and API response latency.",
        responses: {
          "200": {
            description: "Server runtime overview."
          }
        }
      }
    },
    "/api/vendors": {
      get: {
        tags: ["Vendor Management"],
        summary: "List All Registered Vendors",
        description: "Retrieves complete directory of registered marketplace vendors.",
        responses: {
          "200": {
            description: "Array of vendor profiles."
          }
        }
      }
    },
    "/api/vendors/register": {
      post: {
        tags: ["Vendor Management"],
        summary: "Register a New Marketplace Vendor",
        description: "Registers a new merchant with password hashing and business profile.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "phone", "businessName", "password"],
                properties: {
                  name: { type: "string", example: "Sarah Connor" },
                  email: { type: "string", format: "email", example: "sarah@cybertech.com" },
                  phone: { type: "string", example: "+1 555-019-2834" },
                  businessName: { type: "string", example: "CyberTech Acoustics" },
                  companyName: { type: "string", example: "CyberTech International LLC" },
                  password: { type: "string", format: "password", example: "SecurePass123!" },
                  bio: { type: "string", example: "High-end studio grade headphones manufacturer." }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Vendor registered successfully." },
          "400": { description: "Invalid input or email already in use." }
        }
      }
    },
    "/api/vendors/{id}/analytics": {
      get: {
        tags: ["Vendor Management"],
        summary: "Vendor Performance & Sales Analytics",
        description: "Aggregates revenue, unit volume, inventory value, and top products for a given vendor ID.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "vendor-001"
          }
        ],
        responses: {
          "200": { description: "Vendor analytics aggregated." },
          "404": { description: "Vendor not found." }
        }
      }
    },
    "/api/products": {
      get: {
        tags: ["Product Catalog"],
        summary: "Fetch Catalog Products",
        description: "Returns all products with current stock, price, cost, supplier, and ratings.",
        responses: {
          "200": { description: "List of products." }
        }
      },
      post: {
        tags: ["Product Catalog"],
        summary: "Create New Product",
        description: "Adds a product item to inventory with stock validation.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "category", "price", "stock"],
                properties: {
                  name: { type: "string", example: "Wireless Bluetooth Speaker" },
                  category: { type: "string", example: "Electronics" },
                  price: { type: "number", example: 89.99 },
                  cost: { type: "number", example: 38.00 },
                  stock: { type: "integer", example: 45 },
                  minThreshold: { type: "integer", example: 12 },
                  leadTimeDays: { type: "integer", example: 10 },
                  supplier: { type: "string", example: "AeroAcoustics Global" }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Product created." },
          "400": { description: "Validation error." }
        }
      }
    },
    "/api/products/{id}": {
      put: {
        tags: ["Product Catalog"],
        summary: "Update Product or Inventory Stock",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  price: { type: "number" },
                  stock: { type: "integer" },
                  minThreshold: { type: "integer" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Product updated." },
          "404": { description: "Product not found." }
        }
      }
    },
    "/api/ai/forecast-insights": {
      post: {
        tags: ["Inventory & Forecasting"],
        summary: "ML & AI Demand Forecasting Insights",
        description: "Analyzes historical time-series velocity and projected trend to provide inventory recommendations.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["productName", "currentStock"],
                properties: {
                  productName: { type: "string", example: "AeroPulse Pro Headphones" },
                  currentStock: { type: "integer", example: 8 },
                  minThreshold: { type: "integer", example: 20 },
                  historicalSales: { type: "array", items: { type: "number" }, example: [45, 52, 60, 58, 64, 70] },
                  forecastedSales: { type: "array", items: { type: "number" }, example: [75, 82, 90] }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Forecast evaluation generated." }
        }
      }
    },
    "/api/agent/vendor-audit": {
      post: {
        tags: ["AI Agent Workflow"],
        summary: "Autonomous Weekly Store Audit (LangGraph / Agentic Loop)",
        description: "Executes multi-step autonomous agent analysis evaluating vendor catalog stock velocity, demand decline, profit margins, and generates strategic advisory actions.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["vendorId"],
                properties: {
                  vendorId: { type: "string", example: "vendor-001" },
                  lookbackDays: { type: "integer", example: 30 },
                  urgencyThreshold: { type: "string", enum: ["all", "high_only"], example: "all" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Store audit and proactive strategic actions generated.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    vendorId: { type: "string" },
                    vendorName: { type: "string" },
                    auditDate: { type: "string", format: "date-time" },
                    healthScore: { type: "number", example: 82 },
                    identifiedRisks: { type: "array", items: { type: "object" } },
                    recommendations: { type: "array", items: { type: "object" } },
                    emailDraft: { type: "object" },
                    agentTrace: { type: "array", items: { type: "object" } }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/agent/dispatch-email": {
      post: {
        tags: ["AI Agent Workflow"],
        summary: "Proactively Dispatch Strategic Advisory Email",
        description: "Sends or simulates proactive strategic email to vendor inbox with actionable discount/reorder links.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["vendorId", "subject", "htmlContent"],
                properties: {
                  vendorId: { type: "string", example: "vendor-001" },
                  toEmail: { type: "string", example: "alex.thorne@aeroacoustics.com" },
                  subject: { type: "string", example: "Weekly Autonomous Store Advisory: Action Recommended on 2 SKUs" },
                  htmlContent: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Email queued and dispatched." }
        }
      }
    },
    "/api/agent/execute-action": {
      post: {
        tags: ["AI Agent Workflow"],
        summary: "Execute Recommended Strategic Action",
        description: "Applies agent-recommended price reduction, clearance tag, or purchase order to the live catalog.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["actionId", "productId", "actionType"],
                properties: {
                  actionId: { type: "string" },
                  productId: { type: "string" },
                  actionType: { type: "string", enum: ["DISCOUNT", "RESTOCK", "BUNDLE", "PRICE_OPTIMIZE"] },
                  parameters: { type: "object" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Action executed and catalog updated." }
        }
      }
    },
    "/api/analytics/summary": {
      get: {
        tags: ["BI Reporting"],
        summary: "Executive BI Summary Metrics",
        description: "Returns platform GMV, Net Revenue, Orders, Average Order Value, and Inventory Valuation.",
        responses: {
          "200": { description: "Executive summary calculated." }
        }
      }
    },
    "/api/analytics/benchmark": {
      get: {
        tags: ["BI Reporting"],
        summary: "Marketplace Benchmark Comparison",
        description: "Compares current merchant metrics against the top 10% and marketplace baseline.",
        responses: {
          "200": { description: "Benchmark comparison dataset." }
        }
      }
    }
  }
};
