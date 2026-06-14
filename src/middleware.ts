import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret });
  const role = (token?.role as string | undefined) ?? null;

  const wantsAuth = pathname.startsWith("/hesap");
  const wantsMerchant = pathname.startsWith("/satici") && !pathname.startsWith("/satici/kayit");
  const wantsAdmin = pathname.startsWith("/admin");

  if (wantsAdmin) {
    if (role !== "ADMIN") return redirectLogin(req);
  } else if (wantsMerchant) {
    if (role !== "MERCHANT" && role !== "ADMIN") return redirectLogin(req);
  } else if (wantsAuth) {
    if (!token) return redirectLogin(req);
  }

  return NextResponse.next();
}

function redirectLogin(req: NextRequest) {
  const url = new URL("/giris", req.url);
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/hesap/:path*", "/satici/:path*", "/admin/:path*"],
};
