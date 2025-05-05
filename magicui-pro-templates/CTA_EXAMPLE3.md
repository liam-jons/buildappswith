"use client";
 
import Link from "next/link";
import { useState } from "react";
 
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
 
export function Component() {
  const [agreed, setAgreed] = useState<boolean | "indeterminate">(false);
 
  return (
    <section id="cta">
      <div className="container w-full px-4 py-12 md:px-6 md:py-24 lg:py-32">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                UI Design for Web & Mobile Apps
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Effective marketing and advertising materials. It is also a
                great tool to use when you want to present your.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 min-[400px]:flex-row lg:flex-col">
            <div className="w-full space-y-4">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input
                    id="full-name"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Enter your email"
                    required
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" required type="password" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreed}
                    onCheckedChange={setAgreed}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Link href="#" className="text-primary underline">
                      Terms and Conditions
                    </Link>
                  </label>
                </div>
                <Button className="w-full" type="submit" disabled={!agreed}>
                  Sign up
                </Button>
              </form>
              <p className="text-center text-xs text-muted-foreground">
                By signing below, you agree to the Terms and Conditions.
              </p>
              <div className="flex justify-center">
                <Link
                  className="text-sm text-primary underline underline-offset-4"
                  href="#"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}