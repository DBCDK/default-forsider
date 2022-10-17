#!groovy​

pipeline {
    agent {
        label 'devel10-head'
    }
    triggers{
        // @TODO parameters on githubPush .. eg. branch
        githubPush()
    }

    environment {
        // id of deploy repo
        GITLAB_ID = "1482"
        // we need to use metascrums gitlab token .. for the metascrum bot in deploy stage
        GITLAB_PRIVATE_TOKEN = credentials("metascrum-gitlab-api-token")
        REPOSITORY = "https://docker-frontend.artifacts.dbccloud.dk"
    }
    stages {
        stage('Echo fisk') {
            steps {
                script {
                    sh "echo fisk"
                }
            }
        }

        stage("Update staging version number") {
            agent {
                docker {
                    label 'devel10-head'
                    image "docker-dbc.artifacts.dbccloud.dk/build-env:latest"
                    alwaysPull true
                }
            }
            when {
                branch "main"
            }
            steps {
                dir("deploy") {
                    sh """#!/usr/bin/env bash
						set-new-version configuration.yaml ${env.GITLAB_PRIVATE_TOKEN} ${env.GITLAB_ID} ${env.BUILD_NUMBER} -b staging
					"""
                }
            }
        }
    }
}
