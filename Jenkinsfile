pipeline {
    agent any
    
    environment {
        // Node.js configuration
        NODEJS_HOME = tool name: 'NodeJS-20', type: 'nodejs'
        PATH = "${NODEJS_HOME}/bin:${env.PATH}"
        
        // Application settings
        NODE_ENV = 'production'
        PORT = '3000'
        
        // Credentials (configure these in Jenkins)
        DATABASE_URL = credentials('postgres-database-url')
        GEMINI_API_KEY = credentials('gemini-api-key')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code from repository...'
                checkout scm
                sh 'git rev-parse HEAD > .git/commit-id'
            }
        }
        
        stage('Environment Info') {
            steps {
                echo '🔍 Displaying environment information...'
                sh '''
                    echo "Node version:"
                    node --version
                    echo "NPM version:"
                    npm --version
                    echo "Current directory:"
                    pwd
                    echo "Branch: ${GIT_BRANCH}"
                    echo "Commit: $(cat .git/commit-id)"
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing Node.js dependencies...'
                sh '''
                    npm ci --only=production
                    echo "✅ Dependencies installed successfully!"
                '''
            }
        }
        
        stage('Setup Environment') {
            steps {
                echo '⚙️ Creating .env file...'
                sh '''
                    cat > .env << EOF
PORT=${PORT}
NODE_ENV=${NODE_ENV}
DATABASE_URL=${DATABASE_URL}
GEMINI_API_KEY=${GEMINI_API_KEY}
EOF
                    echo "✅ Environment file created!"
                '''
            }
        }
        
        stage('Database Connection Test') {
            steps {
                echo '🔌 Testing PostgreSQL database connection...'
                script {
                    try {
                        sh '''
                            timeout 30 node -e "
                            import('./config/database.js').then(module => {
                                return module.testConnection();
                            }).then(success => {
                                if (!success) {
                                    console.error('Database connection test failed');
                                    process.exit(1);
                                } else {
                                    console.log('✅ Database connection successful!');
                                    process.exit(0);
                                }
                            }).catch(err => {
                                console.error('Database test error:', err);
                                process.exit(1);
                            });
                            "
                        '''
                    } catch (Exception e) {
                        error "❌ Database connection failed! Please check DATABASE_URL"
                    }
                }
            }
        }
        
        stage('Lint & Validate') {
            steps {
                echo '🔍 Validating code...'
                sh '''
                    # Check if required files exist
                    [ -f "server.js" ] && echo "✅ server.js found" || exit 1
                    [ -f "package.json" ] && echo "✅ package.json found" || exit 1
                    [ -d "config" ] && echo "✅ config directory found" || exit 1
                    [ -d "routes" ] && echo "✅ routes directory found" || exit 1
                    echo "✅ All required files present!"
                '''
            }
        }
        
        stage('Stop Previous Instance') {
            steps {
                echo '🛑 Stopping previous server instance...'
                sh '''
                    # Kill existing Node.js server process
                    pkill -f "node server.js" || echo "No previous instance running"
                    
                    # Wait for port to be released
                    sleep 3
                    
                    # Check if port is free
                    if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
                        echo "⚠️ Port ${PORT} still in use, force killing..."
                        lsof -ti:${PORT} | xargs kill -9 || true
                        sleep 2
                    fi
                    
                    echo "✅ Port ${PORT} is now available"
                '''
            }
        }
        
        stage('Start Server') {
            steps {
                echo '🚀 Starting Node.js server...'
                sh '''
                    # Create logs directory
                    mkdir -p logs
                    
                    # Start server in background
                    nohup node server.js > logs/server.log 2>&1 &
                    
                    # Save PID
                    echo $! > server.pid
                    
                    echo "✅ Server started with PID: $(cat server.pid)"
                    
                    # Wait for server to initialize
                    echo "⏳ Waiting for server to start..."
                    sleep 8
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Running health checks...'
                script {
                    try {
                        sh '''
                            # Test health endpoint
                            echo "Testing /health endpoint..."
                            HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/health)
                            
                            if [ "$HEALTH_RESPONSE" = "200" ]; then
                                echo "✅ Health check passed! (HTTP $HEALTH_RESPONSE)"
                            else
                                echo "❌ Health check failed! (HTTP $HEALTH_RESPONSE)"
                                exit 1
                            fi
                            
                            # Test nutrition endpoint
                            echo "Testing /nutrition endpoint..."
                            NUTRITION_RESPONSE=$(curl -s -X POST http://localhost:${PORT}/nutrition \
                              -H "Content-Type: application/json" \
                              -d '{"food": "apple"}' | jq -r '.food_name // empty')
                            
                            if [ -n "$NUTRITION_RESPONSE" ]; then
                                echo "✅ Nutrition endpoint working! (Food: $NUTRITION_RESPONSE)"
                            else
                                echo "⚠️ Nutrition endpoint returned empty response"
                            fi
                            
                            # Test database save endpoint
                            echo "Testing /save endpoint..."
                            SAVE_RESPONSE=$(curl -s http://localhost:${PORT}/save | jq -r '.success // false')
                            
                            if [ "$SAVE_RESPONSE" = "true" ]; then
                                echo "✅ Database endpoint working!"
                            else
                                echo "⚠️ Database endpoint returned: $SAVE_RESPONSE"
                            fi
                            
                            echo "✅ All health checks completed!"
                        '''
                    } catch (Exception e) {
                        error "❌ Health checks failed!"
                    }
                }
            }
        }
        
        stage('Smoke Tests') {
            steps {
                echo '🧪 Running smoke tests...'
                sh '''
                    echo "Testing all critical endpoints..."
                    
                    # Test 1: Health endpoint
                    curl -f http://localhost:${PORT}/health || exit 1
                    
                    # Test 2: Get all nutrition logs
                    curl -f http://localhost:${PORT}/save || exit 1
                    
                    # Test 3: Get logs by date
                    TODAY=$(date +%Y-%m-%d)
                    curl -f "http://localhost:${PORT}/save/date/$TODAY" || exit 1
                    
                    echo "✅ All smoke tests passed!"
                '''
            }
        }
    }
    
    post {
        success {
            echo '✅ ========================================='
            echo '✅ DEPLOYMENT SUCCESSFUL!'
            echo '✅ ========================================='
            echo "✅ Server is running on http://localhost:${PORT}"
            echo "✅ Health: http://localhost:${PORT}/health"
            echo "✅ API Documentation: Check API_DOCUMENTATION.md"
            sh '''
                echo "📊 Server Status:"
                echo "PID: $(cat server.pid 2>/dev/null || echo 'N/A')"
                echo "Port: ${PORT}"
                echo "Time: $(date)"
                
                # Display last 10 lines of server log
                echo ""
                echo "📝 Recent Server Logs:"
                tail -n 10 logs/server.log || echo "No logs available"
            '''
        }
        
        failure {
            echo '❌ ========================================='
            echo '❌ DEPLOYMENT FAILED!'
            echo '❌ ========================================='
            sh '''
                echo "📝 Server Logs (last 50 lines):"
                tail -n 50 logs/server.log 2>/dev/null || echo "No logs available"
                
                echo ""
                echo "🔍 Checking for running processes:"
                ps aux | grep node || echo "No node processes found"
                
                echo ""
                echo "🔍 Checking port ${PORT}:"
                lsof -i :${PORT} || echo "Port ${PORT} is not in use"
            '''
            
            // Clean up failed deployment
            sh '''
                echo "🧹 Cleaning up failed deployment..."
                pkill -f "node server.js" || true
                rm -f server.pid
            '''
        }
        
        always {
            echo '🧹 Post-build cleanup...'
            
            // Archive logs and artifacts
            archiveArtifacts artifacts: 'logs/*.log', allowEmptyArchive: true
            archiveArtifacts artifacts: '.env', allowEmptyArchive: true
            
            // Generate deployment report
            sh '''
                cat > deployment-report.txt << EOF
===========================================
Calorie Tracking Backend - Deployment Report
===========================================
Build Number: ${BUILD_NUMBER}
Build Date: $(date)
Git Branch: ${GIT_BRANCH}
Git Commit: $(cat .git/commit-id 2>/dev/null || echo 'N/A')
Node Version: $(node --version)
Status: ${currentBuild.result}
===========================================
EOF
                cat deployment-report.txt
            '''
            
            archiveArtifacts artifacts: 'deployment-report.txt', allowEmptyArchive: true
        }
        
        unstable {
            echo '⚠️ Build is unstable - some tests may have failed'
        }
    }
}
