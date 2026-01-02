"use client";

//import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";






export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        await signInWithEmailAndPassword(auth, email, password);
        // optional redirect
         router.push("/")
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };



  const router = useRouter();
  const goToSignup = () => {
  router.push("/signup"); // Navigate to signup page
};
 return (
   <section className="flex  w-full h-screen font-serif items-center justify-center bg-[#353c53]">
     <div className="w-[60%] h-[90%] relative left-[-50]">
       <Image
         src="/icons/auth-logo.png"
         alt="Hero Image"
         fill
         className="object-cover rounded-l-4xl h-[70%]"
       />
     </div>
     <Card className="w-[33%] h-[90%] absolute right-68 rounded-4xl">
       <CardHeader>
         <CardTitle>
           <Image
             src="/icons/prext-logo.png"
             alt="logo"
             width={100}
             height={100}
           />
         </CardTitle>
         <CardDescription></CardDescription>
       </CardHeader>
       <CardContent>
         <form onSubmit={handleSubmit}>
           <div className="flex flex-col gap-6">
             <div className="grid gap-2">
               <Label htmlFor="email">Email</Label>
               <Input
                 id="email"
                 type="email"
                 placeholder="m@example.com"
                 required
                 className="rounded-[30px]"
                 value={email}
                 onChange={(e) => {
                   setEmail(e.target.value);
                 }}
               />
             </div>
             <div className="grid gap-2">
               <Label htmlFor="password">Password</Label>
               <Input
                 id="password"
                 type="password"
                 className="rounded-[30px]"
                 value={password}
                 onChange={(e) => {
                   setPassword(e.target.value);
                 }}
                 required
               />
             </div>
             {error && <p className="text-red-500 text-sm">{error}</p>}
           </div>
           <CardFooter className="flex-col gap-2 mt-19">
             <Button
               type="submit"
               className="w-full rounded-[30px] cursor-pointer"
               disabled={loading}
             >
               {loading ? "Logging in..." : "Log in"}
             </Button>
             <Button
               variant="outline"
               className="w-full rounded-[30px] cursor-pointer"
             >
               Login with Google
             </Button>
             <CardAction className="flex items-center justify-center gap-1 pl-4 mt-[10%]">
               <p className="text-[#8e8d8d] text-sm">
                 Don&#39;t have an account?
               </p>
               <Button variant="link" onClick={goToSignup}>
                 Sign Up
               </Button>
             </CardAction>
           </CardFooter>
         </form>
       </CardContent>
     </Card>
   </section>
 );
}
export default Login
  