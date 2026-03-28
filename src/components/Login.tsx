import { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithGoogle, signInWithGithub, signInWithEmailAndPassword, createUserWithEmailAndPassword, auth, db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, TrendingUp, Mail, Lock, Github, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL || '',
          role: 'user',
          createdAt: serverTimestamp()
        });
      }
      toast.success("Signed in with Google");
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      toast.error("Google sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithGithub();
      const user = result.user;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL || '',
          role: 'user',
          createdAt: serverTimestamp()
        });
      }
      toast.success("Signed in with GitHub");
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with GitHub. Note: You must enable GitHub Auth in the Firebase Console.');
      toast.error("GitHub sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(email, password);
        const user = result.user;
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.email?.split('@')[0] || 'User',
          role: 'user',
          createdAt: serverTimestamp()
        });
        toast.success("Account created successfully");
      } else {
        await signInWithEmailAndPassword(email, password);
        toast.success("Signed in successfully");
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}. Note: You must enable Email/Password Auth in the Firebase Console.`);
      toast.error(`${isSignUp ? 'Sign up' : 'Sign in'} failed`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-rose-600/10 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(99,102,241,0.4)]">
            <TrendingUp size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 font-display tracking-tight mb-2">
            ET Markets AI
          </h1>
          <p className="text-zinc-400 text-sm">Intelligence Layer for Indian Investors</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
            <p className="text-rose-400 text-sm leading-relaxed">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-zinc-800 flex-1" />
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Or continue with</span>
          <div className="h-px bg-zinc-800 flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            type="button"
            className="flex items-center justify-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-200 font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-70"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Google</span>
          </button>
          
          <button
            onClick={handleGithubLogin}
            disabled={isLoading}
            type="button"
            className="flex items-center justify-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-200 font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-70"
          >
            <Github className="w-5 h-5" />
            <span>GitHub</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            disabled={isLoading}
            type="button"
            className="flex items-center justify-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-200 font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-70"
          >
            <svg className="w-5 h-5 text-sky-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
            <span>Twitter</span>
          </button>
          
          <button
            disabled={isLoading}
            type="button"
            className="flex items-center justify-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-200 font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-70"
          >
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
            </svg>
            <span>LinkedIn</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
