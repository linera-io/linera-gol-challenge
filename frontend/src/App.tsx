import { Routes, Route } from "react-router-dom";
import clsx from "clsx";
import { Providers } from "./providers";
import { fontSans } from "./config/fonts";
import { PuzzleGame } from "./components/puzzles/PuzzleGame";
import { LoadingScreen } from "./components/common/LoadingScreen";
import { useAuth } from "./lib/linera/hooks/useAuth";

function AppContent() {
  const {
    isLoading,
    isLoggedIn,
    isConnectedToLinera,
    isAppConnected,
    error,
    showConnectWallet,
    retryConnection,
  } = useAuth();

  // Show loading screen while Dynamic SDK loads or connecting to Linera
  if (isLoading) {
    return <LoadingScreen message="Connecting to wallet..." />;
  }

  // Show connect wallet screen if not logged in
  if (!isLoggedIn) {
    return (
      <LoadingScreen
        message="Please connect your wallet to continue"
        showConnectButton
        onConnect={showConnectWallet}
      />
    );
  }

  // Show connecting to Linera screen
  if (isLoggedIn && !isConnectedToLinera) {
    return (
      <LoadingScreen
        message="Connecting to Linera network..."
        error={error}
        onRetry={error ? retryConnection : undefined}
      />
    );
  }

  // Show setting up app screen
  if (isConnectedToLinera && !isAppConnected) {
    return (
      <LoadingScreen
        message="Setting up Game of Life..."
        error={error}
        onRetry={error ? retryConnection : undefined}
      />
    );
  }

  // Everything is ready, show the game
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
