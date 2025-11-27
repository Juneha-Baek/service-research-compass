# Service Research Compass 2027

Interactive visualization platform for analyzing predicted concept relationships in service research networks through 2027.

🔗 **Live Demo:** https://link-prediction-viewer.vercel.app/

📄 **User Guide:** [Download PDF](./docs/Service_Research_Compass_2027_User_Guide.pdf)

---

## Overview

This platform visualizes link prediction results from service research papers, predicting which concept pairs are likely to be connected by 2027. Using hierarchical concept extraction and network analysis, the system helps identify emerging research priorities and interdisciplinary opportunities.

**Methodology:**
1. Concept extraction from research papers
2. Semantic embedding (allenai/specter)
3. K-means clustering for community detection
4. Community labeling via GPT-4o-mini
5. Link prediction modeling

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Top Predicted Pairs** | Ranked concept pairs with prediction scores, metadata, and hierarchical child concepts |
| **Community Network** | Interactive force-directed graph comparing predicted vs. current connections |
| **Community Ranking** | Matrix analysis categorizing pairs as Accelerating/Stabilizing/Consolidating/Exploring |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
git clone https://github.com/your-repo/link-prediction-viewer.git
cd link-prediction-viewer
npm install
npm run dev
```

---

## Project Structure
```
src/
├── components/
│   ├── ConceptPairItem.jsx
│   ├── NetworkGraph.jsx
│   ├── CommunityRanking.jsx
│   └── Tooltip.jsx
├── utils/
│   └── dataProcessors.js
└── App.jsx
```

---

## Data Sources

| Dataset | Description |
|---------|-------------|
| **FT50 Data** | 5,892 papers from FT50 journals + 799 papers from JSR |
| **Service Data** | 11,170 papers from Top 8 Service Research journals |

---

## Documentation

- **User Guide (PDF):** [Download](./docs/Service_Research_Compass_2027_User_Guide.pdf)
- **In-app Tooltips:** Hover over ⓘ icons for detailed explanations

---

## 🔧 Recent Updates

### v1.2.0
- Added PDF User Guide (downloadable from intro page)
- Enhanced tooltips with detailed explanations
- Matrix category labels updated (Accelerating/Stabilizing/Consolidating/Exploring)

### v1.1.0
- Top N Pair filter (50-2000)
- Weight Mode toggle (Count/Weighted)
- Year range filter for Current Network
- Hide low-frequency nodes option

---

## 👥 Team

**KAIST College of Business** × **ASU W. P. Carey School of Business**

---

## 📄 License

© 2025 Service Research Compass 2027. All Rights Reserved.