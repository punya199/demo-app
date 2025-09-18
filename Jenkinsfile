pipeline {
    agent { label 'slave' }

    tools {
        nodejs 'nodejs-20.18.1'
    }

    environment {
        REGISTRY_CREDENTIALS = 'dockerhub-ton'
        DOCKER_IMAGE = "docker.io/acelectic/yaya-developer"
        GIT_COMMIT_VERSION = "${env.GIT_COMMIT}"
        GITHUB_TOKEN = credentials('github-ya')
        BRANCH_NAME = "${env.BRANCH_NAME}"
        // Add Node.js memory optimization
        NODE_OPTIONS = "--max-old-space-size=2048"
        // Optimize Yarn for CI
        YARN_CACHE_FOLDER = "${WORKSPACE}/.yarn/cache"
        YARN_ENABLE_GLOBAL_CACHE = "false"
    }

    stages {
        stage('Install') {
            when {
                anyOf {
                    branch 'main'
                    changeRequest target: 'main', comparator: 'GLOB'
                }
            }
            steps {
                scmSkip(deleteBuild: false)
                // Clear any existing node_modules to prevent conflicts
                sh 'rm -rf node_modules || true'
                
                cache(maxCacheSize: 1000, defaultBranch: 'main', caches: [
                  arbitraryFileCache(
                    path: '.yarn/cache', 
                    cacheName: 'yarn-berry-cache', 
                    cacheValidityDecidingFile: 'yarn.lock'
                  ),
                  arbitraryFileCache(
                      path: 'node_modules',
                      cacheName: 'node-modules-cache',
                      cacheValidityDecidingFile: 'yarn.lock'
                  )
                ]) {
                  // Add network timeout and retry options
                  sh '''
                    yarn install --immutable \
                      --network-timeout 300000 \
                      --network-concurrency 1 \
                      --cache-folder ${YARN_CACHE_FOLDER}
                  '''
                }
            }
        }

        stage('Lint') {
            when {
                anyOf {
                  branch 'main'

                  changeRequest target: 'main', comparator: 'GLOB'
                }
            }
            steps {
                script {
                    sh 'yarn lint:ci'
                }
            }
        }


        stage('Release TAG Version') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sh 'npx semantic-release'
                    env.TARGET_TAG = sh(script:'cat VERSION || echo ""', returnStdout: true).trim()
                }
            }
        }

        stage('Release Image') {
            when {
                branch 'main'
            }
            steps {
                script {
                    env.VITE_APP_VERSION = env.TARGET_TAG
                    sh "echo env.VITE_APP_VERSION=${env.VITE_APP_VERSION}"
                    env.VITE_APP_BUILD_VERSION = env.GIT_COMMIT_VERSION
                    sh "echo env.VITE_APP_BUILD_VERSION=${env.VITE_APP_BUILD_VERSION}"

                    def dockerImageName = "${DOCKER_IMAGE}:demo-app"

                    sh 'yarn bo-web:build'
                    docker.withRegistry("https://${DOCKER_REGISTRY}", REGISTRY_CREDENTIALS) {
                        dockerImage = docker.build(dockerImageName, "-f Dockerfile --build-arg VITE_APP_VERSION=${env.VITE_APP_VERSION} --build-arg VITE_APP_BUILD_VERSION=${env.GIT_COMMIT_VERSION} .")
                        dockerImage.push()
                    }
                }
            }
        }
    }
    post {
        always {
            // Clean up yarn cache to free memory
            sh 'yarn cache clean --all || true'
            deleteDir()
        }
        failure {
            // Additional cleanup on failure
            sh 'pkill -f node || true'
            sh 'pkill -f yarn || true'
        }
    }
}