import Header from "@/components/Header";
import SearchSection from "@/components/SearchSection";
import MyLibrary from "@/components/MyLibrary";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <SearchSection />
        <MyLibrary />
      </main>
    </div>
  );
}
