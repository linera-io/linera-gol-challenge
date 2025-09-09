import { Routes, Route } from "react-router-dom";
import clsx from "clsx";
import { Providers } from "./providers";
import { fontSans } from "./config/fonts";
import { PuzzleGame } from "./components/puzzles/PuzzleGame";
import { LoadingScreen } from "./components/common/LoadingScreen";
import { useLineraInitialization } from "./lib/linera/hooks/useLineraQueries";

function AppContent() {
  const { data: isInitialized, isLoading } = useLineraInitialization();

  if (isLoading || !isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<PuzzleGame />} />
    </Routes>
  );
}

function App() {
  return (
    <div
      className={clsx(
        "min-h-screen text-gray-900 bg-white font-sans antialiased h-auto",
        fontSans.variable
      )}
    >
      <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
        <div className="relative flex flex-col h-screen">
          <AppContent />
        </div>
      </Providers>
    </div>
  );
}

export default App;
