import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, BarChart3, Calendar, Target } from 'lucide-react'
import { IconWrapper } from '@/components/shared/IconWrapper'
import { AnimatedIcon, TradingIcons } from '@/components/shared/AnimatedIcon'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">TradingJournal</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button>Commencer gratuitement</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative">
        {/* Effet de brillance en arrière-plan */}
        <div className="absolute inset-0 opacity-30 blur-3xl">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/20 rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="animate-float">
              <AnimatedIcon icon={TradingIcons.rocket} size={80} />
            </div>
          </div>
          
          <h2 className="text-5xl font-bold mb-6">
            Votre journal de trading professionnel
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Suivez, analysez et améliorez vos performances de trading avec notre plateforme complète
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2 group">
                Commencer maintenant 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">
          Fonctionnalités principales
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            iconWrapper={<IconWrapper icon={TrendingUp} variant="3d" size="lg" />}
            title="Gestion des trades"
            description="Enregistrez et suivez tous vos trades avec des détails complets"
          />
          <FeatureCard
            iconWrapper={<IconWrapper icon={BarChart3} variant="glow" size="lg" />}
            title="Analyses avancées"
            description="Visualisez vos performances avec des graphiques et statistiques détaillées"
          />
          <FeatureCard
            iconWrapper={<IconWrapper icon={Calendar} variant="gradient" size="lg" />}
            title="Journal psychologique"
            description="Suivez votre état mental et vos émotions pour mieux trader"
          />
          <FeatureCard
            iconWrapper={<IconWrapper icon={Target} variant="3d" size="lg" />}
            title="Plans & Objectifs"
            description="Définissez et suivez vos objectifs de trading"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Prêt à améliorer vos performances ?
          </h3>
          <p className="text-xl text-muted-foreground mb-8">
            Rejoignez des milliers de traders qui utilisent TradingJournal
          </p>
          <Link href="/register">
            <Button size="lg">
              Commencer gratuitement
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 TradingJournal. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ iconWrapper, title, description }: { iconWrapper: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group p-6 rounded-2xl border-2 border-border/50 bg-card/80 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 hover:border-primary/50">
      <div className="mb-4 flex justify-center">{iconWrapper}</div>
      <h4 className="text-xl font-semibold mb-2 text-center">{title}</h4>
      <p className="text-muted-foreground text-center text-sm">{description}</p>
    </div>
  )
}
