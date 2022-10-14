#!groovy​

pipeline {
    agent {
        label 'devel10-head'
    }
    triggers{
        // @TODO parameters on githubPush .. eg. branch
        githubPush()
    }
    stages {
        stage('Echo fisk') {
            steps {
                script {
                    sh "echo fisk"
                }
            }
        }
    }
}
