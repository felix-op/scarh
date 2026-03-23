type getUrlOptions = {
	request: Request;
	context: { params: { path: string[] | undefined } };
	baseUrl?: string;
};

export default function getUrl({ request, context, baseUrl }: getUrlOptions) {
	const { params } = context;
	if (!params.path) {
		return null;
	}

	const path = params.path.join("/");
	const url = new URL(request.url);
	const searchParams = url.search;
	const finalUrl = `${baseUrl}/${path}/${searchParams}`;

	return finalUrl;
}
