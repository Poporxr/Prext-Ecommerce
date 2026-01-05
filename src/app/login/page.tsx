"use client";

//import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
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
      router.push("/");
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
    <section className="min-h-screen w-full bg-[#353c53] font-serif flex items-center justify-center px-2">
      <div className="grid w-full max-w-6xl grid-cols-1 md:grid-cols-2 bg-white backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        {/* LEFT: Brand / Image */}
        <div className="relative hidden md:block rounded-2xl">
          <Image
            src="/images/auth-logo.png"
            alt="Brand visual"
            fill
            className="object-cover "
            priority
          />
          {/* subtle overlay */}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* RIGHT: Auth Card */}
        <div className="flex items-center justify-center py-12 max-[446px]:py-4 px-6 max-[440px]:px-2">
          <Card className="w-full max-w-md border-none shadow-none bg-transparent">
            <CardHeader className="items-center text-center gap-2">
              <Image
                src="/images/prext-logo.png"
                alt="Prext logo"
                width={90}
                height={90}
              />
              <CardTitle className="text-2xl font-semibold">
                Welcome  back to Prext
              </CardTitle>
              <CardDescription className="text-gray-500">
                Login to continue shopping
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    className="rounded-full h-11"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    className="rounded-full h-11"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full h-11 text-sm font-medium"
                >
                  {loading ? "Logging in…" : "Log in"}
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  disabled={loading}
                  className="w-full rounded-full h-11 text-sm"
                >
                  Continue with Google
                </Button>
              </form>
            </CardContent>

            <CardFooter className="justify-center pt-6">
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?
                <Button variant="link" onClick={goToSignup} className="pl-1">
                  Sign up
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};
export default Login;
