import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import ReviewApp from "./ReviewApp";

export default function App() {
  return (
    <>
      <SignedIn>
        <ReviewApp />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}