# CheapTrip AI Scanner

CheapTrip AI Scanner is now integrated into the main platform under the `CheapTrip AI` tab.

## Current mode
- Mock data first
- API-ready backend structure
- Telegram price alert support
- English + Arabic trip report support

## Travel API routes
- POST `/api/search/flights`
- POST `/api/search/hotels`
- POST `/api/search/stays`
- POST `/api/report`
- POST `/api/alerts/create`
- POST `/api/alerts/check`
- POST `/api/telegram/send`
- GET `/api/cheaptrip/alerts`

## Planned real providers
- Amadeus for flights/hotels
- Travelpayouts for affiliate links
- Expedia / Booking / Agoda partner APIs for hotels and vacation rental partner inventory

## Supabase
Use `cheaptrip_supabase_schema.sql` as the starting schema.

## Notes
- Airbnb is intentionally not scraped directly.
- Use the label `vacation rental partner inventory` in UI and reports.
