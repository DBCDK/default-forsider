#!groovy​

def app

pipeline {
    agent {
        label 'devel11'
    }
    triggers {
        githubPush()
    }

    environment {
        // id of deploy repo
        GITLAB_ID = "1482"
        // we need to use metascrums gitlab token .. for the metascrum bot in deploy stage
        GITLAB_PRIVATE_TOKEN = credentials("metascrum-gitlab-api-token")
        REPOSITORY = "https://docker-frontend.artifacts.dbccloud.dk"
        // image: eg. "default-forside-service:34" OR "default-forside-service-[branch_name]:453"
        IMAGE = "default-forside-service${BRANCH_NAME != 'main' ? "-${BRANCH_NAME.toLowerCase()}" : ''}:${BUILD_NUMBER}"

        SONAR_SCANNER_HOME = tool 'SonarQube Scanner from Maven Central'
        SONAR_SCANNER = "$SONAR_SCANNER_HOME/bin/sonar-scanner"
        SONAR_PROJECT_KEY = "fe-bib-default-forsider"
        SONAR_SOURCES='./'
        SONAR_TESTS='./svg'
    }
    stages {
        stage('clean workspace') {
            steps {
                cleanWs()
                checkout scm
            }
        }
        stage("SonarQube") {
            steps {
                withSonarQubeEnv(installationName: 'sonarqube.dbc.dk') {
                    script {
                        // trigger sonarqube analysis
                        def sonarOptions = "-Dsonar.branch.name=$BRANCH_NAME"
                        if (env.BRANCH_NAME != 'main') {
                            sonarOptions += " -Dsonar.newCode.referenceBranch=main"
                        }

                        sh returnStatus: true, script: """
                        $SONAR_SCANNER $sonarOptions -Dsonar.token=${SONAR_AUTH_TOKEN} -Dsonar.projectKey="${SONAR_PROJECT_KEY}" 
                        """
                    }
                }
            }
        }
        stage("Quality gate") {
            steps {
                // wait for analysis results
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        stage("Build image") {
            steps {
                script {
                    // Work around bug https://issues.jenkins-ci.org/browse/JENKINS-44609 , https://issues.jenkins-ci.org/browse/JENKINS-44789
                    sh "docker build -t ${IMAGE} --pull --no-cache ."
                    app = docker.image("${IMAGE}")
                }
            }
        }

        stage('Push to Artifactory') {
            when {
                branch "main"
            }
            steps {
                script {
                    if (currentBuild.resultIsBetterOrEqualTo('SUCCESS')) {
                        docker.withRegistry("${REPOSITORY}", 'docker') {
                            app.push()
                            app.push("latest")
                        }
                    }
                }
            }
        }

        stage("Update staging version number") {
            agent {
                docker {
                    label 'devel11'
                    image "docker-dbc.artifacts.dbccloud.dk/build-env:latest"
                    alwaysPull true
                }
            }
            when {
                branch "main"
            }
            steps {
                sh """#!/usr/bin/env bash
						set-new-version configuration.yaml ${env.GITLAB_PRIVATE_TOKEN} ${env.GITLAB_ID} ${BUILD_NUMBER} -b staging
					"""
            }
        }
    }
    post {
        always {
            sh """
                    echo Clean up $IMAGE
                    docker rmi $IMAGE
                """
        }
        failure {
            script {
                if ("${env.BRANCH_NAME}" == 'master') {
                    slackSend(channel: 'fe-drift',
                            color: 'warning',
                            message: "${env.JOB_NAME} #${env.BUILD_NUMBER} failed and needs attention: ${env.BUILD_URL}",
                            tokenCredentialId: 'slack-global-integration-token')
                }
            }
        }
        success {
            script {
                if ("${env.BRANCH_NAME}" == 'master') {
                    slackSend(channel: 'fe-drift',
                            color: 'good',
                            message: "${env.JOB_NAME} #${env.BUILD_NUMBER} completed, and pushed ${IMAGE} to artifactory.",
                            tokenCredentialId: 'slack-global-integration-token')

                }
            }
        }
        fixed {
            slackSend(channel: 'fe-drift',
                    color: 'good',
                    message: "${env.JOB_NAME} #${env.BUILD_NUMBER} back to normal: ${env.BUILD_URL}",
                    tokenCredentialId: 'slack-global-integration-token')

        }
    }
}
