pipeline {
    agent {
        docker {
            image 'ictdevkih/app-android-build:latest'
        }
    }

    environment {
        ANDROID_HOME = "/opt/android-sdk"
        GRADLE_USER_HOME = "${WORKSPACE}/.gradle"
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
        PATH = "/opt/gradle/bin:${env.PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools"
    }


    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build APK') {
            steps {
                dir('android') {
                    sh '''
                        echo "ANDROID_HOME: $ANDROID_HOME"
                        echo "JAVA_HOME: $JAVA_HOME"
                        java -version || true

                        echo "Using GRADLE_USER_HOME: $GRADLE_USER_HOME"
                        mkdir -p $GRADLE_USER_HOME
                        chmod -R 777 $GRADLE_USER_HOME

                        chmod +x gradlew
                        ./gradlew --no-daemon clean assembleRelease
                    '''
                }
            }
        }


        stage('Archive APK') {
            steps {
                archiveArtifacts artifacts: 'android/app/build/outputs/apk/release/app-release.apk', fingerprint: true
            }
        }
    }
}
