import React from "react";
import { X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose?: () => void;
}

export const BannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setIsMounted(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen ? isOpen : isMounted} onOpenChange={handleClose}>
      <AlertDialogContent
        aria-describedby="alert-dialog-description"
        className="
           max-w-5xl w-full
           grid grid-cols-1 md:grid-cols-2
           overflow-hidden rounded-lg
           bg-background border-border
         "
      >
        {/* Left: image */}
        <div className="relative h-full">
          <Image
            src="/banner.png"
            alt="Colorful abstract frontiers of imagination"
            width={1024}
            height={1536}
            className="object-cover w-full h-full rounded-l-lg"
            priority
          />
        </div>

        {/* Right: content */}
        <div className="p-8 flex flex-col justify-around">
          {/* Close button */}
          <div className="flex justify-end">
            <AlertDialogCancel
              asChild
              className=" text-muted-foreground hover:text-foreground"
            >
              <button aria-label="Close" type="button" onClick={handleClose}>
                <X className="size-6" />
              </button>
            </AlertDialogCancel>
          </div>

          {/* Title / Copy */}
          <div>
            <AlertDialogTitle className="text-3xl font-bold mb-4 text-foreground">
              Explore the Frontiers of Imagination
            </AlertDialogTitle>
            <AlertDialogDescription
              id="alert-dialog-description"
              aria-describedby="alert-dialog-description"
              className="sr-only hidden"
            >
              This dialog promotes joining a creative community and offers
              subscription tiers.
            </AlertDialogDescription>
            <p className="text-lg text-muted-foreground mb-6">
              With the world's most advanced image models and regular updates
              with community-steered roadmaps
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibol text-foreground mb-1">
                  Join our creative community
                </h3>
                <p className="text-muted-foreground text-sm">
                  Hop in our group creation rooms or enjoy open access to
                  billions of images and prompts with daily trends and real-time
                  search
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-1 text-foreground">
                  Multiple tiers for everyone
                </h3>
                <p className="text-muted-foreground text-sm">
                  Memberships start at $25/month with a 20% discount on yearly
                  plans
                </p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 space-y-4">
            <Button
              asChild
              className="
                 w-full rounded-lg font-medium h-12
               "
            >
              <Link href="/subscription" className="h-12" onClick={handleClose}>
                Subscribe now
              </Link>
            </Button>
            <Button
              asChild
              variant={"outline"}
              className="
                 w-full rounded-lg font-medium h-12 border-border hover:bg-accent
               "
            >
              <Link href="/" className=" " onClick={handleClose}>
                Look around a bit
              </Link>
            </Button>
          </div>

          {/* Footer link */}
          <div className=" text-center text-md text-muted-foreground">
            Already have a subscription?{" "}
            <Link
              href="/auth/sign-in"
              className="underline text-[#f25b44] hover:text-[#f25b44]/80"
              onClick={handleClose}
            >
              Link your accounts
            </Link>
          </div>
          <div className=" text-center text-md text-muted-foreground">
            New to our platform?{" "}
            <Link
              href="/auth/sign-in"
              className="underline text-primary hover:text-primary/80"
              onClick={handleClose}
            >
              Register for free
            </Link>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
