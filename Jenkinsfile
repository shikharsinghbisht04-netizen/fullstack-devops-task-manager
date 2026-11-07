// Helper: copy compose file + deploy script to a server and run it over SSH
def deployTo(String host) {
  def remote = "cd ${env.APP_DIR} && REGISTRY=${env.REGISTRY} " +
               "IMAGE_TAG=${env.IMAGE_TAG} bash deploy.sh"
  sshagent(credentials: ['deploy-ssh-key']) {
    def ssh = "ssh -o StrictHostKeyChecking=accept-new ${host}"
    sh "${ssh} 'mkdir -p ${env.APP_DIR}'"
    sh "scp -o StrictHostKeyChecking=accept-new docker-compose.yml " +
       "deploy.sh ${host}:${env.APP_DIR}/"
    sh "${ssh} \"${remote}\""
  }
}

pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 60, unit: 'MINUTES')
  }

  environment {
    REGISTRY   = 'docker.io/your-dockerhub-user'
    BACKEND    = "${REGISTRY}/fullstack-backend"
    FRONTEND   = "${REGISTRY}/fullstack-frontend"
    STAGING    = 'deploy@staging.example.com'
    PRODUCTION = 'deploy@prod.example.com'
    APP_DIR    = '/opt/fullstack-app'
  }

  stages {

    stage('Checkout & Prepare') {
      steps {
        checkout scm
        script {
          def sha = sh(script: 'git rev-parse --short HEAD',
                       returnStdout: true).trim()
          env.IMAGE_TAG = "${env.BUILD_NUMBER}-${sha}"
        }
        echo "Branch: ${env.BRANCH_NAME} | Image tag: ${env.IMAGE_TAG}"
      }
    }

    stage('Build & Test') {
      agent {
        docker {
          image 'node:20-alpine'
          reuseNode true
          args '-e npm_config_cache=/tmp/.npm'
        }
      }
      stages {

        stage('Install Dependencies') {
          parallel {
            stage('Backend')  { steps { dir('backend')  { sh 'npm ci' } } }
            stage('Frontend') { steps { dir('frontend') { sh 'npm ci' } } }
          }
        }

        stage('Lint') {
          parallel {
            stage('Backend')  { steps { dir('backend')  { sh 'npm run lint' } } }
            stage('Frontend') { steps { dir('frontend') { sh 'npm run lint' } } }
          }
        }

        stage('Unit Tests') {
          parallel {
            stage('Backend') {
              steps { dir('backend') { sh 'npm test' } }
              post {
                always {
                  junit 'backend/reports/junit.xml'
                  archiveArtifacts artifacts: 'backend/coverage/**',
                                   allowEmptyArchive: true
                }
              }
            }
            stage('Frontend') {
              steps { dir('frontend') { sh 'npm test' } }
              post {
                always {
                  junit 'frontend/reports/junit.xml'
                  archiveArtifacts artifacts: 'frontend/coverage/**',
                                   allowEmptyArchive: true
                }
              }
            }
          }
        }

        stage('Build UI Bundle') {
          steps {
            dir('frontend') { sh 'npm run build' }
            archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
          }
        }
      }
    }

    stage('Package Docker Images') {
      steps {
        sh '''
          docker build -t ${BACKEND}:${IMAGE_TAG}  ./backend
          docker build -t ${FRONTEND}:${IMAGE_TAG} ./frontend
        '''
      }
    }

    stage('Integration Smoke Test') {
      environment {
        COMPOSE_PROJECT_NAME = "ci-${BUILD_NUMBER}"
        WEB_PORT             = '18080'
      }
      steps {
        sh '''
          docker compose up -d
          URL=http://host.docker.internal:${WEB_PORT}
          API=$URL/api
          BODY='{"title":"ci-smoke-test"}'
          curl -f --retry 20 --retry-delay 3 --retry-connrefused $API/health
          curl -f -X POST -H "Content-Type: application/json" -d "$BODY" $API/tasks
          curl -f -s -o /dev/null $URL/
        '''
      }
      post { always { sh 'docker compose down -v || true' } }
    }

    stage('Security Scan') {
      steps {
        sh '''
          for IMG in ${BACKEND} ${FRONTEND}; do
            trivy image --severity CRITICAL --exit-code 1 $IMG:${IMAGE_TAG}
          done
        '''
      }
    }

    stage('Publish Images') {
      when { anyOf { branch 'develop'; branch 'main' } }
      steps {
        withCredentials([usernamePassword(
            credentialsId: 'dockerhub-creds',
            usernameVariable: 'REG_USER',
            passwordVariable: 'REG_PASS')]) {
          sh '''
            echo "$REG_PASS" | docker login -u "$REG_USER" --password-stdin
            docker push ${BACKEND}:${IMAGE_TAG}
            docker push ${FRONTEND}:${IMAGE_TAG}
            docker logout
          '''
        }
      }
    }

    stage('Deploy to Staging') {
      when { anyOf { branch 'develop'; branch 'main' } }
      steps { deployTo(env.STAGING) }
    }

    stage('Approve Production Release') {
      when { beforeInput true; branch 'main' }
      input {
        message 'Deploy this build to PRODUCTION?'
        ok 'Deploy'
        submitter 'release-managers'
      }
      steps { echo 'Release approved - promoting to production' }
    }

    stage('Deploy to Production') {
      when { branch 'main' }
      steps { deployTo(env.PRODUCTION) }
    }
  }

  post {
    success {
      mail to: 'team@example.com',
           subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
           body: "Pipeline passed.\nDetails: ${env.BUILD_URL}"
    }
    failure {
      mail to: 'team@example.com',
           subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
           body: "Pipeline failed.\nConsole log: ${env.BUILD_URL}console"
    }
    always {
      sh 'docker image prune -f || true'
      cleanWs()
    }
  }
}
