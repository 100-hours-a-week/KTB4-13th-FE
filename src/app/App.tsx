import { AppLayout } from "@/app/layouts/AppLayout";
import { Router } from "@/app/router/Router";
import { AuthProvider } from "@/features/auth/context/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <Router />
      </AppLayout>
    </AuthProvider>
  );
}

export default App;
