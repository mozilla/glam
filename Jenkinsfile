@Library('cloudops-infra') _

pipeline {
  agent any

  stages {
    stage('DEV') {
      when {
        branch: 'jenkinsfile'
      }

      stages {
        stage('BUILD') {
          steps {
            sh 'docker build -t app:build .'
          }
        }

        stage('DEPLOY') {
          sh 'echo "deploying dev"'
        }
      }
    }

    stage('STAGE + PROD') {
      when {
        tag comparator: 'REGEXP', pattern: '\\d{4}\\.\\d{1,2}\\.\\d{1,2}'
      }

      stages {
        stage('BUILD') {
          steps {
            sh 'docker build -t app:build .'
          }
        }


        stage('DEPLOY STAGE') {
          steps {
            sh 'echo "deploying stage"'
          }
        }

        stage('DEPLOY PROD') {
          input {
            message 'Promote to Production?'
          }

          steps {
            sh 'echo "deploying prod"'
          }
        }
      }
    }
  }
}
