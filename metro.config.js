const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@lottiefiles/dotlottie-react": path.resolve(__dirname, "scripts/dotlottie-stub.js"),
  "framer-motion": path.resolve(__dirname, "scripts/framer-motion-stub.js"),
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
