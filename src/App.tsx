import Game from "@/components/Game/Game";
import NavigationBar from "@/components/NavigationBar/NavigationBar";
import AuthModal from "@/components/AuthModal/AuthModal";
import { AuthModalProvider } from "@/contexts/AuthModalProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useAuth } from "@/hooks/useAuth";

const AppContent = () => {
  const { checkAuth } = useAuth();
  const { isOpen, closeAuthModal } = useAuthModal();

  const handleAuthSuccess = () => {
    checkAuth();
    closeAuthModal();
  };

  return (
    <>
      <NavigationBar />
      <ErrorBoundary>
        <Game />
      </ErrorBoundary>
      <AuthModal
        open={isOpen}
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthModalProvider>
        <AppContent />
      </AuthModalProvider>
    </ErrorBoundary>
  );
}

export default App;
