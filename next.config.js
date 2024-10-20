/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Add this line:
	compiler: {
		// Enables the styled-components SWC transform
		styledComponents: true,
	},
	images: {
		domains: ['res.cloudinary.com'],
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
