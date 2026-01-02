import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";



export function middleware(request: NextRequest) {
  const router = useRouter()
  const user = auth.currentUser
  if(!user){
    router.push("/login");
    return;

  }
  return NextResponse.next()
}


export const config = {
  matcher: ['/cart/:path']
}