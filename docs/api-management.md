# API Management Web UI

This feature provides a web-based interface for managing and testing the Nice Today API endpoints.

## Features

1. **API Endpoint Management**
   - View all available API endpoints
   - See endpoint descriptions and parameters
   - Test endpoints directly from the web interface

2. **Service Status Monitoring**
   - Real-time monitoring of service status
   - System resource usage (CPU, memory, disk)
   - Service uptime information

3. **API Documentation**
   - Integrated Swagger UI documentation
   - ReDoc documentation
   - OpenAPI JSON specification

4. **Authentication**
   - Secure login for API management interface
   - Token-based authentication

## Access

The API Management interface can be accessed through the main application navigation. Users need to log in with administrator credentials to access the management features.

Default credentials:
- Username: `admin`
- Password: `admin123`

## API Endpoints

### Management Endpoints

- `GET /api/management/endpoints` - Get all API endpoints
- `GET /api/management/status` - Get service status
- `POST /api/management/test` - Test an API endpoint
- `POST /api/management/login` - Login to management interface
- `POST /api/management/logout` - Logout from management interface

### Documentation Endpoints

- `/api/docs` - Swagger UI documentation
- `/api/redoc` - ReDoc documentation
- `/api/openapi.json` - OpenAPI JSON specification

## Environment Variables

- `ADMIN_USERNAME` - Administrator username (default: admin)
- `ADMIN_PASSWORD` - Administrator password (default: admin123)

## Usage

1. Navigate to the API Management section in the main application
2. Login with administrator credentials (default: admin/admin123)
3. Use the various tabs to:
   - View and test API endpoints
   - Monitor service status
   - Access API documentation