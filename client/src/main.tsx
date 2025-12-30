import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import { registerSW } from 'virtual:pwa-register';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('새로운 버전이 있습니다. 업데이트하시겠습니까?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('앱이 오프라인에서 사용 가능합니다.');
  },
});

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster />
  </>
);
