## ADDED Requirements
### Requirement: Horoscope Calculation Service
The system SHALL provide daily horoscope calculations based on the user's birth date and current date.

#### Scenario: Successful horoscope calculation
- **WHEN** a user requests horoscope information with a valid birth date
- **THEN** the system returns the daily horoscope for that user

#### Scenario: Invalid date handling
- **WHEN** a user provides an invalid birth date
- **THEN** the system returns an appropriate error message

### Requirement: Horoscope API Endpoints
The system SHALL expose RESTful API endpoints for horoscope data retrieval.

#### Scenario: Get today's horoscope
- **WHEN** a user makes a GET request to /api/horoscope/today with birth date parameter
- **THEN** the system returns today's horoscope for that birth date

#### Scenario: Get horoscope for specific date
- **WHEN** a user makes a GET request to /api/horoscope/{date} with birth date parameter
- **THEN** the system returns the horoscope for the specified date and birth date