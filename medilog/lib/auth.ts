import jwt from "jsonwebtoken";

interface DecodedToken {
	userId: string;
	email: string;
	iat: number;
	exp: number;
}

export async function verifyToken(
	token: string
): Promise<DecodedToken | null> {
	try {
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET!
		) as DecodedToken;
		return decoded;
	} catch (error) {
		console.error("Token verification failed:", error);
		return null;
	}
}

export function generateToken(payload: {
	userId: string;
	email: string;
}): string {
	return jwt.sign(payload, process.env.JWT_SECRET!, {
		expiresIn: "7d",
	});
}
