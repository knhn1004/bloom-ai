/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Add this line:
	compiler: {
		// Enables the styled-components SWC transform
		styledComponents: true,
	},
};

module.exports = nextConfig;
