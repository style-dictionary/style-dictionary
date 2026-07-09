/* @web/test-runner snapshot v1 */
export const snapshots = {};

snapshots["formats xaml/resourceDictionary should match default snapshot"] = 
`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Do not edit directly, this file was auto-generated.
-->
<ResourceDictionary
  xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
  xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml">
  <!-- Brand primary color -->
  <Color x:Key="ColorBrandPrimary">#FF0B8599</Color>
  <x:Double x:Key="SizeCornerRadiusMedium">8</x:Double>
  <x:Double x:Key="FontSizeBody">16</x:Double>
  <x:String x:Key="GreetingText">Hello &amp; goodbye</x:String>
  <x:Boolean x:Key="IsEnabled">True</x:Boolean>
  <SolidColorBrush x:Key="ColorBrandPrimaryBrush" Color="{StaticResource ColorBrandPrimary}" />
</ResourceDictionary>
`;
/* end snapshot formats xaml/resourceDictionary should match default snapshot */

snapshots["formats xaml/resourceDictionary with options overrides should match snapshot"] = 
`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Do not edit directly, this file was auto-generated.
-->
<ResourceDictionary
  xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
  xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
  x:Class="MyApp.Resources.BrandTokens">
  <Color x:Key="BrandPrimary">#FF663399</Color>
  <SolidColorBrush x:Key="BrandPrimaryPaint" Color="{StaticResource BrandPrimary}" />
</ResourceDictionary>
`;
/* end snapshot formats xaml/resourceDictionary with options overrides should match snapshot */

snapshots["formats xaml/resourceDictionary with references should match snapshot"] = 
`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Do not edit directly, this file was auto-generated.
-->
<ResourceDictionary
  xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
  xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml">
  <Color x:Key="ColorBase">#FF0B8599</Color>
  <x:Double x:Key="SizeBase">8</x:Double>
  <StaticResource x:Key="ColorAlias" Key="ColorBase" />
  <StaticResource x:Key="SizeAlias" Key="SizeBase" />
  <SolidColorBrush x:Key="ColorBaseBrush" Color="{StaticResource ColorBase}" />
  <SolidColorBrush x:Key="ColorAliasBrush" Color="{StaticResource ColorAlias}" />
</ResourceDictionary>
`;
/* end snapshot formats xaml/resourceDictionary with references should match snapshot */

snapshots["formats xaml/resourceDictionary with compatible primitive values should match snapshot"] = 
`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Do not edit directly, this file was auto-generated.
-->
<ResourceDictionary
  xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
  xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml">
  <Color x:Key="ColorOverlay">#800B8599</Color>
  <x:Single x:Key="StrokeWidth">12.5</x:Single>
  <x:String x:Key="TaglineText">Use &lt;tag&gt; &amp; &quot;quotes&quot;</x:String>
  <x:Boolean x:Key="IsPreview">False</x:Boolean>
  <SolidColorBrush x:Key="ColorOverlayBrush" Color="{StaticResource ColorOverlay}" />
</ResourceDictionary>
`;
/* end snapshot formats xaml/resourceDictionary with compatible primitive values should match snapshot */

snapshots["formats xaml/resourceDictionary with a forced resource type should match snapshot"] = 
`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Do not edit directly, this file was auto-generated.
-->
<ResourceDictionary
  xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
  xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml">
  <!-- Brand primary color -->
  <x:String x:Key="ColorBrandPrimary">#0B8599</x:String>
  <x:String x:Key="SizeCornerRadiusMedium">8</x:String>
  <x:String x:Key="FontSizeBody">16</x:String>
  <x:String x:Key="GreetingText">Hello &amp; goodbye</x:String>
  <x:String x:Key="IsEnabled">true</x:String>
</ResourceDictionary>
`;
/* end snapshot formats xaml/resourceDictionary with a forced resource type should match snapshot */

snapshots["formats xaml/resourceDictionary with DynamicResource brush references should match snapshot"] = 
`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Do not edit directly, this file was auto-generated.
-->
<ResourceDictionary
  xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
  xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml">
  <!-- Brand primary color -->
  <Color x:Key="ColorBrandPrimary">#FF0B8599</Color>
  <x:Double x:Key="SizeCornerRadiusMedium">8</x:Double>
  <x:Double x:Key="FontSizeBody">16</x:Double>
  <x:String x:Key="GreetingText">Hello &amp; goodbye</x:String>
  <x:Boolean x:Key="IsEnabled">True</x:Boolean>
  <SolidColorBrush x:Key="ColorBrandPrimaryBrush" Color="{DynamicResource ColorBrandPrimary}" />
</ResourceDictionary>
`;
/* end snapshot formats xaml/resourceDictionary with DynamicResource brush references should match snapshot */
