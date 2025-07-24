pipeline {
    agent {
        docker {
            image 'ictdevkih/app-android-build:v4'
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
                        export HOME=$WORKSPACE

                        echo "ANDROID_HOME: $ANDROID_HOME"
                        echo "JAVA_HOME: $JAVA_HOME"
                        java -version || true

                        echo "Using GRADLE_USER_HOME: $GRADLE_USER_HOME"
                        mkdir -p $GRADLE_USER_HOME
                        chmod -R 777 $GRADLE_USER_HOME

                        echo "Preparing .android directory"
                        mkdir -p $HOME/.android
                        touch $HOME/.android/analytics.settings
                        chmod -R 777 $HOME/.android

                        echo "Fixing permissions for node_modules"
                        chmod -R 777 ../node_modules || true
                        find ../node_modules -type d -name build -exec chmod -R 777 {} +

                        echo "Removing any previous prefab build"
                        rm -rf ../node_modules/react-native-reanimated/android/build

                        echo "Generating prefab for react-native-reanimated"
                        ./gradlew :react-native-reanimated:prefabReleasePackage

                        echo "Fixing permissions after prefab generation"
                        chmod -R 777 ../node_modules/react-native-reanimated/android/build

                        echo "Building APK..."
                        gradle --no-daemon clean assembleRelease
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
