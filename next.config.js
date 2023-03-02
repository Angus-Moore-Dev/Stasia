/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	images: {
		minimumCacheTTL: 60,
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**'
			},
		]
	},
}

module.exports = nextConfig
