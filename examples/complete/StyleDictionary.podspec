
Pod::Spec.new do |s|
  s.name             = 'StyleDictionary'
  s.version          = '0.1.0'
  s.summary          = 'An example StyleDictionary cocoapod and example app.'
  s.description      = <<-DESC
An example StyleDictionary cocoapod and example app.
                       DESC
  s.homepage         = 'homepage'
  s.license          = { :type => 'Apache-2.0', :file => 'LICENSE' }
  s.author           = { 'Danny Banks' => 'dbanks.design@gmail.com' }
  s.source           = { :git => '', :tag => s.version.to_s }
  s.platform = :ios
  s.source_files = 'ios/Classes/**/*.{h,m}'
  s.public_header_files = 'ios/Classes/**/*.h'
  s.resource_bundles = {
    'StyleDictionary' => ['assets/**/*']
  }
  s.frameworks = 'UIKit', 'QuartzCore'
end
