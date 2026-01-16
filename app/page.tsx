import HeroCarousel from './components/HeroCarousel'
import EventDetails from './components/EventDetails'
import NameSuggestionForm from './components/NameSuggestionForm'
import NameList from './components/NameList'

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroCarousel />
      <EventDetails />
      <NameSuggestionForm />
      <NameList />
    </main>
  )
}

