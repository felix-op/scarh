const nextConfig = {
	async redirects() {
		return [
			{
				source: '/',
				destination: '/auth/login',
				permanent: true,
			},
			{
				source: '/login',
				destination: '/auth/login',
				permanent: true,
			},
		];
	},
	images: {
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840, 5000],
	},
};

export default nextConfig;

