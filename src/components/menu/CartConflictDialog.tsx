import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCart } from "@/lib/store/cart";

export function CartConflictDialog() {
  const pending = useCart((s) => s.pendingAdd);
  const confirm = useCart((s) => s.confirmReplace);
  const cancel = useCart((s) => s.cancelReplace);

  return (
    <AlertDialog open={!!pending} onOpenChange={(v) => !v && cancel()}>
      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl">
            Start a new order?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed">
            Your cart has items from another restaurant. Clear it to add{" "}
            <span className="font-semibold text-foreground">{pending?.item.name}</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel className="h-11 rounded-full">Keep current cart</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            className="h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Clear & add
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
