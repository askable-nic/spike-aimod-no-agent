"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Deepgram } from "./Deepgram";

const ParamsWrapper = () => {
  const params = useSearchParams();
  const dgApiKey = params.get("dg-api-key");
  if (dgApiKey) {
    return <Deepgram dgApiKey={dgApiKey} />;
  }
  return (
    <form
      className="container max-w-xs mx-auto my-4 flex flex-col space-y-2"
      method="get"
    >
      <input
        type="text"
        className="input input-bordered w-full monospace"
        placeholder="Deepgram API Key"
        name="dg-api-key"
      />
      <button type="submit" className="btn">
        Submit
      </button>
    </form>
  );
};

export default function Page() {
  return <Suspense fallback={<div>Loading...</div>}><ParamsWrapper /></Suspense>;
}
