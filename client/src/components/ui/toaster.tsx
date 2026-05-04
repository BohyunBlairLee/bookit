import { useToast } from "@/hooks/use-toast"
import { X, CheckCircle } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(function ({ id, title, description, open }) {
        if (!open) return null
        return (
          <div
            key={id}
            className="bg-white rounded-full shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-3 animate-in slide-in-from-bottom-5"
          >
            <CheckCircle size={20} className="text-primary flex-shrink-0" />
            <span className="text-sm font-medium flex-1 truncate">
              {title}
            </span>
            <button
              onClick={() => dismiss(id)}
              className="text-gray-400 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
