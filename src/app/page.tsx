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
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">TradingJournal</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full sm:w-auto">Connexion</Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Commencer gratuitement</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 text-center relative">
        {/* Effet de brillance en arrière-plan */}
        <div className="absolute inset-0 opacity-30 blur-3xl overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-primary/30 rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-primary/20 rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="animate-float">
              <AnimatedIcon 
                icon={TradingIcons.rocket} 
                size={60} 
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" 
              />
            </div>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-4">
            Votre journal de trading professionnel
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Suivez, analysez et améliorez vos performances de trading avec notre plateforme complète
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 group w-full sm:w-auto">
                Commencer maintenant 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-12 sm:py-20">
        <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 px-4">
          Fonctionnalités principales
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
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
      <section className="bg-primary/5 py-12 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 px-4">
            Prêt à améliorer vos performances ?
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
            Rejoignez des milliers de traders qui utilisent TradingJournal
          </p>
          <Link href="/register" className="inline-block">
            <Button size="lg" className="w-full sm:w-auto">
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
    <div className="group p-4 sm:p-6 rounded-2xl border-2 border-border/50 bg-card/80 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 hover:border-primary/50">
      <div className="mb-3 sm:mb-4 flex justify-center">{iconWrapper}</div>
      <h4 className="text-lg sm:text-xl font-semibold mb-2 text-center">{title}</h4>
      <p className="text-muted-foreground text-center text-sm sm:text-base">{description}</p>
    </div>
  )
}
