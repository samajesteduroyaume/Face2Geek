import Link from "next/link";
import { MainNav } from '@/components/main-nav'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#020617] selection:bg-purple-500/30">
      <MainNav />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-40">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>

          <div className="container px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-7xl">
                Code <span className="text-gradient">Faster</span>, Together
              </h1>
              <p className="mt-8 text-lg leading-8 text-slate-400">
                Face2Geek est le réseau social nouvelle génération pour les développeurs. Partagez vos snippets, testez vos idées et collaborez dans un environnement premium.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button size="lg" className="rounded-full px-8 bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/register">Commencer gratuitement</Link>
                </Button>
                <Link href="/explore" className="text-sm font-semibold leading-6 text-white hover:text-purple-400 transition-colors">
                  Explorer la communauté <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
            <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-24 sm:py-32">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-purple-400 uppercase tracking-widest">Fonctionnalités</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Le Scriptorium Moderne</p>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {[
              {
                title: "Snippets de Code",
                desc: "Partagez et découvrez des morceaux de code avec une coloration syntaxique de classe mondiale.",
                icon: <Icons.code className="h-6 w-6" />,
              },
              {
                title: "Live Playground",
                desc: "Exécutez vos idées directement dans le navigateur avec notre environnement de test intégré.",
                icon: <Icons.spinner className="h-6 w-6" />,
              },
              {
                title: "Communauté Geek",
                desc: "Rencontrez d'autres passionnés, échangez sur les dernières technos et collaborez sur des projets.",
                icon: <Icons.user className="h-6 w-6" />,
              },
            ].map((feature, i) => (
              <div key={i} className="glass-dark rounded-2xl p-8 hover:bg-white/5 transition-all duration-300 hover:-translate-y-1">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400 ring-1 ring-purple-600/40">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold leading-7 text-white">{feature.title}</h3>
                <p className="mt-4 text-base leading-7 text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-slate-950/50 py-12">
        <div className="container flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Icons.code className="h-6 w-6 text-purple-500" />
            <span className="font-bold">Face2Geek</span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Face2Geek. Fait par des geeks, pour des geeks.
          </p>
        </div>
      </footer>
    </div>
  )
}
