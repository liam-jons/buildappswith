import Image from 'next/image';

export default function ClientSection() {
  return (
    <section
      id="clients"
      className="text-center mx-auto max-w-[80rem] px-6 md:px-8"
    >
      <div className="py-14">
        <div className="mx-auto max-w-screen-xl px-4 md:px-8">
          <h2 className="text-center text-lg font-semibold text-gray-600">
          BUILDING A TRUSTED ECOSYSTEM FOR AI LITERACY
          </h2>
          <div className="mt-6">
            <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16 [&_path]:fill-current dark:[&_path]:fill-white">
              <li>
                <Image
                  src="https://cdn.magicui.design/companies/Google.svg"
                  alt="Google logo"
                  width={112}
                  height={32}
                  className="h-8 w-28 px-2 dark:brightness-0 dark:invert"
                />
              </li>
              <li>
                <Image
                  src="https://cdn.magicui.design/companies/Microsoft.svg"
                  alt="Microsoft logo"
                  width={112}
                  height={32}
                  className="h-8 w-28 px-2 dark:brightness-0 dark:invert"
                />
              </li>
              <li>
                <Image
                  src="https://cdn.magicui.design/companies/GitHub.svg"
                  alt="GitHub logo"
                  width={112}
                  height={32}
                  className="h-8 w-28 px-2 dark:brightness-0 dark:invert"
                />
              </li>
              <li>
                <Image
                  src="/logos/anthropic-logo.svg"
                  alt="Anthropic logo"
                  width={112}
                  height={32}
                  className="h-8 w-28 px-2 dark:brightness-0 dark:invert"
                />
              </li>
              <li>
                <Image
                  src="/logos/lovable-logo.svg"
                  alt="Lovable logo"
                  width={112}
                  height={32}
                  className="h-8 w-28 px-2 dark:brightness-0 dark:invert"
                />
              </li>
              <li>
                <Image
                  src="/logos/perplexity-logo.svg"
                  alt="Perplexity logo"
                  width={112}
                  height={32}
                  className="h-8 w-28 px-2 dark:brightness-0 dark:invert"
                />
              </li>
              <li>
                <Image
                  src="/logos/vercel-logo.svg"
                  alt="Vercel logo"
                  width={112}
                  height={32}
                  className="h-8 w-28 px-2 dark:brightness-0 dark:invert"
                />
              </li>
              <li>
                <Image
                  src="/logos/supabase-logo.svg"
                  alt="Supabase logo"
                  width={112}
                  height={32}
                  className="h-8 w-28 px-2 dark:brightness-0 dark:invert"
                />
              </li>
              <li>
                <Image
                  src="/logos/neon-logo.svg"
                  alt="Neon logo"
                  width={112}
                  height={32}
                  className="h-8 w-28 px-2 dark:brightness-0 dark:invert"
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}