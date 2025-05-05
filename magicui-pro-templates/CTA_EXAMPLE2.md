import { Button } from "@/components/ui/button";
import Link from "next/link";
 
export function Component() {
  return (
    <section id="cta">
      <div className="container flex flex-col items-center justify-center gap-6 py-24 text-center md:py-32 lg:py-40">
        <div className="mx-auto space-y-4 py-6 text-center">
          <h2 className="font-mono text-[14px] font-medium tracking-tight text-primary">
            Call to Action
          </h2>
          <h4 className="mx-auto mb-2 max-w-3xl text-balance text-[42px] font-medium tracking-tighter">
            Elevate Your Online Presence
          </h4>
        </div>
        <p className="max-w-[650px] text-balance leading-normal text-muted-foreground md:text-xl lg:text-2xl">
          Unlock the power of our cutting-edge platform and take your website to
          new heights. Seamless integration, unparalleled performance, and
          unmatched scalability.
        </p>
        <div className="mt-8 flex gap-4">
          <Button asChild size="lg">
            <Link href="#" prefetch={false}>
              Get Started
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#" prefetch={false}>
              Learn More
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}