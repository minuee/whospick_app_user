# 안드로이드 APK 파일 추출 스크립트
cd ./android
./gradlew bundleRelease --stacktrace
cd ..
cp ./android/app/build/outputs/bundle/release/app-release.aab ~/Desktop/WhosPick_Actor.aab
