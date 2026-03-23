import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth-options";

export default async function getToken() {
	const session = await getServerSession(authOptions);
	const accessToken = session?.user?.accessToken;

	return accessToken;
}
