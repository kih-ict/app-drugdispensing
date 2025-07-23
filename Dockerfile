FROM openjdk:17-bullseye

# 1. Install Node.js & basic dependencies
RUN apt-get update && \
    apt-get install -y curl unzip wget git build-essential && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# 2. Set Android SDK environment
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${PATH}

# 3. Install Android Command Line Tools
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    cd ${ANDROID_HOME}/cmdline-tools && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip -O tools.zip && \
    unzip tools.zip && \
    mv cmdline-tools latest && \
    rm tools.zip

# 4. Accept licenses and install SDK packages
RUN yes | ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager --sdk_root=${ANDROID_HOME} --licenses && \
    ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager --sdk_root=${ANDROID_HOME} \
    "platform-tools" \
    "platforms;android-33" \
    "build-tools;33.0.2"

# 5. Gradle cache directory (safe for Jenkins)
ENV GRADLE_USER_HOME=/home/gradle-cache
RUN mkdir -p ${GRADLE_USER_HOME} && \
    chown -R 1000:1000 ${GRADLE_USER_HOME} && \
    chmod -R 777 ${GRADLE_USER_HOME}

# 6. Set permissions (Jenkins usually runs as UID 1000)
RUN chown -R 1000:1000 ${GRADLE_USER_HOME}
