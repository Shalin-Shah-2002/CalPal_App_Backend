# Jenkins Setup Guide - Calorie Tracking Backend

## 📋 Prerequisites

- ✅ Jenkins installed and running
- ✅ Node.js 20+ installed on Jenkins server
- ✅ PostgreSQL database accessible
- ✅ Git installed
- ✅ curl and jq installed (for health checks)

---

## 🚀 Quick Setup

### 1. Install Required Jenkins Plugins

Go to **Manage Jenkins** → **Manage Plugins** → **Available** and install:

- ✅ **NodeJS Plugin** - For Node.js builds
- ✅ **Git Plugin** - For Git integration
- ✅ **Pipeline Plugin** - For pipeline support
- ✅ **Credentials Plugin** - For secure credentials
- ✅ **Docker Plugin** (optional) - For Docker builds
- ✅ **Blue Ocean** (optional) - For better UI

### 2. Configure NodeJS in Jenkins

1. Go to **Manage Jenkins** → **Global Tool Configuration**
2. Scroll to **NodeJS** section
3. Click **Add NodeJS**
4. Configure:
   - **Name**: `NodeJS-20`
   - **Version**: Select `NodeJS 20.x` (latest LTS)
   - **Global npm packages to install**: Leave empty or add `npm@latest`
5. Click **Save**

### 3. Add Credentials in Jenkins

Go to **Manage Jenkins** → **Manage Credentials** → **(global)** → **Add Credentials**

#### Credential 1: Database URL
- **Kind**: Secret text
- **Scope**: Global
- **Secret**: Your PostgreSQL connection string
  ```
  postgresql://username:password@host:port/database
  ```
- **ID**: `postgres-database-url`
- **Description**: PostgreSQL Database URL

#### Credential 2: Gemini API Key
- **Kind**: Secret text
- **Scope**: Global
- **Secret**: Your Google Gemini API key
- **ID**: `gemini-api-key`
- **Description**: Google Gemini API Key

### 4. Create Jenkins Pipeline Job

1. Click **New Item**
2. Enter name: `Calorie-Tracking-Backend`
3. Select **Pipeline**
4. Click **OK**

### 5. Configure Pipeline

In the job configuration page:

#### General Section:
- ✅ **Description**: "Calorie Tracking Backend - Node.js API with PostgreSQL"
- ✅ **Discard old builds**: Check this
  - Days to keep builds: `30`
  - Max # of builds to keep: `10`

#### Build Triggers:
- ✅ **GitHub hook trigger for GITScm polling** (if using GitHub webhooks)
- ✅ **Poll SCM**: `H/5 * * * *` (check every 5 minutes - optional)

#### Pipeline Section:
- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: Your Git repository URL
  ```
  https://github.com/Shalin-Shah-2002/CalPal_App_Backend.git
  ```
- **Credentials**: Add your GitHub credentials if private repo
- **Branch Specifier**: `*/main` (or your default branch)
- **Script Path**: `Jenkinsfile`

Click **Save**

---

## 🔄 Setting Up GitHub Webhook (Optional)

For automatic builds when you push to GitHub:

### In Jenkins:
1. Copy your Jenkins URL: `http://your-jenkins-url:8080`

### In GitHub:
1. Go to your repository
2. **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - **Payload URL**: `http://your-jenkins-url:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Select "Just the push event"
   - **Active**: Check this
4. Click **Add webhook**

---

## 🧪 Testing Your Pipeline

### First Build:

1. Go to your Jenkins job: `Calorie-Tracking-Backend`
2. Click **Build Now**
3. Click on the build number (e.g., `#1`) in Build History
4. Click **Console Output** to watch the build progress

### Expected Pipeline Stages:

```
1. ✅ Checkout               - Pull code from Git
2. ✅ Environment Info       - Display Node.js and NPM versions
3. ✅ Install Dependencies   - Run npm ci
4. ✅ Setup Environment      - Create .env file
5. ✅ Database Test          - Test PostgreSQL connection
6. ✅ Lint & Validate        - Check required files
7. ✅ Stop Previous Instance - Kill old server
8. ✅ Start Server           - Launch new server
9. ✅ Health Check           - Test all endpoints
10. ✅ Smoke Tests           - Final validation
```

---

## 📊 Build Success Indicators

### Successful Build Shows:
```
✅ DEPLOYMENT SUCCESSFUL!
✅ Server is running on http://localhost:3000
✅ Health: http://localhost:3000/health
```

### You Can Test:
```bash
# Health check
curl http://your-jenkins-server:3000/health

# Get nutrition data
curl -X POST http://your-jenkins-server:3000/nutrition \
  -H "Content-Type: application/json" \
  -d '{"food": "apple"}'

# Get saved logs
curl http://your-jenkins-server:3000/save
```

---

## 🐛 Troubleshooting

### Issue 1: "NodeJS-20 not found"
**Solution**: Install NodeJS plugin and configure NodeJS in Global Tool Configuration

### Issue 2: "Database connection failed"
**Solutions**:
- Check DATABASE_URL credential is correct
- Ensure PostgreSQL is accessible from Jenkins server
- Verify firewall/security group settings
- Test connection manually: `psql $DATABASE_URL`

### Issue 3: "Port 3000 already in use"
**Solutions**:
```bash
# SSH into Jenkins server
lsof -ti:3000 | xargs kill -9
# Or
pkill -f "node server.js"
```

### Issue 4: "Health check failed"
**Solutions**:
- Check server logs: `cat logs/server.log`
- Verify .env file has correct values
- Ensure all dependencies installed: `npm list`
- Check if server started: `ps aux | grep node`

### Issue 5: "npm ci failed"
**Solutions**:
- Delete `node_modules` and `package-lock.json`
- Run `npm install` to regenerate lock file
- Commit the new `package-lock.json`

---

## 📁 View Build Artifacts

After each build, Jenkins archives:
- `logs/server.log` - Server logs
- `.env` - Environment file (for debugging)
- `deployment-report.txt` - Build summary

To view:
1. Go to your build (e.g., `#5`)
2. Click **Build Artifacts** on the left
3. Download or view the files

---

## 🔐 Security Best Practices

### ✅ DO:
- Use Jenkins credentials for sensitive data
- Enable CSRF protection
- Use HTTPS for Jenkins
- Set up role-based access control
- Regularly update Jenkins and plugins
- Use `.gitignore` for `.env` file

### ❌ DON'T:
- Commit credentials to Git
- Use plain text passwords in Jenkinsfile
- Run Jenkins as root
- Expose Jenkins to public internet without authentication

---

## 🔄 CI/CD Workflow

```
Developer pushes code to GitHub
          ↓
GitHub webhook triggers Jenkins
          ↓
Jenkins pulls latest code
          ↓
Install dependencies (npm ci)
          ↓
Test database connection
          ↓
Stop old server instance
          ↓
Start new server instance
          ↓
Run health checks
          ↓
Deployment successful ✅
```

---

## 📈 Monitoring

### Check Server Status:
```bash
# SSH into Jenkins server
ps aux | grep "node server.js"
curl http://localhost:3000/health
tail -f logs/server.log
```

### View Real-time Logs:
```bash
tail -f logs/server.log
```

### Check Database Connection:
```bash
node -e "import('./config/database.js').then(m => m.testConnection())"
```

---

## 🚀 Advanced: Docker Deployment

If you want to use Docker in Jenkins:

### 1. Install Docker on Jenkins Server
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### 2. Add Docker Build Stage to Jenkinsfile
The Jenkinsfile already has a Docker build stage (commented out).

### 3. Update Pipeline Configuration
Set environment variable in Jenkins job:
- `USE_DOCKER=true`

### 4. Run with Docker Compose
```bash
docker-compose up -d
```

---

## 📞 Support

If you encounter issues:
1. Check **Console Output** in Jenkins build
2. Review `logs/server.log`
3. Check `deployment-report.txt` artifact
4. Verify all credentials are set correctly
5. Ensure Node.js 20+ is installed on Jenkins server

---

## ✅ Quick Checklist

Before running your first build:

- [ ] Jenkins installed and running
- [ ] NodeJS plugin installed
- [ ] NodeJS-20 configured in Global Tool Configuration
- [ ] `postgres-database-url` credential added
- [ ] `gemini-api-key` credential added
- [ ] Pipeline job created
- [ ] Git repository configured
- [ ] PostgreSQL database accessible
- [ ] Port 3000 available on Jenkins server

Now click **Build Now** and watch the magic happen! 🎉
