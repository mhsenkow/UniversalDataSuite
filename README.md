# Jacklyn Domino# Jacklyn Domino

A modern data exploration suite that democratizes data insights through an intuitive, no-code interface.

![Data Studio Interface](docs/images/data-studio-interface.png)

## 🎯 Core Goals

- **Accessible Data Analysis**: Enable non-technical users to explore and analyze data without coding
- **Visual Intelligence**: Create stunning, interactive visualizations powered by Vega
- **Flexible Data Sources**: Support both live and snapshot data from public and private sources
- **Collaborative Insights**: Foster team collaboration through shared dashboards and insights

## 🚀 Key Features

### Data Management
- [x] Local file storage and organization
- [x] Data health indicators
- [x] Data type inference
- [x] Field analysis and statistics
- [ ] Public dataset integration (Kaggle, Data.gov, OpenStreetMap)
- [ ] Live data connection monitoring

### Analysis Tools
- [x] No-code query builder
- [x] Advanced data filtering (equals, contains, greater/less than, between)
- [x] CSV support with automatic type detection
- [x] Real-time data preview
- [x] Field type visualization with Carbon icons
- [ ] Interactive notebook-style analysis
- [ ] AI-assisted query generation
- [ ] Live/snapshot data mode switching

### Visualization & Dashboards
- [x] Basic data charting (Bar, Scatter)
- [x] Field value distribution analysis
- [x] Real-time chart updates
- [x] Chart/Data view tabs
- [x] Aggregation options (Count)
- [ ] Advanced Vega-powered visualizations
- [ ] Customizable dashboard layouts
- [ ] Pre-made templates
- [ ] Interactive filtering and animations

### Collaboration
- [ ] Multi-user support
- [ ] Version control
- [ ] Commenting system
- [ ] API access

## 🛠️ Tech Stack

- Frontend: React + TypeScript
- UI Components: Carbon Design System
- Data Processing: Papa Parse
- Visualizations: Vega
- Build Tool: Vite
- Backend: TBD

## 📊 Current Implementation

### Data Import & Processing
- Support for CSV files with progress indicators
- Automatic type inference (string, number, date, boolean)
- Column sampling and preview
- Error handling and validation
- Sample dataset (Bird Strikes) integration
- Interactive field type indicators with Carbon icons
- Unique value analysis per field
- Data quality metrics
- Real-time loading progress
- Error reporting and validation

### Query System
- Dynamic field-based filtering
- Multiple operator support:
  - Text: contains, equals, starts with, ends with
  - Numbers: equals, greater than, less than, between
- Real-time query preview
- Type-specific operators

### Visualization
- Tab-based view switching
- Full-screen chart/data views
- Real-time data table with 100 row preview
- Interactive Vega charts
- Chart configuration panel

## 🏃‍♂️ Getting Started

1. Clone the repository:
bash
git clone https://github.com/yourusername/jacklyn-domino.git
cd jacklyn-domino
2. Install dependencies
bash
npm install
3. Start the development server:
bash
npm run dev




## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
