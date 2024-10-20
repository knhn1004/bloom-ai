/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Add this line:
	compiler: {
		// Enables the styled-components SWC transform
		styledComponents: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'firebasestorage.googleapis.com',
				port: '',
				pathname: '**/*',
			},
		],
	},
};

module.exports = nextConfig;
