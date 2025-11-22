# Docker Commands Reference - Calorie Tracking Backend

## 🚀 Quick Start

### Build and Run with Docker Compose (Recommended)
```bash
# Start all services (backend + database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean start)
docker-compose down -v
```

---

## 🐳 Docker Commands

### Build Image
```bash
# Build Docker image
docker build -t calorie-tracking-backend:latest .

# Build with no cache
docker build --no-cache -t calorie-tracking-backend:latest .

# Build with build arguments
docker build --build-arg NODE_ENV=production -t calorie-tracking-backend:latest .
```

### Run Container
```bash
# Run container with environment variables
docker run -d \
  --name calorie-backend \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e GEMINI_API_KEY="your-api-key" \
  calorie-tracking-backend:latest

# Run with .env file
docker run -d \
  --name calorie-backend \
  -p 3000:3000 \
  --env-file .env \
  calorie-tracking-backend:latest

# Run in interactive mode (for debugging)
docker run -it \
  --name calorie-backend \
  -p 3000:3000 \
  --env-file .env \
  calorie-tracking-backend:latest sh
```

### Manage Containers
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop container
docker stop calorie-backend

# Start container
docker start calorie-backend

# Restart container
docker restart calorie-backend

# Remove container
docker rm calorie-backend

# Remove container forcefully
docker rm -f calorie-backend
```

### View Logs
```bash
# View container logs
docker logs calorie-backend

# Follow logs (real-time)
docker logs -f calorie-backend

# View last 100 lines
docker logs --tail 100 calorie-backend

# View logs with timestamps
docker logs -t calorie-backend
```

### Execute Commands in Container
```bash
# Open shell in running container
docker exec -it calorie-backend sh

# Run node command
docker exec -it calorie-backend node --version

# Check health
docker exec -it calorie-backend curl http://localhost:3000/health

# View environment variables
docker exec -it calorie-backend env
```

### Inspect Container
```bash
# Inspect container details
docker inspect calorie-backend

# Get container IP address
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' calorie-backend

# Check health status
docker inspect --format='{{.State.Health.Status}}' calorie-backend
```

### Image Management
```bash
# List images
docker images

# Remove image
docker rmi calorie-tracking-backend:latest

# Remove unused images
docker image prune

# Remove all unused images
docker image prune -a

# Tag image
docker tag calorie-tracking-backend:latest calorie-tracking-backend:v1.0

# Save image to file
docker save -o calorie-backend.tar calorie-tracking-backend:latest

# Load image from file
docker load -i calorie-backend.tar
```

---

## 🎯 Docker Compose Commands

### Basic Operations
```bash
# Start services
docker-compose up

# Start services in background (detached mode)
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers and volumes
docker-compose down -v

# Stop, remove containers, volumes, and images
docker-compose down -v --rmi all
```

### Build and Rebuild
```bash
# Build services
docker-compose build

# Build without cache
docker-compose build --no-cache

# Build specific service
docker-compose build backend

# Rebuild and start
docker-compose up -d --build
```

### View Logs
```bash
# View logs from all services
docker-compose logs

# Follow logs (real-time)
docker-compose logs -f

# View logs from specific service
docker-compose logs -f backend

# View last 50 lines
docker-compose logs --tail=50 backend
```

### Service Management
```bash
# List services
docker-compose ps

# Restart service
docker-compose restart backend

# Stop service
docker-compose stop backend

# Start service
docker-compose start backend

# Remove stopped containers
docker-compose rm
```

### Execute Commands
```bash
# Run command in service
docker-compose exec backend node --version

# Open shell in service
docker-compose exec backend sh

# Run one-off command
docker-compose run --rm backend npm test
```

### Scale Services
```bash
# Scale service (create multiple instances)
docker-compose up -d --scale backend=3
```

### Start with Optional Services
```bash
# Start with pgAdmin
docker-compose --profile tools up -d

# Start without pgAdmin
docker-compose up -d
```

---

## 🔍 Debugging

### Check Container Status
```bash
# View container status
docker-compose ps

# View detailed service info
docker-compose ps -a
```

### View Resource Usage
```bash
# View resource usage
docker stats

# View resource usage for specific container
docker stats calorie-backend
```

### Network Debugging
```bash
# List networks
docker network ls

# Inspect network
docker network inspect calorie-tracking-network

# Test connectivity
docker-compose exec backend ping postgres
```

### Volume Management
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect calorie-tracking-postgres-data

# Remove volume
docker volume rm calorie-tracking-postgres-data

# Remove all unused volumes
docker volume prune
```

---

## 🧪 Testing

### Test Health Endpoint
```bash
# From host machine
curl http://localhost:3000/health

# From inside container
docker-compose exec backend curl http://localhost:3000/health
```

### Test Database Connection
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d calorie_tracker

# Run SQL command
docker-compose exec postgres psql -U postgres -d calorie_tracker -c "SELECT * FROM nutrition_logs;"
```

### Test API Endpoints
```bash
# Get nutrition data
curl -X POST http://localhost:3000/nutrition \
  -H "Content-Type: application/json" \
  -d '{"food": "apple"}'

# Get all saved logs
curl http://localhost:3000/save
```

---

## 🧹 Cleanup

### Remove Everything
```bash
# Stop and remove everything
docker-compose down -v --rmi all --remove-orphans

# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Remove all unused networks
docker network prune

# Complete system cleanup (BE CAREFUL!)
docker system prune -a --volumes
```

---

## 📊 Monitoring

### View Container Stats
```bash
# Real-time stats
docker stats

# Stats for specific container
docker stats calorie-tracking-backend
```

### Check Health Status
```bash
# Check health of all services
docker-compose ps

# Check specific service health
docker inspect --format='{{json .State.Health}}' calorie-tracking-backend | jq
```

---

## 🔐 Security

### Scan Image for Vulnerabilities
```bash
# Scan image (requires Docker Scout or similar)
docker scout cves calorie-tracking-backend:latest
```

### Check Best Practices
```bash
# Use hadolint to check Dockerfile
docker run --rm -i hadolint/hadolint < Dockerfile
```

---

## 💡 Tips

1. **Always use `.env` files** for environment variables
2. **Use docker-compose** for multi-container applications
3. **Tag your images** with version numbers
4. **Clean up** unused resources regularly
5. **Check logs** when troubleshooting issues
6. **Use health checks** to ensure services are running properly
7. **Backup volumes** before removing them
