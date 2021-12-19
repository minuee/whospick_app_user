#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

#import <KakaoOpenSDK/KakaoOpenSDK.h> // 카카오
#import <NaverThirdPartyLogin/NaverThirdPartyLoginConnection.h> // 네이버
#import <RNGoogleSignin/RNGoogleSignin.h> // 구글

#import <CodePush/CodePush.h>

@import Firebase; // 파이어베이스

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>

static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif

  [FIRApp configure]; // 파이어베이스

  [KOSession sharedSession].automaticPeriodicRefresh = YES; // 카카오
  [[NaverThirdPartyLoginConnection getSharedInstance] setIsInAppOauthEnable:YES]; // 네이버
  [[NaverThirdPartyLoginConnection getSharedInstance] setIsNaverAppOauthEnable:YES]; // 네이버
  
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"whospick_reactnative_actor"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  // return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  return [CodePush bundleURL];
#endif
}

// 소셜 로그인 Start
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
                                      sourceApplication:(NSString *)sourceApplication
                                              annotation:(id)annotation {
    if ([KOSession isKakaoAccountLoginCallback:url]) {
        return [KOSession handleOpenURL:url];
    }

    return false;
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
                                                options:(NSDictionary<NSString *,id> *)options {
    if ([KOSession isKakaoAccountLoginCallback:url]) {
        return [KOSession handleOpenURL:url];
    }
  
    if ([[NaverThirdPartyLoginConnection getSharedInstance] application:application openURL:url options:options]) {
      return YES;
    }
  
    if ([RNGoogleSignin application:application openURL:url options:options]) {
      return YES;
    }
  
    return false;
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
    [KOSession handleDidBecomeActive];
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    [KOSession handleDidEnterBackground];
}

// 소셜 로그인 End

@end
