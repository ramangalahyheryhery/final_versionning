pipeline {
    agent any

    stages {

        stage('Build & Run & Test') {
            steps {
                sh 'chmod +x ci-test.sh'
                sh './ci-test.sh'
            }
        }
    }

    post {
        always {
            sh 'docker-compose down || true'
        }
        success {
            echo 'PIPELINE SUCCESS'
        }
        failure {
            echo 'PIPELINE FAILED'
        }
    }
}

