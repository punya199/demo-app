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
                 // restore cache, install, then update cache
                cache(maxCacheSize: 1000, defaultBranch: 'main', caches: [
                  arbitraryFileCache(
                    path: '.yarn/cache', 
                    cacheName: 'yarn-berry-cache', 
                    cacheValidityDecidingFile: 'yarn.lock'  // ถ้า lock file เปลี่ยน จะรีโหลด cache ใหม่
                  ),
                  arbitraryFileCache(
                      path: 'node_modules',
                      cacheName: 'node-modules-cache',
                      cacheValidityDecidingFile: 'yarn.lock'
                  )
                ]) {
                  sh 'yarn install --immutable'
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
            deleteDir()
        }
    }
}
