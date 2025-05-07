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
         "
       >
         {/* Left: image */}
         <Image
           src="/banner.png"
           alt="Colorful abstract artfrontiers of imagination"
           width={1024}
           height={1536}
           className="object-cover w-full h-full rounded-l-lg"
         />

         {/* Right: content */}
         <div className="p-8 flex flex-col justify-between">
           {/* Close button */}
           <div className="flex justify-end">
             <AlertDialogCancel asChild className=" border-none shadow-none">
               <button aria-label="Close" type="button" onClick={handleClose}>
                 <X className="size-6" />
               </button>
             </AlertDialogCancel>
           </div>

           {/* Title / Copy */}
           <div>
             <AlertDialogTitle className="text-3xl font-bold mb-4">
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
             <p className="text-lg text-gray-700 mb-6">
               With the world's most advanced image models and regular updates
               with community-steered roadmaps
             </p>

             <div className="space-y-6">
               <div>
                 <h3 className="text-xl font-semibold mb-1">
                   Join our creative community
                 </h3>
                 <p className="text-gray-600 text-sm">
                   Hop in our group creation rooms or enjoy open access to
                   billions of images and prompts with daily trends and real-time
                   search
                 </p>
               </div>

               <div>
                 <h3 className="text-xl font-semibold mb-1">
                   Multiple tiers for everyone
                 </h3>
                 <p className="text-gray-600 text-sm">
                   Memberships start at $10/mo with a 20% discount on yearly
                   plans
                 </p>
               </div>
             </div>
           </div>

           {/* CTAs */}
           <div className="mt-8 space-y-3">
             <button
               type="button"
               onClick={() => {
                 /* your Join now logic */
               }}
               className="
                 w-full py-3 rounded-lg font-medium
                 bg-black text-white
                 hover:opacity-90
               "
             >
               Join now
             </button>
             <button
               type="button"
               onClick={() => {
                 /* your Look around logic */
               }}
               className="
                 w-full py-3 rounded-lg font-medium
                 border border-gray-300
                 hover:bg-gray-100
               "
             >
               Look around a bit
             </button>
           </div>

           {/* Footer link */}
           <div className=" text-center text-md text-gray-500">
             Already have a subscription?{" "}
             <Link
               href="/auth/sign-in"
               className="underline text-[#f25b44]"
               onClick={handleClose}
             >
               Link your accounts
             </Link>
           </div>
         </div>
       </AlertDialogContent>
     </AlertDialog>
   );
 };