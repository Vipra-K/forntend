export default function SignedOutPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white border border-slate-200/70 rounded-2xl p-8 shadow-sm">
        <p className="text-xs font-black tracking-[0.25em] text-slate-400 uppercase">
          You are signed out
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">
          Session ended
        </h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Your session has been closed. You can safely close this tab
        </p>
      </div>
    </main>
  );
}
