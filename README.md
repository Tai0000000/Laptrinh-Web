# Horse Racing System

## Running the Application

### Start all services

```bash
docker-compose up -d
```

### Services:

- **Backend API**: http://localhost:8000
- **WebSocket Server**: ws://localhost:8080
- **Database**: localhost:3307 (MySQL)

### Run Race Simulation

To run the race simulation:

1. Make sure the WebSocket server is running
2. Run the simulation script:

```bash
cd websocket-server
# Install dependencies if not already installed
composer install
php simulate-race.php
```

Or using Docker:

```bash
docker exec -it horse_racing_websocket php simulate-race.php
```

## Database

The database data is persisted in the `db_data` Docker volume, so your data will not be lost even if containers are restarted!
