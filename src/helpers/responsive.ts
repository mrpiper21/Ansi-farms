import { Platform, Dimensions, PixelRatio } from "react-native";

// Constants for easier reference
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IS_IOS = Platform.OS === "ios";

// Helper class
class Responsive {
	getPlatform = () => {
		const platform = Platform.select({
			ios: "ios",
			android: "android",
			web: "web",
		});
		return platform;
	};

	getScreenDimensions = () => ({
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
	});

	getResponsiveFontSize = (baseFontSize = 16, multiplier = 0.05) => {
		return baseFontSize + SCREEN_WIDTH * multiplier;
	};

	Dh = (percentage: any) => {
		return SCREEN_HEIGHT * (percentage / 100);
	};
	Dw = (percentage: any) => {
		return SCREEN_WIDTH * (percentage / 100);
	};

	getPixelRatio = () => {
		return PixelRatio.get();
	};
}

export default new Responsive();