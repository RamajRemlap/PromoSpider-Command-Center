
# PromoSpider Command Center

**Version:** 2.4.0 (Ascension Build)
**Theme:** Obsidian Glass / Cyber-Industrial

## 🚀 Overview

PromoSpider is an autonomous affiliate marketing orchestration engine. It discovers, validates, and publishes promotional offers using a swarm of AI agents. This dashboard is the "Command Center" for monitoring and controlling these agents.

## 🎨 Design System: "Obsidian Glass"

The UI follows a strict "Extreme UI" aesthetic inspired by sci-fi interfaces and financial terminals.

### Core Principles
1.  **Cold Logic:** Colors are semantic (Emerald=Success, Rose=Failure, Amber=Warn, Indigo=System).
2.  **Data Density:** High information density with monospace fonts (`JetBrains Mono`) for data.
3.  **Depth & Light:** Uses semi-transparent layers (`backdrop-blur`) and inner glows to simulate glass screens on dark machinery.
4.  **Motion:** Subtle pulsing, scanning, and flowing animations to indicate system liveliness ("Sentience").

### Component Primitives
*   **TechContainer (`Card.tsx`):** The primary surface. Features corner brackets, grid backgrounds, and a "scanner" hover effect.
*   **Terminal (`Terminal.tsx`):** A CRT-styled log viewer with scanlines and auto-scroll.
*   **NeuralNode (`NeuralNode.tsx`):** A pulsing UI element representing an active AI node.

## 🏗 Architecture

### Frontend
*   **Framework:** React 18 + TypeScript
*   **Styling:** Tailwind CSS (configured via CDN in `index.html`)
*   **Icons:** Lucide React
*   **Charts:** Recharts

### Autonomous Agents
The system is modeled as a swarm of 9 specialized agents:
1.  **Harvester:** Discovers URLs via API & Crawling.
2.  **Scraper:** Fetches raw HTML (Playwright).
3.  **Parser:** LLM-based extraction (Gemini/Llama).
4.  **Validator:** Checks redirect chains.
5.  **Compliance:** Fraud & TOS analysis.
6.  **Publisher:** Content generation & CMS push.
7.  **Tracking:** Click attribution & event logging.
8.  **Partner:** Referral & Payout management.
9.  **Optimizer:** A/B testing & ranking logic.

## 🛠 Setup & Deployment

See `Engineer Export` view in the app for downloadable artifacts:
*   `docker-compose.yml`
*   `requirements.txt`
*   `terraform.tf`

## 🔮 Hybrid AI Strategy

The system uses a **Failover Architecture** for Intelligence:
1.  **Primary:** Google Gemini 2.5 Flash (High speed/accuracy).
2.  **Fallback:** Open Source Models (Llama 3 via Groq/Ollama) if primary fails or rate-limits.

Configuration is available in the **Settings** view.
