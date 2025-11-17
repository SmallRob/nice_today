# Project Context

## Purpose
Nice Today is a modern biorhythm application based on biorhythm theory that provides personalized physiological state analysis and clothing/diet recommendations. The project aims to help users understand their biological rhythms and make better lifestyle choices based on scientific analysis of their physical, emotional, and intellectual cycles.

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Axios, Chart.js
- **Backend**: FastAPI, Pydantic, SQLAlchemy, WebSockets
- **Deployment**: Docker, Docker Compose, Nginx
- **Languages**: Python, JavaScript/TypeScript
- **Data**: SQLite (development), extensible to other databases

## Project Conventions

### Code Style
- **Python**: Follow PEP 8 style guide with meaningful variable and function names
- **JavaScript/React**: Use functional components with hooks, camelCase naming convention
- **CSS/Tailwind**: Utility-first approach with custom color extensions for biorhythm types (physical: blue, emotional: red, intellectual: green)
- **Documentation**: Chinese for user-facing content, English for technical documentation

### Architecture Patterns
- **Frontend**: Component-based architecture with service layer for API communication
- **Backend**: Service-oriented architecture with separate modules for biorhythm calculation, dress recommendations, and Maya calendar features
- **API Design**: RESTful principles with consistent error handling and response structures
- **Data Flow**: Unidirectional data flow from services to components

### Testing Strategy
- **Backend**: Unit tests for service functions and integration tests for API endpoints
- **Frontend**: Component testing with Jest and React Testing Library
- **End-to-end**: Manual testing through Docker deployment verification
- **Continuous Integration**: Scripts for automated testing during development

### Git Workflow
- **Branching**: Feature branches from main with descriptive names (e.g., feat/biorhythm-calculations)
- **Commit Messages**: Conventional commits format (feat:, fix:, chore:, etc.) in Chinese
- **Pull Requests**: Not specified - direct commits to main branch
- **Versioning**: Semantic versioning aligned with feature completion

## Domain Context
- **Biorhythm Theory**: Calculates physical, emotional, and intellectual cycles based on birth date
- **Maya Calendar**: Integrates Mayan calendar calculations and significance
- **Personalized Recommendations**: Clothing and diet suggestions based on current biorhythm state
- **Real-time Data**: WebSocket connections for live updates and notifications

## Important Constraints
- **Cross-platform Compatibility**: Must work on Windows, macOS, and Linux
- **Containerization**: All services must run in Docker containers
- **Performance**: FastAPI backend for high-performance API responses
- **Scalability**: Architecture designed to support future expansion of features
- **Localization**: Support for Chinese language interface with UTF-8 encoding

## External Dependencies
- **Docker Hub**: Base images for Python and Node.js environments
- **NPM Registry**: Frontend package dependencies
- **PyPI**: Python package dependencies
- **GitHub**: Source code repository and potential CI/CD integration