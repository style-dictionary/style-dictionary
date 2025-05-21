export default `<%
  const colorRegex = /^(#(?:[\\da-f]{3}){1,2}|rgb\\((?:\\d{1,3},\\s*){2}\\d{1,3}\\)|rgba\\((?:\\d{1,3},\\s*){3}\\d*\\.?\\d+\\)|hsl\\(\\d{1,3}(?:,\\s*\\d{1,3}%){2}\\)|hsla\\(\\d{1,3}(?:,\\s*\\d{1,3}%){2},\\s*\\d*\\.?\\d+\\)|IndianRed|LightCoral|Salmon|DarkSalmon|LightSalmon|Crimson|Red|FireBrick|DarkRed|Pink|LightPink|HotPink|DeepPink|MediumVioletRed|PaleVioletRed|LightSalmon|Coral|Tomato|OrangeRed|DarkOrange|Orange|Gold|Yellow|LightYellow|LemonChiffon|LightGoldenrodYellow|PapayaWhip|Moccasin|PeachPuff|PaleGoldenrod|Khaki|DarkKhaki|Lavender|Thistle|Plum|Violet|Orchid|Fuchsia|Magenta|MediumOrchid|MediumPurple|RebeccaPurple|BlueViolet|DarkViolet|DarkOrchid|DarkMagenta|Purple|Indigo|SlateBlue|DarkSlateBlue|MediumSlateBlue|GreenYellow|Chartreuse|LawnGreen|Lime|LimeGreen|PaleGreen|LightGreen|MediumSpringGreen|SpringGreen|MediumSeaGreen|SeaGreen|ForestGreen|Green|DarkGreen|YellowGreen|OliveDrab|Olive|DarkOliveGreen|MediumAquamarine|DarkSeaGreen|LightSeaGreen|DarkCyan|Teal|Aqua|Cyan|LightCyan|PaleTurquoise|Aquamarine|Turquoise|MediumTurquoise|DarkTurquoise|CadetBlue|SteelBlue|LightSteelBlue|PowderBlue|LightBlue|SkyBlue|LightSkyBlue|DeepSkyBlue|DodgerBlue|CornflowerBlue|MediumSlateBlue|RoyalBlue|Blue|MediumBlue|DarkBlue|Navy|MidnightBlue|Cornsilk|BlanchedAlmond|Bisque|NavajoWhite|Wheat|BurlyWood|Tan|RosyBrown|SandyBrown|Goldenrod|DarkGoldenrod|Peru|Chocolate|SaddleBrown|Sienna|Brown|Maroon|White|Snow|HoneyDew|MintCream|Azure|AliceBlue|GhostWhite|WhiteSmoke|SeaShell|Beige|OldLace|FloralWhite|Ivory|AntiqueWhite|Linen|LavenderBlush|MistyRose|Gainsboro|LightGray|Silver|DarkGray|Gray|DimGray|LightSlateGray|SlateGray|DarkSlateGray|Black)$/i;

  const checkForStyle = function(token) {
    let toStyle = "";
    const value = options.usesDtcg ? token.$value : token.value;
    if(value.match(colorRegex)) {
      if(token.path.indexOf('font')>-1) {
        toStyle += "color:" + value + ";";
      }
      else {
        toStyle += "background-color:" + value + ";";
      }
      if (token.attributes.font === 'inverse') {
        toStyle += "color:var(--color-font-inverse-base);";
      }
    }
    return toStyle;
  };

  const checkPropGetInverse = function (token) {
    if(token.path.indexOf('inverse')>-1) {
      return 'inverse';
    }
  };
%>
<html>
<head>
  <link rel="stylesheet" href="css/normalize.css">
  <link rel="stylesheet" href="css/fonts.css">
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/main.css">
</head>
<body>
  <div class="nav-bar">
    <div class="title">Style Guide</div>
    <div class="nav-search">
      <span>Search for</span>
      <input class="search-box" type="text" />
      <span>in </span>
      <label lass="search-modifier" for="use_path"><input class="search-modifier use_path" name="use_path" type="checkbox" checked />name</label>
      <label lass="search-modifier" for="use_value"><input class="search-modifier use_value" name="use_value" type="checkbox" checked />value</label>
      <label lass="search-modifier" for="use_attributes"><input class="search-modifier use_attributes" name="use_attributes" type="checkbox" checked />attributes</label>
    </div>
  </div>

  <div class="style-guide">
    <% _.each(allTokens, function(token) { %>
      <div class="style-guide-token <%= checkPropGetInverse(token) %>" data-path="<%= token.path.join("-") %>" style="<%= checkForStyle(token) %>">
        <div class="style-guide-token-path"><%= token.path.join(".") %></div>
        <div class="style-guide-token-name"><%= token.name %></div>
        <% if(token.attributes && JSON.stringify(token.attributes)!=="{}") { %>
          <div class="style-guide-token-attributes-control"></div>
        <% } %>
        <div class="style-guide-token-value"><%= options.usesDtcg ? token.$value : token.value %><% if(token.type === 'content' && token.attributes.type === 'icon') { %><i class="icon-font"><%= options.usesDtcg ? token.$value : token.value %></i><% } %></div>
        <% if(token.attributes && JSON.stringify(token.attributes)!=="{}") { %>
          <div class="style-guide-token-attributes"><%= JSON.stringify(token.attributes) %></div>
        <% } %>
      </div>
    <% }); %>
  </div>

  <script src="http://code.jquery.com/jquery-3.1.1.min.js"
  integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=" crossorigin="anonymous"></script>
  <script src="js/style-dictionary-properties.js"></script>
  <script src="js/main.js"></script>
</body>`;
